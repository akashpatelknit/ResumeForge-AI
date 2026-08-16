interface BuildAnalyzeJdPromptParams {
  resume: string | object;
  jobDescription: string;
}

// Pulled out and listed explicitly (rather than trusting the model to find
// them buried in the full RESUME JSON dump below) so add_skill suggestions
// reliably route to a real existing category instead of a generic bucket —
// see lib/ats/applySuggestion.ts, which matches targetCategory against
// these same category names.
function extractSkillCategories(resume: string | object): string[] {
  if (typeof resume === "string") return [];
  const skills = (resume as { skills?: unknown }).skills;
  if (!Array.isArray(skills)) return [];

  const categories: string[] = [];
  for (const skill of skills) {
    const category = (skill as { category?: unknown })?.category;
    if (typeof category === "string" && category.trim()) {
      categories.push(category.trim());
    }
  }
  return categories;
}

export function buildAnalyzeJdPrompt({
  resume,
  jobDescription,
}: BuildAnalyzeJdPromptParams) {
  const resumeText =
    typeof resume === "string" ? resume : JSON.stringify(resume, null, 2);
  const skillCategories = extractSkillCategories(resume);
  const skillCategoriesText =
    skillCategories.length > 0
      ? skillCategories.map((c) => `"${c}"`).join(", ")
      : "(this resume has no skill categories yet)";

  return `
You are an expert ATS (Applicant Tracking System) resume screener.

Compare the RESUME against the JOB DESCRIPTION below and produce a match analysis
with one-click-appliable suggestions.

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
- "suggestions" is an array of at most 6 structured, one-click-appliable
  edits — not generic advice. Each one is an object:
  {
    "id": "s1",
    "type": "add_skill" | "rewrite_bullet" | "add_bullet",
    "reason": "short human-readable explanation, e.g. \\"Kafka appears in the JD but not on your resume\\"",
    "targetField": "a path into the RESUME JSON below identifying where this applies",
    "targetCategory": "only for add_skill — see rule below",
    "currentValue": "only for rewrite_bullet — the exact existing bullet text being replaced",
    "suggestedValue": "the actual text to insert or replace with"
  }

  Suggestion type rules:
  - "add_skill": ALWAYS use "targetField": "skills" — never target a bullet.
    Use this for a missing keyword that's a skill/technology, not something to
    weave into prose. "suggestedValue" is just the skill name (e.g. "Kafka").
    This resume's EXISTING skill categories are: ${skillCategoriesText}.
    You MUST also set "targetCategory" to the single best-fit category for
    this skill:
      - If one of the existing categories listed above is a good semantic
        fit (e.g. a backend framework belongs in an existing "Backend &
        Languages" category), copy that category's name EXACTLY as written
        above — don't paraphrase or reformat it.
      - Only if genuinely none of the existing categories fit (e.g. a soft
        skill like "Public Speaking" when every existing category is
        technical) should you invent a new, specific, sensibly-named
        category (e.g. "Leadership & Communication") — never a vague
        catch-all like "Additional Skills", "Other", or "Miscellaneous".
  - "rewrite_bullet": targets ONE existing bullet you are strengthening
    (weak wording, missing a metric, vague phrasing) — NOT for stuffing in a
    keyword that doesn't belong there. "targetField" MUST reference a REAL
    entry and bullet index that exists in the RESUME JSON below, using this
    exact path syntax: "experience[i].achievements[j]" for a work experience
    bullet, or "projects[i].highlights[j]" for a project bullet — where i and
    j are the actual zero-based array indices from the resume data (e.g. the
    resume's second experience entry's first achievement is
    "experience[1].achievements[0]"). "currentValue" must be copied verbatim
    from that exact array entry.
  - "add_bullet": targets an entry's bullet LIST (to append a new bullet,
    e.g. a missing metric or responsibility this role clearly covered), using
    the same path syntax but WITHOUT a trailing index: "experience[i].achievements"
    or "projects[i].highlights" — again, i must be a real index in the resume.
  - Only use rewrite_bullet/add_bullet against experience or project entries
    that actually exist in the RESUME JSON below. Never invent an entry or
    index that isn't there.
  - Prefer quality over quantity: skip a suggestion type entirely if there's
    nothing genuinely worth suggesting for it, rather than padding to 6.
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
  "suggestions": [
    {
      "id": "s1",
      "type": "add_skill",
      "reason": "Kafka appears in the JD but not on your resume",
      "targetField": "skills",
      "targetCategory": "Backend & Languages",
      "suggestedValue": "Kafka"
    },
    {
      "id": "s2",
      "type": "rewrite_bullet",
      "reason": "This bullet is vague and doesn't quantify impact",
      "targetField": "experience[0].achievements[1]",
      "currentValue": "Worked on backend performance improvements",
      "suggestedValue": "Reduced API p95 latency by 40% by optimizing database queries and adding Redis caching"
    }
  ]
}

Return ONLY valid JSON.
`;
}
