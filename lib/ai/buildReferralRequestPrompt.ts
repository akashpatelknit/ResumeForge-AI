import { formatCandidateProfileBlock } from "./formatCandidateProfile";
import type { ResumeContext } from "./formatResumeContext";

interface BuildReferralRequestPromptParams {
  companyName: string;
  roleTitle: string;
  jobId: string;
  pastedContext?: string;
  resumeContext: ResumeContext;
}

// Referral Request — only ever used when a Job ID is present (see
// generateQuickApplyEmail.ts's routing: referral_request without a jobId
// falls back to buildColdApplicationPrompt.ts instead). Location and Job
// Link aren't separately extracted/stored fields (see
// buildQuickApplyExtractPrompt.ts — only jobId is) — Gemini is instead
// pointed at the raw pastedContext to pull them from if present, same "omit
// the line if not stated" contract as everything else here.
export function buildReferralRequestPrompt({
  companyName,
  roleTitle,
  jobId,
  pastedContext,
  resumeContext,
}: BuildReferralRequestPromptParams) {
  const profileBlock = formatCandidateProfileBlock(resumeContext);

  return `
You are drafting a "Referral Request" outreach email for a job candidate,
asking a contact at the company to refer them for a specific posting.
Follow the EXACT template below — this is a strict format, not freeform
writing. Fill every bracketed placeholder using ONLY the real data provided
below the template; never invent a name, number, skill, or link.

TEMPLATE (fill the brackets, keep every other word and the line breaks/blank
lines exactly as shown):

Hi [Name],

I hope you're doing well.

I'm [Your Name], a [Current Role] with [X years] of experience in [relevant area]. I came across the following opportunity at [Company] and would like to apply for the position.

Job Title: [Job Title]
Job ID: [Job ID]
Location: [Location]
Job Link: [Job URL]

My experience aligns well with the role, particularly in [Tech 1], [Tech 2], [Tech 3], and [Tech 4]. I have hands-on experience working on [briefly mention relevant project/work — 1 line].

If you find my profile suitable for the position, would you be comfortable referring me for this role? I've attached my latest resume for your reference.

Resume: Attached
LinkedIn: [LinkedIn URL]
GitHub/Portfolio: [URL]

I'd be happy to provide any additional information required for the referral.

Thank you for your time and consideration.

Best regards,
[Your Name]
[Phone Number]
[Email Address]

FILL-IN RULES:
- [Name]: the recipient's name if it's known from the data below; otherwise write "Hiring Team" instead of a name (e.g. "Hi Hiring Team,"). Never invent a person's name.
- [Your Name]: the candidate's real full name (used in both the intro sentence and the sign-off).
- [Current Role]: the candidate's most recent/current job title from the data below.
- [X years]: the candidate's total years of professional experience, computed from their work experience data below. If it genuinely can't be determined, rephrase that sentence to drop the year count naturally rather than writing "[X years]" literally.
- [relevant area]: a short phrase (2-4 words) naming the candidate's field/domain, based on their real skills/summary below (e.g. "full-stack development", "backend systems", "data engineering") — not invented, grounded in their actual background.
- [Company] = "${companyName}".
- [Job Title] = "${roleTitle}", [Job ID] = "${jobId}" — use exactly these values.
- [Location]: pull it from the job post/context below if it's stated there. If not stated, omit the entire "Location:" line.
- [Job URL]: pull it from the job post/context below if a URL is stated there. If not stated, omit the entire "Job Link:" line.
- [Tech 1] through [Tech 4]: choose exactly 4 of the candidate's real skills if they have at least 4 listed. First take any that also appear in the job post/context below (overlap), then fill any remaining slots up to 4 with the candidate's other real listed skills (top of their list) — always reach 4 if the candidate has that many skills total, don't stop early just because overlap alone was fewer than 4. Only use fewer than 4 if the candidate genuinely has fewer than 4 skills listed in total. Never invent a skill.
- [briefly mention relevant project/work — 1 line]: write ONE natural, flowing sentence (not a copy of the raw project data's "Name: description | highlight" format) describing a real, specific project or experience highlight from the data below — not generic filler like "various projects."
- [LinkedIn URL] / GitHub/Portfolio [URL]: use the candidate's real links from the data below. If a link isn't available, omit that entire line.
- [Phone Number] / [Email Address]: the candidate's real phone number / email. If either is missing, omit that specific line entirely.
- Never leave a literal placeholder bracket (e.g. "[Location]") anywhere in the output — every bracket is either replaced with real data or its line is removed.
- No markdown formatting. No commentary outside the email itself.

COMPANY: ${companyName}
ROLE: ${roleTitle}
JOB ID: ${jobId}
${pastedContext ? `JOB POST / CONTEXT PROVIDED BY THE CANDIDATE (use for Location, Job Link, and to prioritize which skills overlap):\n${pastedContext}\n` : ""}
${profileBlock}

OUTPUT FORMAT (STRICT JSON ONLY):
{
  "subject": "...",
  "body": "..."
}

"subject" is a short, relevant subject line (not part of the template above) — e.g. something like "Referral Request — ${roleTitle} (${jobId}) at ${companyName}". "body" must be exactly the filled-in template text above (starting with the "Hi ..." greeting, ending with the phone/email lines that are available), with real line breaks preserved.

Return ONLY valid JSON.
`;
}
