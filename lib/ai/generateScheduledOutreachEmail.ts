import { generateText } from "./llm";
import { buildScheduledOutreachPrompt } from "./buildScheduledOutreachPrompt";
import type { ResumeContext } from "./formatResumeContext";

// Same strip-fences-then-parse pattern as generateQuickApplyEmail.ts — kept
// as a local copy rather than a shared import, matching how those do it.
function parseAIJson(text: string): unknown {
  const cleaned = text
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();

  return JSON.parse(cleaned);
}

export interface ScheduledOutreachEmailResult {
  subject: string;
  body: string;
}

export async function generateScheduledOutreachEmail(params: {
  companyName: string;
  roleTitle: string;
  jobDescription: string;
  resumeContext: ResumeContext;
}): Promise<ScheduledOutreachEmailResult> {
  const prompt = buildScheduledOutreachPrompt(params);

  const res = await generateText(prompt);
  if (!res) {
    throw new Error("AI response was empty");
  }

  const parsed = parseAIJson(res) as { subject?: unknown; body?: unknown };

  const subject = typeof parsed.subject === "string" ? parsed.subject.trim() : "";
  const body = typeof parsed.body === "string" ? parsed.body.trim() : "";

  if (!subject || !body) {
    throw new Error("AI response did not include both a subject and a body");
  }

  return { subject, body };
}
