import { randomUUID } from "crypto";
import { callAiGateway } from "./gateway";
import { jobAnalyzeSchema } from "./schemas";
import { buildAnalyzeJdPrompt } from "./buildAnalyzeJdPrompt";
import { parseBulletTarget, FALLBACK_SKILL_CATEGORY } from "@/lib/ats/applySuggestion";

export type AtsSuggestionType = "add_skill" | "rewrite_bullet" | "add_bullet";

export interface AtsSuggestion {
  id: string;
  type: AtsSuggestionType;
  reason: string;
  targetField: string;
  // Only meaningful for "add_skill" — which existing (or new) skill
  // category this should be filed under. See lib/ats/applySuggestion.ts.
  targetCategory?: string;
  currentValue?: string;
  suggestedValue: string;
}

export interface AnalyzeJdResult {
  score: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  suggestions: AtsSuggestion[];
}

interface GenerateAnalyzeJdParams {
  resume: string | object;
  jobDescription: string;
}

const MAX_SUGGESTIONS = 6;

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (v): v is string => typeof v === "string" && v.trim().length > 0,
  );
}

// Defensive by necessity, not paranoia: an LLM following the schema
// instructions in buildAnalyzeJdPrompt.ts can still return a targetField
// that doesn't exist in the resume, an add_skill pointed at a bullet, or a
// missing suggestedValue. Every suggestion that reaches the UI/apply layer
// (components/builder/ai/JobDescriptionAnalyzer.tsx, lib/ats/applySuggestion.ts)
// must already be structurally valid — invalid ones are dropped here rather
// than surfacing a broken "Apply" button.
function sanitizeSuggestions(value: unknown): AtsSuggestion[] {
  if (!Array.isArray(value)) return [];

  const suggestions: AtsSuggestion[] = [];

  for (const raw of value) {
    if (suggestions.length >= MAX_SUGGESTIONS) break;
    if (typeof raw !== "object" || raw === null) continue;

    const item = raw as Record<string, unknown>;
    const type = item.type;
    const suggestedValue = typeof item.suggestedValue === "string" ? item.suggestedValue.trim() : "";
    const reason = typeof item.reason === "string" ? item.reason.trim() : "";

    if (!suggestedValue) continue;

    if (type === "add_skill") {
      // Rule: add_skill always targets "skills", regardless of what the
      // model put in targetField — never trust it to have followed this.
      // targetCategory is validated only for shape here (non-empty string)
      // — whether it actually matches an existing category is resolved at
      // apply time in lib/ats/applySuggestion.ts, against the live resume
      // rather than this analysis-time snapshot.
      const targetCategory =
        typeof item.targetCategory === "string" && item.targetCategory.trim()
          ? item.targetCategory.trim()
          : FALLBACK_SKILL_CATEGORY;

      suggestions.push({
        id: randomUUID(),
        type: "add_skill",
        reason,
        targetField: "skills",
        targetCategory,
        suggestedValue,
      });
      continue;
    }

    if (type === "rewrite_bullet" || type === "add_bullet") {
      const targetField = typeof item.targetField === "string" ? item.targetField : "";
      const target = parseBulletTarget(targetField);
      if (!target) continue;

      // rewrite_bullet needs a specific bullet index; add_bullet targets
      // the list itself and must NOT have one.
      const hasIndex = target.bulletIndex !== null;
      if (type === "rewrite_bullet" && !hasIndex) continue;
      if (type === "add_bullet" && hasIndex) continue;

      suggestions.push({
        id: randomUUID(),
        type,
        reason,
        targetField,
        currentValue: typeof item.currentValue === "string" ? item.currentValue : undefined,
        suggestedValue,
      });
    }
  }

  return suggestions;
}

export async function generateAnalyzeJd(
  { resume, jobDescription }: GenerateAnalyzeJdParams,
  userId: string,
): Promise<AnalyzeJdResult> {
  const parsed = await callAiGateway({
    feature: "job.analyze",
    userId,
    input: { resume, jobDescription },
    promptBuilder: buildAnalyzeJdPrompt,
    outputSchema: jobAnalyzeSchema,
    freeText: [jobDescription, typeof resume === "string" ? resume : undefined],
  });

  return {
    score: Math.max(0, Math.min(100, Math.round(parsed.score))),
    matchedKeywords: toStringArray(parsed.matchedKeywords),
    missingKeywords: toStringArray(parsed.missingKeywords),
    suggestions: sanitizeSuggestions(parsed.suggestions),
  };
}
