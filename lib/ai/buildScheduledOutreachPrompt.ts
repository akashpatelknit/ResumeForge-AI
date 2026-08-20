import { htmlToPlainText } from "@/lib/jobs/experienceLevel";
import { formatCandidateContext, type ResumeContext } from "./formatResumeContext";

interface BuildScheduledOutreachPromptParams {
  companyName: string;
  roleTitle: string;
  jobDescription: string;
  resumeContext: ResumeContext;
}

// Greenhouse-sourced jobs store their raw HTML content as-is in
// SavedJob.jobDescription (app/api/jobs/save persists whatever the client
// sends verbatim, no server-side stripping) — feeding that straight into a
// "return ONLY valid JSON" prompt bloats tokens with markup and entities,
// and has a real chance of throwing the model off strict-JSON output.
// htmlToPlainText is the same stripping lib/jobs/greenhouseClient.ts uses
// for jobDescriptionPlain elsewhere in Job Discovery — reused here rather
// than duplicated. Also capped, same pattern as formatResumeContext.ts's
// extracted-text truncation, since Greenhouse JDs can run long.
const MAX_JOB_DESCRIPTION_CHARS = 6000;

function sanitizeJobDescription(raw: string): string {
  const plain = htmlToPlainText(raw);
  return plain.length > MAX_JOB_DESCRIPTION_CHARS ? `${plain.slice(0, MAX_JOB_DESCRIPTION_CHARS)}...` : plain;
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
  const cleanJobDescription = sanitizeJobDescription(jobDescription);

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
${cleanJobDescription}

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
