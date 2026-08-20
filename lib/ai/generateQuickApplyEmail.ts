import { generateText } from "./llm";
import { buildColdApplicationPrompt } from "./buildColdApplicationPrompt";
import { buildReferralRequestPrompt } from "./buildReferralRequestPrompt";
import type { ResumeContext } from "./formatResumeContext";

// Same strip-fences-then-parse pattern as generateColdEmails.ts — kept as a
// local copy rather than a shared import, matching how those do it.
function parseAIJson(text: string): unknown {
  const cleaned = text
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();

  return JSON.parse(cleaned);
}

export type QuickApplyMessageType = "cold_application" | "referral_request";

export interface QuickApplyEmailResult {
  subject: string;
  body: string;
}

export async function generateQuickApplyEmail(params: {
  companyName: string;
  roleTitle: string;
  pastedContext?: string;
  resumeContext: ResumeContext;
  messageType: QuickApplyMessageType;
  jobId?: string;
}): Promise<QuickApplyEmailResult> {
  const { companyName, roleTitle, pastedContext, resumeContext, messageType, jobId } = params;

  // Referral Request only ever makes sense with a Job ID to reference — no
  // Job ID falls back to the Cold Application template, mirroring the
  // QuickApplyModal toggle's own auto-fallback behavior (see section 1 of
  // its selector logic) rather than sending a referral email missing its
  // one defining field.
  const prompt =
    messageType === "referral_request" && jobId
      ? buildReferralRequestPrompt({ companyName, roleTitle, jobId, pastedContext, resumeContext })
      : buildColdApplicationPrompt({ companyName, roleTitle, pastedContext, resumeContext });

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
