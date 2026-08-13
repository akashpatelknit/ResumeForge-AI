import { generateText } from "./llm";
import { buildCoverLetterPrompt } from "./buildCoverLetterPrompt";

// Same strip-fences-then-parse pattern as generateColdEmails.ts / linkedin.ts
// — kept as a local copy rather than a shared import, matching how those do it.
function parseAIJson(text: string): unknown {
  const cleaned = text
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();

  return JSON.parse(cleaned);
}

interface GenerateCoverLetterParams {
  resume: string | object;
  jobDescription?: string | object;
  tone?: string;
}

export async function generateCoverLetter({
  resume,
  jobDescription,
  tone,
}: GenerateCoverLetterParams): Promise<string> {
  const prompt = buildCoverLetterPrompt({ resume, jobDescription, tone });

  const res = await generateText(prompt);
  if (!res) {
    throw new Error("AI response was empty");
  }

  const parsed = parseAIJson(res) as { coverLetter?: unknown };

  if (typeof parsed.coverLetter !== "string" || !parsed.coverLetter.trim()) {
    throw new Error("AI response did not include a cover letter");
  }

  return parsed.coverLetter.trim();
}
