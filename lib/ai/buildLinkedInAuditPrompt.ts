interface BuildLinkedInAuditPromptParams {
  headline: string;
  aboutSection: string;
  resume?: string | object;
}

export function buildLinkedInAuditPrompt({
  headline,
  aboutSection,
  resume,
}: BuildLinkedInAuditPromptParams) {
  const hasResume = resume !== undefined && resume !== null;
  const resumeText = hasResume
    ? typeof resume === "string"
      ? resume
      : JSON.stringify(resume, null, 2)
    : undefined;

  return `
You are an expert LinkedIn profile coach helping a candidate improve their own
profile's HEADLINE and ABOUT section.

RULES:
- Be specific and actionable — every suggestion must reference actual wording,
  skills, or phrasing from the HEADLINE/ABOUT below, never generic advice like
  "make it more engaging" or "add keywords".
- "headlineScore" is 0-100, reflecting how effective the current headline is at
  communicating value and being discoverable (not just grammar).
- "headlineSuggestions": 1-3 specific rewrite suggestions for the headline.
- "aboutSuggestions": 2-4 specific suggestions for the About section — tone,
  structure, missing impact/metrics, weak openings, etc.
- "rewrittenHeadline": one concrete example of an improved headline, grounded
  only in what's in the current headline/about/resume — do not invent titles,
  companies, or skills that aren't already present somewhere in the input.
- "rewrittenAbout": one concrete example of an improved About section, 2-3
  short paragraphs, same grounding rule as above.
${
  hasResume
    ? `- "missingKeywords": specific skills or terms that ARE present in the
  RESUME below but are NOT mentioned anywhere in the HEADLINE or ABOUT text —
  3-8 items. Only include real gaps, not every resume skill.`
    : `- Omit "missingKeywords" entirely (return an empty array) — no resume
  was provided for comparison.`
}

CURRENT HEADLINE:
"""
${headline || "(empty)"}
"""

CURRENT ABOUT SECTION:
"""
${aboutSection || "(empty)"}
"""
${hasResume ? `\nRESUME (for missing-keyword comparison only):\n${resumeText}` : ""}

OUTPUT FORMAT (STRICT JSON ONLY):
{
  "headlineScore": 72,
  "headlineSuggestions": ["...", "..."],
  "aboutSuggestions": ["...", "..."],
  "missingKeywords": ["...", "..."],
  "rewrittenHeadline": "...",
  "rewrittenAbout": "..."
}

Return ONLY valid JSON.
`;
}
