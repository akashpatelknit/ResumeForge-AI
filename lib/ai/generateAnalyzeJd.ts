import { generateText } from "./llm";
import { buildAnalyzeJdPrompt } from "./buildAnalyzeJdPrompt";

// Same strip-fences-then-parse pattern as generateColdEmails.ts / linkedin.ts
// — kept as a local copy rather than a shared import, matching how those do it.
function parseAIJson(text: string): unknown {
  const cleaned = text
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();

  return JSON.parse(cleaned);
}

export interface AnalyzeJdResult {
  score: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  suggestions: string[];
}

interface GenerateAnalyzeJdParams {
  resume: string | object;
  jobDescription: string;
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (v): v is string => typeof v === "string" && v.trim().length > 0,
  );
}

export async function generateAnalyzeJd({
  resume,
  jobDescription,
}: GenerateAnalyzeJdParams): Promise<AnalyzeJdResult> {
  const prompt = buildAnalyzeJdPrompt({ resume, jobDescription });

  const res = await generateText(prompt);
  if (!res) {
    throw new Error("AI response was empty");
  }

  const parsed = parseAIJson(res) as {
    score?: unknown;
    matchedKeywords?: unknown;
    missingKeywords?: unknown;
    suggestions?: unknown;
  };

  if (typeof parsed.score !== "number" || Number.isNaN(parsed.score)) {
    throw new Error("AI response did not include a valid score");
  }

  return {
    score: Math.max(0, Math.min(100, Math.round(parsed.score))),
    matchedKeywords: toStringArray(parsed.matchedKeywords),
    missingKeywords: toStringArray(parsed.missingKeywords),
    suggestions: toStringArray(parsed.suggestions),
  };
}
