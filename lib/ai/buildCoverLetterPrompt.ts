interface BuildCoverLetterPromptParams {
  resume: string | object;
  jobDescription?: string | object;
  tone?: string;
}

export function buildCoverLetterPrompt({
  resume,
  jobDescription,
  tone,
}: BuildCoverLetterPromptParams) {
  const resumeText =
    typeof resume === "string" ? resume : JSON.stringify(resume, null, 2);

  const jobDesc =
    typeof jobDescription === "string"
      ? jobDescription.trim()
      : JSON.stringify(jobDescription ?? "");

  const hasJobDescription = jobDesc.trim().length > 0;

  return `
You are an expert career communication assistant specializing in cover letters.

Write a complete, professional cover letter using the RESUME and JOB DESCRIPTION below.

GLOBAL RULES:
- Write natural, human, first-person prose — not a template.
- Tone: ${tone ?? "Professional"}
- No placeholders like [Company Name] or [Hiring Manager] — if a detail is
  missing, write naturally without inventing it.
- Do not fabricate experience, companies, or numbers not present in the resume.
- 3-4 paragraphs: an opening hook, 1-2 body paragraphs connecting the
  candidate's concrete experience to the role, and a closing paragraph with
  a clear call to action.
- No markdown formatting, no bullet points, no headings.
- Do not include a letterhead, date, or address block — body text only.

RESUME:
${resumeText}

JOB DESCRIPTION:
${hasJobDescription ? jobDesc : "Not provided — write a strong general cover letter based on the resume alone, without referencing a specific role or company."}

OUTPUT FORMAT (STRICT JSON ONLY):
{ "coverLetter": "..." }

Return ONLY valid JSON.
`;
}
