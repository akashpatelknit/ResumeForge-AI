import "server-only";
import { getRedis } from "@/lib/redis";
import { GREENHOUSE_BOARDS, type GreenhouseBoard } from "@/lib/jobs/greenhouseBoards";
import { htmlToPlainText, resolveExperienceLevelsForJobs } from "@/lib/jobs/experienceLevel";
import { isTechnicalRole } from "@/lib/jobs/isTechnicalRole";
import type { NormalizedJob } from "@/lib/jobs/types";

// Board list changes should update this too (see experienceLevel.ts's
// matching constant) — kept independent rather than shared so each file
// has no import dependency on the other.
const GREENHOUSE_CACHE_TTL_SECONDS = 60 * 60 * 2; // 2 hours

interface GreenhouseJobRaw {
  id: number;
  title: string;
  updated_at: string;
  location?: { name?: string } | null;
  content?: string;
  requisition_id?: string | null;
  departments?: { id: number; name: string }[];
}

interface GreenhouseBoardResponse {
  jobs: GreenhouseJobRaw[];
}

function boardCacheKey(boardToken: string) {
  return `greenhouse:board:${boardToken}:jobs`;
}

// One board, cached independently of every other board — a slow/erroring
// board never blocks or invalidates another board's cached data, and a
// filter change that only touches already-cached boards costs zero
// Greenhouse API calls.
async function fetchBoardJobsRaw(board: GreenhouseBoard): Promise<GreenhouseJobRaw[]> {
  const redis = getRedis();
  const key = boardCacheKey(board.boardToken);

  if (redis) {
    const cached = await redis.get<GreenhouseJobRaw[]>(key);
    if (cached) return cached;
  }

  const url = `https://boards-api.greenhouse.io/v1/boards/${encodeURIComponent(board.boardToken)}/jobs?content=true`;

  let jobs: GreenhouseJobRaw[] = [];
  try {
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) {
      console.error(`Greenhouse fetch failed for board "${board.boardToken}": HTTP ${res.status}`);
      return [];
    }
    const data = (await res.json()) as GreenhouseBoardResponse;
    jobs = Array.isArray(data.jobs) ? data.jobs : [];
  } catch (error) {
    console.error(`Greenhouse fetch threw for board "${board.boardToken}":`, error);
    return [];
  }

  if (redis) {
    await redis.set(key, jobs, { ex: GREENHOUSE_CACHE_TTL_SECONDS });
  }

  return jobs;
}

function normalizeGreenhouseJob(board: GreenhouseBoard, raw: GreenhouseJobRaw): NormalizedJob {
  const html = raw.content ?? "";
  return {
    id: `${board.boardToken}:${raw.id}`,
    company: board.companyDisplayName,
    // Greenhouse's public jobs list endpoint doesn't return a logo URL —
    // the frontend falls back to the same initial-letter CompanyLogo
    // component the Cold Outreach table already uses, rather than a
    // fabricated image URL.
    companyLogoUrl: null,
    jobTitle: raw.title,
    location: raw.location?.name?.trim() || null,
    source: "greenhouse",
    requisitionId: raw.requisition_id ?? null,
    postedDate: raw.updated_at,
    jobDescriptionHtml: html,
    jobDescriptionPlain: htmlToPlainText(html),
    experienceLevel: "", // filled in below, after every board has been fetched
    roleType: raw.departments?.[0]?.name?.trim() || "Other",
    externalJobId: String(raw.id),
    boardToken: board.boardToken,
    isBookmarked: false,
    isQueued: false,
    savedJobId: null,
    contactEmails: [],
  };
}

export async function fetchAllGreenhouseJobs(): Promise<NormalizedJob[]> {
  const perBoard = await Promise.all(
    GREENHOUSE_BOARDS.map(async (board) => {
      const raw = await fetchBoardJobsRaw(board);
      return raw.map((job) => normalizeGreenhouseJob(board, job));
    }),
  );
  // Job Discovery is scoped to technical/engineering roles only — filtered
  // here, before experience-level resolution, so non-technical jobs (the
  // majority on a typical company board — sales, marketing, support, etc.)
  // never cost a regex/Gemini call in the first place, not just never get
  // displayed.
  const jobs = perBoard.flat().filter((j) => isTechnicalRole(j.jobTitle, j.roleType));

  // Filtering by experience level needs every job's level known up front,
  // not just whichever page is currently displayed — but this is still
  // "once per job per cache period", not once per request: the batch
  // resolver mgets every already-cached job in a single round trip, so a
  // warm cache costs one cheap Redis call regardless of board size.
  const levels = await resolveExperienceLevelsForJobs(
    jobs.map((j) => ({ id: j.id, jobDescriptionPlain: j.jobDescriptionPlain })),
  );
  for (const job of jobs) {
    job.experienceLevel = levels.get(job.id) ?? "Not specified";
  }

  return jobs;
}
