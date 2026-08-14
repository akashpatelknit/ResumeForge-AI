import { generateText } from "./llm";
import { buildJobIdentityPrompt } from "./buildJobIdentityPrompt";

// Same strip-fences-then-parse pattern as generateColdEmails.ts / linkedin.ts
// — kept as a local copy rather than a shared import, matching how those do it.
function parseAIJson(text: string): unknown {
  const cleaned = text
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();

  return JSON.parse(cleaned);
}

export interface JobIdentityResult {
  companyName: string;
  roleTitle: string;
}

export async function extractJobIdentity(
  jobDescription: string,
): Promise<JobIdentityResult> {
  const prompt = buildJobIdentityPrompt({ jobDescription });

  const res = await generateText(prompt);
  if (!res) {
    throw new Error("AI response was empty");
  }

  const parsed = parseAIJson(res) as {
    companyName?: unknown;
    roleTitle?: unknown;
  };

  return {
    companyName:
      typeof parsed.companyName === "string" ? parsed.companyName.trim() : "",
    roleTitle:
      typeof parsed.roleTitle === "string" ? parsed.roleTitle.trim() : "",
  };
}
