import { callAiGateway } from "./gateway";
import { resumeReadinessScoreSchema } from "./schemas";
import { buildReadinessScorePrompt } from "./buildReadinessScorePrompt";

export interface ReadinessScoreBreakdown {
  structure: number;
  formatting: number;
  completeness: number;
  keywordStrength: number;
}

// Matches the readinessScoreDetails JSON shape persisted on Resume /
// UploadedResume (prisma/schema.prisma) — analyzedAt is stamped here, not
// by the caller, so it always reflects when the AI call actually completed.
export interface ReadinessScoreDetails {
  score: number;
  breakdown: ReadinessScoreBreakdown;
  suggestions: string[];
  analyzedAt: string;
}

interface GenerateReadinessScoreParams {
  resume: string | object;
  // Optional — the score must remain meaningful with no JD at all, see
  // buildReadinessScorePrompt.ts.
  jobDescription?: string;
}

function clampScore(value: unknown): number {
  const n = typeof value === "number" && Number.isFinite(value) ? value : 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((v): v is string => typeof v === "string" && v.trim().length > 0)
    .map((v) => v.trim())
    .slice(0, 8);
}

export async function generateReadinessScore(
  { resume, jobDescription }: GenerateReadinessScoreParams,
  userId: string,
): Promise<ReadinessScoreDetails> {
  const parsed = await callAiGateway({
    feature: "resume.readiness_score",
    userId,
    input: { resume, jobDescription },
    promptBuilder: buildReadinessScorePrompt,
    outputSchema: resumeReadinessScoreSchema,
    freeText: [jobDescription, typeof resume === "string" ? resume : undefined],
  });

  return {
    score: clampScore(parsed.score),
    breakdown: {
      structure: clampScore(parsed.breakdown.structure),
      formatting: clampScore(parsed.breakdown.formatting),
      completeness: clampScore(parsed.breakdown.completeness),
      keywordStrength: clampScore(parsed.breakdown.keywordStrength),
    },
    suggestions: toStringArray(parsed.suggestions),
    analyzedAt: new Date().toISOString(),
  };
}
