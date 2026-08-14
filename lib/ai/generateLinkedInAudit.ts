import { generateText } from "./llm";
import { buildLinkedInAuditPrompt } from "./buildLinkedInAuditPrompt";

// Same strip-fences-then-parse pattern as generateColdEmails.ts / linkedin.ts
// — kept as a local copy rather than a shared import, matching how those do it.
function parseAIJson(text: string): unknown {
  const cleaned = text
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();

  return JSON.parse(cleaned);
}

export interface LinkedInAuditResult {
  headlineScore: number;
  headlineSuggestions: string[];
  aboutSuggestions: string[];
  missingKeywords: string[];
  rewrittenHeadline?: string;
  rewrittenAbout?: string;
}

interface GenerateLinkedInAuditParams {
  headline: string;
  aboutSection: string;
  resume?: string | object;
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (v): v is string => typeof v === "string" && v.trim().length > 0,
  );
}

export async function generateLinkedInAudit({
  headline,
  aboutSection,
  resume,
}: GenerateLinkedInAuditParams): Promise<LinkedInAuditResult> {
  const prompt = buildLinkedInAuditPrompt({ headline, aboutSection, resume });

  const res = await generateText(prompt);
  if (!res) {
    throw new Error("AI response was empty");
  }

  const parsed = parseAIJson(res) as {
    headlineScore?: unknown;
    headlineSuggestions?: unknown;
    aboutSuggestions?: unknown;
    missingKeywords?: unknown;
    rewrittenHeadline?: unknown;
    rewrittenAbout?: unknown;
  };

  if (
    typeof parsed.headlineScore !== "number" ||
    Number.isNaN(parsed.headlineScore)
  ) {
    throw new Error("AI response did not include a valid headline score");
  }

  const hasResume = resume !== undefined && resume !== null;

  return {
    headlineScore: Math.max(0, Math.min(100, Math.round(parsed.headlineScore))),
    headlineSuggestions: toStringArray(parsed.headlineSuggestions),
    aboutSuggestions: toStringArray(parsed.aboutSuggestions),
    // Defensively cleared when no resume was given, regardless of what the
    // model returned — matches the API contract ("only populate if resumeId
    // was provided") rather than trusting the model to have honored it.
    missingKeywords: hasResume ? toStringArray(parsed.missingKeywords) : [],
    rewrittenHeadline:
      typeof parsed.rewrittenHeadline === "string" &&
      parsed.rewrittenHeadline.trim()
        ? parsed.rewrittenHeadline.trim()
        : undefined,
    rewrittenAbout:
      typeof parsed.rewrittenAbout === "string" &&
      parsed.rewrittenAbout.trim()
        ? parsed.rewrittenAbout.trim()
        : undefined,
  };
}
