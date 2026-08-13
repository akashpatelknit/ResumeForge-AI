interface BuildAchievementsPromptParams {
  // Optional now — blank rawInput falls back to rewriting existingAchievements.
  rawInput?: string;
  existingAchievements?: string[];
  role?: string;
  company?: string;
}

export function buildAchievementsPrompt({
  rawInput,
  existingAchievements,
  role,
  company,
}: BuildAchievementsPromptParams) {
  const roleContext = [role, company && role ? `at ${company}` : company]
    .filter(Boolean)
    .join(" ");

  const hasRawInput = !!rawInput?.trim();
  const hasExisting = !!existingAchievements && existingAchievements.length > 0;

  const instructions = hasRawInput
    ? `Turn the RAW INPUT below into exactly 3 resume-style bullet points for the "Key Achievements" section of a job entry${roleContext ? ` (${roleContext})` : ""}.`
    : `No new input was provided — rewrite the EXISTING ACHIEVEMENTS below into 3 stronger, more polished bullet points for the same job entry${roleContext ? ` (${roleContext})` : ""}. Same underlying facts, better writing, nothing invented.`;

  return `
You are an expert resume writer.

${instructions}

RULES:
- Exactly 3 bullet points
- Start each one with a strong action verb (Led, Built, Reduced, Architected, Designed, Improved, etc.)
- Quantify impact (%, time saved, scale, revenue, users, etc.) ONLY when the input actually supports a number — never invent metrics
- No placeholders, no markdown formatting, no leading bullet characters (no "-" or "•") — just the sentence text
- Do not invent facts, tools, or outcomes not grounded in the input below
${hasExisting ? `\nEXISTING ACHIEVEMENTS:\n"""\n${existingAchievements!.map((a) => `- ${a}`).join("\n")}\n"""` : ""}
${hasRawInput ? `\nRAW INPUT:\n"""\n${rawInput}\n"""` : ""}

OUTPUT FORMAT (STRICT JSON ONLY):
{ "achievements": ["...", "...", "..."] }

Return ONLY valid JSON.
`;
}
