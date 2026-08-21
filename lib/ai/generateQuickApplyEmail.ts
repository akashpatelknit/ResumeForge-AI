import { callAiGateway } from "./gateway";
import { outreachQuickApplyEmailSchema } from "./schemas";
import { buildColdApplicationPrompt } from "./buildColdApplicationPrompt";
import { buildReferralRequestPrompt } from "./buildReferralRequestPrompt";
import type { ResumeContext } from "./formatResumeContext";

export type QuickApplyMessageType = "cold_application" | "referral_request";

export interface QuickApplyEmailResult {
  subject: string;
  body: string;
}

interface GenerateQuickApplyEmailParams {
  companyName: string;
  roleTitle: string;
  pastedContext?: string;
  resumeContext: ResumeContext;
  messageType: QuickApplyMessageType;
  jobId?: string;
}

// Referral Request only ever makes sense with a Job ID to reference — no
// Job ID falls back to the Cold Application template, mirroring the
// QuickApplyModal toggle's own auto-fallback behavior (see section 1 of
// its selector logic) rather than sending a referral email missing its
// one defining field.
function buildQuickApplyEmailPrompt(params: GenerateQuickApplyEmailParams): string {
  return params.messageType === "referral_request" && params.jobId
    ? buildReferralRequestPrompt({
        companyName: params.companyName,
        roleTitle: params.roleTitle,
        jobId: params.jobId,
        pastedContext: params.pastedContext,
        resumeContext: params.resumeContext,
      })
    : buildColdApplicationPrompt({
        companyName: params.companyName,
        roleTitle: params.roleTitle,
        pastedContext: params.pastedContext,
        resumeContext: params.resumeContext,
      });
}

export async function generateQuickApplyEmail(
  params: GenerateQuickApplyEmailParams,
  userId: string,
): Promise<QuickApplyEmailResult> {
  const parsed = await callAiGateway({
    feature: "outreach.quickApplyEmail",
    userId,
    input: params,
    promptBuilder: buildQuickApplyEmailPrompt,
    outputSchema: outreachQuickApplyEmailSchema,
    freeText: [params.pastedContext],
  });

  const subject = parsed.subject.trim();
  const body = parsed.body.trim();

  if (!subject || !body) {
    throw new Error("AI response did not include both a subject and a body");
  }

  return { subject, body };
}
