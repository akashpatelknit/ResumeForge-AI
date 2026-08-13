import { generateText } from "./llm";
import { buildSummaryPrompt } from "./buildSummaryPrompt";

// Same strip-fences-then-parse pattern as generateColdEmails.ts / linkedin.ts
// — kept as a local copy rather than a shared import, matching how those
// modules each keep their own copy.
function parseAIJson(text: string): unknown {
  const cleaned = text
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();

  return JSON.parse(cleaned);
}

interface ResumeContext {
  name?: string;
  targetRole?: string;
}

interface GenerateSummaryParams {
  // Both optional — rawInput may be left blank (falls back to polishing
  // existingSummary), and existingSummary may not exist yet for a brand
  // new resume. At least one of the two must be present.
  rawInput?: string;
  existingSummary?: string;
  resumeContext?: ResumeContext;
}

export async function generateSummary({
  rawInput,
  existingSummary,
  resumeContext,
}: GenerateSummaryParams): Promise<string> {
  if (!rawInput?.trim() && !existingSummary?.trim()) {
    throw new Error(
      "Nothing to generate from — add some notes, paste a job description, or write a summary first",
    );
  }

  const prompt = buildSummaryPrompt({ rawInput, existingSummary, resumeContext });

  const res = await generateText(prompt);
  if (!res) {
    throw new Error("AI response was empty");
  }

  const parsed = parseAIJson(res) as { summary?: unknown };
  if (typeof parsed.summary !== "string" || !parsed.summary.trim()) {
    throw new Error("AI response did not include a summary");
  }

  return parsed.summary.trim();
}
