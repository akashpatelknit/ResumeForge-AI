import { formatCandidateProfileBlock } from "./formatCandidateProfile";
import type { ResumeContext } from "./formatResumeContext";

interface BuildColdApplicationPromptParams {
  companyName: string;
  roleTitle: string;
  pastedContext?: string;
  resumeContext: ResumeContext;
}

// Cold Application — Quick Apply's default message type (see
// QuickApplyModal.tsx's message-type toggle). Unlike the old
// buildQuickApplyPrompt.ts (freeform prose, now removed), this gives Gemini
// the exact template text and instructs it to fill placeholders from real
// data only, never leaving a literal "[bracket]" in the output.
export function buildColdApplicationPrompt({
  companyName,
  roleTitle,
  pastedContext,
  resumeContext,
}: BuildColdApplicationPromptParams) {
  const profileBlock = formatCandidateProfileBlock(resumeContext);

  return `
You are drafting a "Cold Application" outreach email for a job candidate.
Follow the EXACT template below — this is a strict format, not freeform
writing. Fill every bracketed placeholder using ONLY the real data provided
below the template; never invent a name, number, skill, or link.

TEMPLATE (fill the brackets, keep every other word and the line breaks/blank
lines exactly as shown):

Hi [Name],

I'm writing to express my interest in the [Job Role] opportunity at [Company].

I have [X years] of experience as a [Current Role], with hands-on experience in [Tech 1], [Tech 2], [Tech 3], and [Tech 4]. My experience aligns well with the requirements mentioned for this position.

Please find my latest CV attached for your consideration. I would appreciate the opportunity to discuss my profile further if it matches your requirements.

Experience: [X years]
Tech Stack: [Tech 1] | [Tech 2] | [Tech 3] | [Tech 4]
LinkedIn: [LinkedIn URL]
GitHub/Portfolio: [URL]

Thank you for your time and consideration.

Best regards,
[Your Name]
[Phone Number]
[Email]

FILL-IN RULES:
- [Name]: the recipient's name if it's known from the data below; otherwise write "Hiring Team" instead of a name (e.g. "Hi Hiring Team,"). Never invent a person's name.
- [Job Role] = "${roleTitle}", [Company] = "${companyName}" — use exactly these values.
- [X years]: compute the candidate's total years of professional experience from their work experience data below. Use this SAME number in BOTH places it appears in the template (the opening paragraph AND the "Experience:" line) — the template repeats it intentionally, do not drop the "Experience:" line just because the number was already used in the paragraph. Only if the year count genuinely can't be determined at all: rephrase the paragraph sentence to drop it naturally, and omit the "Experience:" line entirely — never write "[X years]" literally.
- [Current Role]: the candidate's most recent/current job title from the data below.
- [Tech 1] through [Tech 4]: choose exactly 4 of the candidate's real skills if they have at least 4 listed. First take any that also appear in the job post/context below (overlap), then fill any remaining slots up to 4 with the candidate's other real listed skills (top of their list) — always reach 4 if the candidate has that many skills total, don't stop early just because overlap alone was fewer than 4. Only use fewer than 4 if the candidate genuinely has fewer than 4 skills listed in total. Never invent a skill.
- [LinkedIn URL] / GitHub/Portfolio [URL]: use the candidate's real links from the data below. If a link isn't available, omit that entire line (don't show the label with nothing after it).
- [Your Name]: the candidate's real full name.
- [Phone Number] / [Email]: the candidate's real phone number / email. If either is missing, omit that specific line entirely.
- Never leave a literal placeholder bracket (e.g. "[Phone Number]") anywhere in the output — every bracket is either replaced with real data or its line/clause is removed.
- No markdown formatting. No commentary outside the email itself.

COMPANY: ${companyName}
ROLE: ${roleTitle}
${pastedContext ? `JOB POST / CONTEXT PROVIDED BY THE CANDIDATE (use to prioritize which skills overlap):\n${pastedContext}\n` : ""}
${profileBlock}

OUTPUT FORMAT (STRICT JSON ONLY):
{
  "subject": "...",
  "body": "..."
}

"subject" is a short, relevant subject line (not part of the template above) — e.g. something like "Application for ${roleTitle} at ${companyName}". "body" must be exactly the filled-in template text above (starting with the "Hi ..." greeting, ending with the phone/email lines that are available), with real line breaks preserved.

Return ONLY valid JSON.
`;
}
