import { callAiGateway } from "./gateway";
import { outreachScheduledEmailSchema } from "./schemas";
import { buildScheduledOutreachPrompt } from "./buildScheduledOutreachPrompt";
import type { ResumeContext } from "./formatResumeContext";

export interface ScheduledOutreachEmailResult {
  subject: string;
  body: string;
}

export async function generateScheduledOutreachEmail(
  params: {
    companyName: string;
    roleTitle: string;
    jobDescription: string;
    resumeContext: ResumeContext;
  },
  userId: string,
): Promise<ScheduledOutreachEmailResult> {
  const parsed = await callAiGateway({
    feature: "outreach.scheduledEmail",
    userId,
    input: params,
    promptBuilder: buildScheduledOutreachPrompt,
    outputSchema: outreachScheduledEmailSchema,
    freeText: [params.jobDescription],
  });

  const subject = parsed.subject.trim();
  const body = parsed.body.trim();

  if (!subject || !body) {
    throw new Error("AI response did not include both a subject and a body");
  }

  return { subject, body };
}
