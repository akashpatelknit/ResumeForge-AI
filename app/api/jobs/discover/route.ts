import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { fetchAllGreenhouseJobs } from "@/lib/jobs/greenhouseClient";
import { resolveExperienceLevelsForJobs } from "@/lib/jobs/experienceLevel";
import type { NormalizedJob } from "@/lib/jobs/types";

const DEFAULT_PAGE_SIZE = 15;

function toNormalizedManualJob(row: {
  id: string;
  company: string;
  jobTitle: string;
  location: string | null;
  jobDescription: string;
  requisitionId: string | null;
  addedAt: Date;
  isBookmarked: boolean;
  isQueued: boolean;
  contactEmails: string[];
}): NormalizedJob {
  return {
    id: row.id,
    company: row.company,
    companyLogoUrl: null,
    jobTitle: row.jobTitle,
    location: row.location,
    source: "manual",
    requisitionId: row.requisitionId,
    postedDate: row.addedAt.toISOString(),
    jobDescriptionHtml: row.jobDescription,
    jobDescriptionPlain: row.jobDescription,
    experienceLevel: "",
    roleType: "Other",
    externalJobId: null,
    boardToken: null,
    isBookmarked: row.isBookmarked,
    isQueued: row.isQueued,
    savedJobId: row.id,
    contactEmails: row.contactEmails,
  };
}

export async function GET(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const params = request.nextUrl.searchParams;
  const company = params.get("company")?.trim() || "all";
  const location = params.get("location")?.trim() || "all";
  const source = params.get("source")?.trim() || "all";
  const roleType = params.get("roleType")?.trim() || "all";
  const experienceLevel = params.get("experienceLevel")?.trim() || "all";
  const search = params.get("search")?.trim().toLowerCase() || "";
  const postedWithinDays = Number(params.get("postedWithinDays")) || 0;
  const page = Math.max(1, Number(params.get("page")) || 1);
  const pageSize = Math.min(50, Math.max(1, Number(params.get("pageSize")) || DEFAULT_PAGE_SIZE));

  // Live-fetched (Redis-cached, experience-level-annotated) Greenhouse
  // jobs, merged with this user's own manually-added jobs. Other users'
  // manual jobs are never queried here — the `userId` filter below is the
  // actual enforcement, not just the UI hiding them.
  const [greenhouseJobs, manualRows, savedRows] = await Promise.all([
    fetchAllGreenhouseJobs(),
    prisma.savedJob.findMany({ where: { userId, source: "manual" }, orderBy: { addedAt: "desc" } }),
    prisma.savedJob.findMany({ where: { userId, source: "greenhouse" } }),
  ]);

  const savedByExternalId = new Map(savedRows.map((row) => [row.externalJobId, row]));

  const annotatedGreenhouseJobs: NormalizedJob[] = greenhouseJobs.map((job) => {
    const saved = job.externalJobId ? savedByExternalId.get(job.externalJobId) : undefined;
    return saved
      ? {
          ...job,
          isBookmarked: saved.isBookmarked,
          isQueued: saved.isQueued,
          savedJobId: saved.id,
          contactEmails: saved.contactEmails,
        }
      : job;
  });

  // Manual jobs are per-user and typically few, so resolving their
  // experience level per-request (rather than cache-bound like the shared
  // Greenhouse set) is cheap — still goes through the same regex-first,
  // Redis-cached-per-job path, just called for a small list.
  const manualJobsRaw = manualRows.map(toNormalizedManualJob);
  const manualLevels = await resolveExperienceLevelsForJobs(
    manualJobsRaw.map((j) => ({ id: j.id, jobDescriptionPlain: j.jobDescriptionPlain })),
  );
  const manualJobs = manualJobsRaw.map((j) => ({ ...j, experienceLevel: manualLevels.get(j.id) ?? "Not specified" }));

  let merged: NormalizedJob[] = [...annotatedGreenhouseJobs, ...manualJobs];

  // Filter option lists are computed from the full merged set (before the
  // filters below are applied) so choosing one filter never makes another
  // dropdown's options disappear.
  const filterOptions = {
    companies: uniqueSorted(merged.map((j) => j.company)),
    locations: uniqueSorted(merged.map((j) => j.location).filter((v): v is string => !!v)),
    roleTypes: uniqueSorted(merged.map((j) => j.roleType)),
    experienceLevels: uniqueSorted(merged.map((j) => j.experienceLevel)),
  };

  if (company !== "all") merged = merged.filter((j) => j.company.toLowerCase() === company.toLowerCase());
  // Substring, not exact match — location strings are city-level ("Bengaluru,
  // India", "Remote (India)"), so this is what lets a country-level value
  // like "India" (the default — see the frontend) match any of them.
  if (location !== "all") merged = merged.filter((j) => j.location?.toLowerCase().includes(location.toLowerCase()));
  if (source !== "all") merged = merged.filter((j) => j.source === source);
  if (roleType !== "all") merged = merged.filter((j) => j.roleType.toLowerCase() === roleType.toLowerCase());
  if (experienceLevel !== "all") {
    merged = merged.filter((j) => j.experienceLevel.toLowerCase() === experienceLevel.toLowerCase());
  }
  if (search) {
    merged = merged.filter(
      (j) => j.jobTitle.toLowerCase().includes(search) || j.company.toLowerCase().includes(search),
    );
  }
  if (postedWithinDays > 0) {
    const cutoff = Date.now() - postedWithinDays * 24 * 60 * 60 * 1000;
    merged = merged.filter((j) => new Date(j.postedDate).getTime() >= cutoff);
  }

  merged.sort((a, b) => new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime());

  const total = merged.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageSlice = merged.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const queueCount = await prisma.savedJob.count({ where: { userId, isQueued: true } });

  return NextResponse.json({
    jobs: pageSlice,
    total,
    page: currentPage,
    pageSize,
    totalPages,
    queueCount,
    filterOptions,
  });
}

function uniqueSorted(values: string[]): string[] {
  return Array.from(new Set(values)).sort((a, b) => a.localeCompare(b));
}
