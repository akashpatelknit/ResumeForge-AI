interface BuildAnalyzeJdPromptParams {
  resume: string | object;
  jobDescription: string;
}

export function buildAnalyzeJdPrompt({
  resume,
  jobDescription,
}: BuildAnalyzeJdPromptParams) {
  const resumeText =
    typeof resume === "string" ? resume : JSON.stringify(resume, null, 2);

  return `
You are an expert ATS (Applicant Tracking System) resume screener.

Compare the RESUME against the JOB DESCRIPTION below and produce a match analysis.

RULES:
- "score" is an integer 0-100 reflecting how well the resume matches the job
  description's requirements (skills, experience, keywords). Be realistic and
  discriminating, not generous — a resume missing several core requirements
  should score well below 70.
- "matchedKeywords" are specific skills, technologies, or terms from the job
  description that ARE present in the resume (verbatim or a close synonym).
  5-12 items, most relevant first.
- "missingKeywords" are specific skills, technologies, or terms the job
  description asks for that are NOT present anywhere in the resume. 3-10
  items, most important first.
- "suggestions" are 2-4 short, concrete, actionable improvements tied to a
  specific missing keyword or weak area — e.g. "Add 'Kafka' near your
  backend experience" — not generic career advice like "tailor your resume".
- Do not invent skills, experience, or numbers not present in the resume.
- Base the analysis only on the text provided below.

RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}

OUTPUT FORMAT (STRICT JSON ONLY):
{
  "score": 78,
  "matchedKeywords": ["...", "..."],
  "missingKeywords": ["...", "..."],
  "suggestions": ["...", "..."]
}

Return ONLY valid JSON.
`;
}
