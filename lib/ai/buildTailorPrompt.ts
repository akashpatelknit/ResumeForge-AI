interface BuildTailorPromptParams {
  resume: string | object;
  jobDescription: string;
}

export function buildTailorPrompt({
  resume,
  jobDescription,
}: BuildTailorPromptParams) {
  const resumeText =
    typeof resume === "string" ? resume : JSON.stringify(resume, null, 2);

  return `
You are an expert resume writer helping a candidate tailor their existing resume to
a specific job description.

RULES — READ CAREFULLY:
- Reword and reorder ONLY. Never invent achievements, companies, job titles, dates,
  metrics, or skills that are not already present in the ORIGINAL RESUME below.
- Reword the professional summary and bullet points to use language and emphasis
  that matches the JOB DESCRIPTION, while keeping every underlying fact (what was
  actually built or done, at which company, with which numbers) unchanged.
- Reorder skill items within each category so the ones most relevant to the JOB
  DESCRIPTION come first. Keep every existing skill category and every existing
  skill item — do not add or remove any skill, only reorder.
- Reuse the exact same "id" for every experience entry, project, and skill category
  as in the original resume — you are changing wording/order, never identity.
- If an entry has nothing meaningfully relevant to reword, return its original
  content for that entry unchanged rather than forcing a change.
- Only include entries (by id) that actually exist in the original resume.
- Also extract, if clearly stated in the JOB DESCRIPTION text: the hiring
  company's name ("companyName") and the job title being applied for
  ("roleTitle"). Do not guess or infer a company/role that isn't clearly
  stated — return an empty string for either field rather than inventing one.

ORIGINAL RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}

OUTPUT FORMAT (STRICT JSON ONLY):
{
  "companyName": "...",
  "roleTitle": "...",
  "summary": "...",
  "experience": [{ "id": "...", "achievements": ["...", "..."] }],
  "skills": [{ "id": "...", "items": ["...", "..."] }],
  "projects": [{ "id": "...", "highlights": ["...", "..."] }]
}

Return ONLY valid JSON.
`;
}
