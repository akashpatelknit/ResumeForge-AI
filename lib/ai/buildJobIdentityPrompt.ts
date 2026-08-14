interface BuildJobIdentityPromptParams {
  jobDescription: string;
}

// Small, dedicated extraction prompt — used only by the smart "Track this
// application?" prompt on the AI Outreach tabs, where (unlike resume
// tailoring) there's no single existing JSON-returning generation call
// shared across all five tabs to piggyback on.
export function buildJobIdentityPrompt({
  jobDescription,
}: BuildJobIdentityPromptParams) {
  return `
Extract the hiring company's name and the job title from the JOB DESCRIPTION
below.

RULES:
- Only extract values that are clearly and explicitly stated in the text.
- Do NOT guess, infer, or invent a company or role that isn't clearly stated.
- If the company name isn't identifiable, return "" for "companyName".
- If the job title isn't identifiable, return "" for "roleTitle".

JOB DESCRIPTION:
${jobDescription}

OUTPUT FORMAT (STRICT JSON ONLY):
{
  "companyName": "...",
  "roleTitle": "..."
}

Return ONLY valid JSON.
`;
}
