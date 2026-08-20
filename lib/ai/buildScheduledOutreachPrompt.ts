import { formatCandidateContext, type ResumeContext } from "./formatResumeContext";

interface BuildScheduledOutreachPromptParams {
  companyName: string;
  roleTitle: string;
  jobDescription: string;
  resumeContext: ResumeContext;
}

// Used by the "Schedule Outreach" cron sender (app/api/cron/process-outreach-queue)
// to generate a personalized email per queued job against its full JD — unlike
// Quick Apply's exact-template prompts (buildColdApplicationPrompt.ts /
// buildReferralRequestPrompt.ts) this is freeform prose that leans on the JD
// to tailor which experience/skills get surfaced, similar in spirit to
// buildColdEmailPrompt's single-email case but scoped to exactly one JD-based
// email rather than a multi-step follow-up sequence.
export function buildScheduledOutreachPrompt({
  companyName,
  roleTitle,
  jobDescription,
  resumeContext,
}: BuildScheduledOutreachPromptParams) {
  const { candidateName, block } = formatCandidateContext(resumeContext, 3);

  return `
You are an expert career communication assistant.

Write a personalized cold outreach email from a job candidate to a recruiter
or hiring contact at the company below, applying for the specific role
described by the job description. Reference concrete details from the job
description to show the email is tailored, not generic. Keep it concise
(under ~180 words), professional, and confident without being pushy.

COMPANY: ${companyName}
ROLE: ${roleTitle}
JOB DESCRIPTION:
${jobDescription}

CANDIDATE NAME: ${candidateName}
${block}

RULES:
- No placeholder text like [Company] or [Role] — use the actual values given above.
- No markdown formatting.
- Do not fabricate experience, employers, or skills beyond what's given above.
- Sign off with the candidate's name.
- Mention the resume is attached.

OUTPUT FORMAT (STRICT JSON ONLY):
{
  "subject": "...",
  "body": "..."
}

Return ONLY valid JSON.
`;
}
