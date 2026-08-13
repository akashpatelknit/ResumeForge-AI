interface BuildHighlightsPromptParams {
  // Optional now — blank rawInput falls back to rewriting existingHighlights.
  rawInput?: string;
  existingHighlights?: string[];
  projectName?: string;
  techStack?: string[];
}

export function buildHighlightsPrompt({
  rawInput,
  existingHighlights,
  projectName,
  techStack,
}: BuildHighlightsPromptParams) {
  const hasRawInput = !!rawInput?.trim();
  const hasExisting = !!existingHighlights && existingHighlights.length > 0;

  const instructions = hasRawInput
    ? `Turn the RAW INPUT below into 2-3 resume-style bullet points for the "Key Highlights" section of a project entry${projectName ? ` called "${projectName}"` : ""}.`
    : `No new input was provided — rewrite the EXISTING HIGHLIGHTS below into 2-3 stronger, more polished bullet points for the same project${projectName ? ` ("${projectName}")` : ""}. Same underlying facts, better writing, nothing invented.`;

  return `
You are an expert resume writer.

${instructions}
${techStack && techStack.length > 0 ? `Known tech stack: ${techStack.join(", ")}.` : ""}

RULES:
- 2-3 bullet points
- Start each one with a strong action verb (Built, Architected, Implemented, Optimized, Designed, etc.)
- Quantify impact (%, scale, performance, users, etc.) ONLY when the input actually supports a number — never invent metrics
- No placeholders, no markdown formatting, no leading bullet characters (no "-" or "•") — just the sentence text
- Do not invent facts, technologies, or outcomes not grounded in the input below
${hasExisting ? `\nEXISTING HIGHLIGHTS:\n"""\n${existingHighlights!.map((h) => `- ${h}`).join("\n")}\n"""` : ""}
${hasRawInput ? `\nRAW INPUT:\n"""\n${rawInput}\n"""` : ""}

OUTPUT FORMAT (STRICT JSON ONLY):
{ "highlights": ["...", "..."] }

Return ONLY valid JSON.
`;
}
