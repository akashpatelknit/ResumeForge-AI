import type { AppResume } from "@/types/resume";

interface BuildQuickApplyPromptParams {
  companyName: string;
  roleTitle: string;
  pastedContext?: string;
  resume: AppResume;
}

// Quick Apply emails are for one-off, low-friction applications — shorter
// and more direct than the multi-paragraph email Screen 2's "Generate &
// Review" panel produces, per the product's own framing of Quick Apply as
// the fast path.
export function buildQuickApplyPrompt({
  companyName,
  roleTitle,
  pastedContext,
  resume,
}: BuildQuickApplyPromptParams) {
  const skills = resume.skills.flatMap((s) => s.items).join(", ");
  const recentRoles = resume.experience
    .slice(0, 2)
    .map((e) => `${e.position} at ${e.company}`)
    .join("; ");

  return `
You are an expert career communication assistant.

Write a short, direct job application email for a "quick apply" flow — the
candidate is applying to a one-off posting with minimal ceremony. Keep it
concise (under ~150 words), warm but efficient, no filler, no generic
platitudes.

COMPANY: ${companyName}
ROLE: ${roleTitle}
${pastedContext ? `JOB POST / CONTEXT PROVIDED BY THE CANDIDATE:\n${pastedContext}\n` : ""}
CANDIDATE NAME: ${resume.personalInfo.fullName || "the candidate"}
CANDIDATE SUMMARY: ${resume.summary || "Not provided"}
CANDIDATE KEY SKILLS: ${skills || "Not provided"}
CANDIDATE RECENT ROLES: ${recentRoles || "Not provided"}

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
