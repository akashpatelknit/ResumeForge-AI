interface BuildProjectFromRepoPromptParams {
  repoName: string;
  repoDescription?: string;
  language?: string;
  topics?: string[];
  readme?: string | null;
}

export function buildProjectFromRepoPrompt({
  repoName,
  repoDescription,
  language,
  topics,
  readme,
}: BuildProjectFromRepoPromptParams) {
  const hasReadme = !!readme?.trim();

  return `
You are an expert resume writer turning a GitHub repository into a resume Project entry.

REPOSITORY NAME: ${repoName}
${repoDescription ? `REPOSITORY DESCRIPTION: ${repoDescription}` : ""}
${language ? `PRIMARY LANGUAGE: ${language}` : ""}
${topics && topics.length > 0 ? `TOPICS: ${topics.join(", ")}` : ""}

${
  hasReadme
    ? `README CONTENT:\n"""\n${readme!.slice(0, 8000)}\n"""`
    : "No README is available — base the project entry only on the repository name/description/language/topics above."
}

RULES:
- "projectName" is a clean, resume-friendly title — not necessarily the literal
  repo slug (e.g. "resume-forge-ai" -> "ResumeForge AI").
- "description" is 1-2 sentences summarizing what the project does and why it's notable.
- "highlights" is 2-3 resume-style bullet points, each starting with a strong
  action verb. Quantify impact ONLY when the input genuinely supports a number
  — never invent metrics.
- "techStack" is specific technologies/frameworks/languages actually evidenced
  in the README or the language/topics above — do not invent technologies not
  present in the input.
- Do not invent features, users, or outcomes not grounded in the input above.
- No placeholders, no markdown formatting, no leading bullet characters in the
  highlight text itself.

OUTPUT FORMAT (STRICT JSON ONLY):
{
  "projectName": "...",
  "description": "...",
  "highlights": ["...", "..."],
  "techStack": ["...", "..."]
}

Return ONLY valid JSON.
`;
}
