export function buildParseResumePrompt(resumeText: string) {
  return `
You are an expert resume parser. Extract structured data from the RAW RESUME TEXT
below (extracted from a PDF/DOCX, so spacing and line breaks may be imperfect).

RULES:
- Only extract information actually present in the text — never invent companies,
  dates, numbers, or achievements.
- If a field isn't present, use an empty string "" (or empty array [] for lists).
- Dates should be normalized to "YYYY-MM" where possible; use the original text if
  the exact month is unclear. Use null for endDate when the entry is current/ongoing
  (e.g. "Present").
- "achievements" and "highlights" are bullet points — split multi-line bullet blocks
  into separate array entries, don't merge them into one string.
- Group skills into logical categories (e.g. "Frontend", "Backend", "Tools") based on
  how they appear in the text; if the resume just lists skills with no categories,
  use a single category named "Skills".
- Do not include markdown formatting anywhere in the extracted values.

RAW RESUME TEXT:
"""
${resumeText}
"""

OUTPUT FORMAT (STRICT JSON ONLY):
{
  "personalInfo": {
    "fullName": "...",
    "email": "...",
    "phone": "...",
    "location": "...",
    "linkedin": "...",
    "github": "...",
    "portfolio": "..."
  },
  "summary": "...",
  "experience": [
    {
      "company": "...",
      "position": "...",
      "location": "...",
      "startDate": "YYYY-MM",
      "endDate": "YYYY-MM or null",
      "description": "...",
      "achievements": ["...", "..."]
    }
  ],
  "education": [
    {
      "institution": "...",
      "degree": "...",
      "field": "...",
      "location": "...",
      "startDate": "YYYY-MM",
      "endDate": "YYYY-MM",
      "gpa": "..."
    }
  ],
  "skills": [
    { "category": "...", "items": ["...", "..."] }
  ],
  "projects": [
    {
      "name": "...",
      "description": "...",
      "technologies": ["...", "..."],
      "link": "...",
      "github": "...",
      "highlights": ["...", "..."]
    }
  ],
  "certifications": [
    { "name": "...", "issuer": "...", "date": "...", "credentialId": "..." }
  ],
  "languages": ["..."]
}

Return ONLY valid JSON, no markdown fences, no commentary.
`;
}
