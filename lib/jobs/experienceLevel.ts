import "server-only";
import { getRedis } from "@/lib/redis";
import { generateText } from "@/lib/ai/llm";
import { mapWithConcurrency } from "@/lib/jobs/concurrencyLimit";

export const NOT_SPECIFIED = "Not specified";

// Same TTL as the board cache (GREENHOUSE_CACHE_TTL_SECONDS in
// greenhouseClient.ts) — kept as an independent constant rather than a
// shared import so this file has no dependency on that one, but the two
// should be changed together.
const EXPERIENCE_CACHE_TTL_SECONDS = 60 * 60 * 2; // 2 hours

export function htmlToPlainText(html: string): string {
  return html
    .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

// Cheap, no-AI-call pass — ordered most-specific (numeric ranges) to
// least-specific (bare seniority keywords), since a concrete year count is
// more useful than "Senior" alone when both are present in the same JD.
const PATTERNS: { re: RegExp; label: (m: RegExpMatchArray) => string }[] = [
  { re: /(\d+)\s*\+\s*years?/i, label: (m) => `${m[1]}+ yrs` },
  { re: /(\d+)\s*(?:-|to)\s*(\d+)\s*years?/i, label: (m) => `${m[1]}-${m[2]} yrs` },
  { re: /(?:minimum|min\.?)\s+(?:of\s+)?(\d+)\s*years?/i, label: (m) => `${m[1]}+ yrs` },
  { re: /at\s+least\s+(\d+)\s*years?/i, label: (m) => `${m[1]}+ yrs` },
  { re: /\b(\d+)\s*years?\s+(?:of\s+)?experience/i, label: (m) => `${m[1]}+ yrs` },
  { re: /\b(entry[- ]level|fresher|no experience required)\b/i, label: () => "Entry level" },
  { re: /\b(junior)\b/i, label: () => "Junior" },
  { re: /\b(staff|principal)\b/i, label: () => "Lead+" },
  { re: /\b(lead)\b/i, label: () => "Lead+" },
  { re: /\b(senior|sr\.)\b/i, label: () => "Senior" },
  { re: /\b(mid[- ]level|intermediate)\b/i, label: () => "Mid level" },
];

export function extractExperienceLevelRegex(plainText: string): string | null {
  for (const { re, label } of PATTERNS) {
    const match = plainText.match(re);
    if (match) return label(match);
  }
  return null;
}

async function extractExperienceLevelWithGemini(plainText: string): Promise<string | null> {
  const prompt = `
Read this job description and identify the required years of experience or
seniority level, if one is stated or clearly implied.

JOB DESCRIPTION:
${plainText.slice(0, 4000)}

RULES:
- Respond with a short label only: e.g. "3+ yrs", "3-5 yrs", "Entry level", "Senior", "Lead+", "Mid level".
- If the description does not state or clearly imply an experience level, respond with exactly: none

Respond with ONLY the label or the word "none" — no other text, no punctuation, no explanation.
`;

  try {
    const res = await generateText(prompt);
    const trimmed = res?.trim();
    if (!trimmed || /^none$/i.test(trimmed)) return null;
    // Guard against the model ignoring the "short label only" instruction —
    // a long, sentence-shaped response is more useful as "Not specified"
    // than shown verbatim in a dense table cell.
    if (trimmed.length > 24) return null;
    return trimmed;
  } catch (error) {
    console.error("Gemini experience-level fallback failed:", error);
    return null;
  }
}

// Cache key is board+job scoped, NOT per-user — an experience level is a
// property of the job itself, so it's computed at most once per job per
// cache period across every user of the app, not once per user.
function cacheKey(jobKey: string) {
  return `job-experience:${jobKey}`;
}

// `jobKey` should be the same stable id used elsewhere for this job
// (`${boardToken}:${greenhouseJobId}`). Regex runs first and is free; the
// Gemini fallback only fires when regex finds nothing, and either way the
// resolved value is cached so a given job is processed at most once per
// EXPERIENCE_CACHE_TTL_SECONDS, not on every page view.
export async function resolveExperienceLevel(jobKey: string, plainText: string): Promise<string> {
  const redis = getRedis();
  const key = cacheKey(jobKey);

  if (redis) {
    const cached = await redis.get<string>(key);
    if (cached) return cached;
  }

  let level = extractExperienceLevelRegex(plainText);
  if (!level) {
    level = await extractExperienceLevelWithGemini(plainText);
  }

  const resolved = level ?? NOT_SPECIFIED;

  if (redis) {
    await redis.set(key, resolved, { ex: EXPERIENCE_CACHE_TTL_SECONDS });
  }

  return resolved;
}

// Filtering by experience level (added after the initial design, which
// only ever resolved the current page's ~15 jobs) needs every job's level
// known before pagination — so this now runs across a whole board's job
// list rather than just the displayed page. Verified live against real
// data (25 boards, ~3,900 jobs): regex alone resolves ~93% of jobs with
// zero AI calls, but the ~7% that fall through were enough — uncapped — to
// blow through the AI provider's per-minute token limit on a cold cache
// (confirmed: hit OpenAI 429s in testing). MAX_GEMINI_CALLS_PER_BATCH
// bounds that hard, regardless of how many boards/jobs are configured.
const GEMINI_CONCURRENCY = 5;
const MAX_GEMINI_CALLS_PER_BATCH = 40;

export async function resolveExperienceLevelsForJobs(
  jobs: { id: string; jobDescriptionPlain: string }[],
): Promise<Map<string, string>> {
  const result = new Map<string, string>();
  if (jobs.length === 0) return result;

  const redis = getRedis();
  const keys = jobs.map((j) => cacheKey(j.id));

  const cachedValues = redis && jobs.length > 0 ? await redis.mget<(string | null)[]>(...keys) : null;

  const uncached: { id: string; jobDescriptionPlain: string }[] = [];
  jobs.forEach((job, i) => {
    const cached = cachedValues?.[i];
    if (cached) {
      result.set(job.id, cached);
    } else {
      uncached.push(job);
    }
  });

  const resolvedByRegex: { id: string; jobDescriptionPlain: string }[] = [];
  const needsAi: { id: string; jobDescriptionPlain: string }[] = [];
  for (const job of uncached) {
    const regexLevel = extractExperienceLevelRegex(job.jobDescriptionPlain);
    if (regexLevel) {
      result.set(job.id, regexLevel);
      resolvedByRegex.push(job);
    } else {
      needsAi.push(job);
    }
  }

  // Only the first MAX_GEMINI_CALLS_PER_BATCH get an actual AI attempt this
  // call. The rest show "Not specified" in THIS response but are
  // deliberately left out of the Redis write below — uncached, not
  // permanently mis-labeled — so a later call (another user's page view,
  // or the next time this board's cache repopulates) gets a fresh shot at
  // them instead of trusting a value that was never actually computed.
  const toAttempt = needsAi.slice(0, MAX_GEMINI_CALLS_PER_BATCH);
  const skipped = needsAi.slice(MAX_GEMINI_CALLS_PER_BATCH);
  for (const job of skipped) {
    result.set(job.id, NOT_SPECIFIED);
  }

  const aiResults = await mapWithConcurrency(toAttempt, GEMINI_CONCURRENCY, async (job) => {
    const level = (await extractExperienceLevelWithGemini(job.jobDescriptionPlain)) ?? NOT_SPECIFIED;
    return { id: job.id, level };
  });
  for (const { id, level } of aiResults) {
    result.set(id, level);
  }

  if (redis) {
    const toWrite = [...resolvedByRegex, ...toAttempt];
    await Promise.all(
      toWrite.map((job) => redis.set(cacheKey(job.id), result.get(job.id)!, { ex: EXPERIENCE_CACHE_TTL_SECONDS })),
    );
  }

  return result;
}
