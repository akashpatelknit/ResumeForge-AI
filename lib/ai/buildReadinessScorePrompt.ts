interface BuildReadinessScorePromptParams {
  resume: string | object;
  // Optional — unlike buildAnalyzeJdPrompt.ts's jobDescription, this score
  // must remain meaningful with zero JD context at all (see rules below).
  jobDescription?: string;
}

export function buildReadinessScorePrompt({
  resume,
  jobDescription,
}: BuildReadinessScorePromptParams) {
  const resumeText =
    typeof resume === "string" ? resume : JSON.stringify(resume, null, 2);

  const jdSection = jobDescription
    ? `\nJOB DESCRIPTION (optional context — blend keyword-match signal into "keywordStrength" and the suggestions, alongside the generic checks below; do NOT let this dominate the other three categories):\n${jobDescription}\n`
    : "\nNo job description was provided. Score \"keywordStrength\" generically — presence of concrete, quantifiable, role-relevant skills and terms (not matched against any specific posting) — and every other category exactly as you would with a JD present. The overall score must still be meaningful and discriminating with zero job-description context.\n";

  return `
You are an expert ATS (Applicant Tracking System) resume auditor.

Evaluate the RESUME below for general ATS readiness — how reliably an
Applicant Tracking System can parse it and how complete/professional it is —
independent of any specific job posting. This is NOT a job-match score.

RULES:
- "score" is an integer 0-100, the overall ATS readiness score. Be realistic
  and discriminating, not generous — a resume with real structural or
  completeness gaps should score well below 70.
- "breakdown" has four integer 0-100 sub-scores:
  - "structure": clear, standard section headers (Experience, Education,
    Skills, ...); logical section ordering; no missing core sections.
  - "formatting": consistent date formats, consistent bullet styles, no
    tables/columns/text-boxes/images that break ATS parsing, no unusual
    fonts/symbols, reasonable length.
  - "completeness": presence of contact info, a summary/objective,
    experience with real detail, skills, and (if relevant) education —
    penalize missing or thin sections.
  - "keywordStrength": presence of concrete, quantified achievements
    (numbers, %, scale) and specific, role-relevant skills/technologies
    rather than vague filler language.
- "suggestions" is an array of 3-8 short, specific, actionable strings
  (e.g. "Add a dedicated Skills section listing your core technologies",
  "Quantify the impact of your Q3 project bullet with a metric"). Plain
  text only — no markdown, no numbering.
- Base the analysis only on the text provided below. Do not invent content
  that isn't there.
${jdSection}
RESUME:
${resumeText}

OUTPUT FORMAT (STRICT JSON ONLY):
{
  "score": 74,
  "breakdown": {
    "structure": 80,
    "formatting": 70,
    "completeness": 75,
    "keywordStrength": 65
  },
  "suggestions": [
    "Add a dedicated Skills section listing your core technologies",
    "Quantify the impact of your most recent role's bullets with metrics"
  ]
}

Return ONLY valid JSON.
`;
}
