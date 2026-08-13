interface ExistingEntry {
  heading?: string;
  subheading?: string;
  bullets?: string[];
}

interface BuildCustomSectionPromptParams {
  // Optional now — blank rawInput falls back to rewriting existingEntry.
  rawInput?: string;
  existingEntry?: ExistingEntry;
  sectionTitle?: string;
}

export function buildCustomSectionPrompt({
  rawInput,
  existingEntry,
  sectionTitle,
}: BuildCustomSectionPromptParams) {
  const hasRawInput = !!rawInput?.trim();
  const hasExisting =
    !!existingEntry &&
    (!!existingEntry.heading?.trim() ||
      !!existingEntry.subheading?.trim() ||
      !!(existingEntry.bullets && existingEntry.bullets.length > 0));

  const instructions = hasRawInput
    ? `The candidate is adding an entry to a custom resume section${sectionTitle ? ` called "${sectionTitle}"` : ""} (things like Publications, Volunteer Work, Awards, Certifications with extra detail — whatever doesn't fit Experience/Projects/Education). Structure the RAW INPUT below into a single entry with a heading, an optional subheading, and bullet points.`
    : `No new input was provided — rewrite the EXISTING ENTRY below into a stronger, more polished version (better heading/subheading phrasing, better bullet points). Same underlying facts, nothing invented.`;

  return `
You are an expert resume writer.

${instructions}

RULES:
- "heading" is the title of the thing itself (e.g. a paper title, an award
  name, an organization) — short, no more than ~8 words
- "subheading" is secondary context (e.g. venue, date, issuer, role) — omit
  it (empty string) if nothing like that is present in the input
- "bulletPoints" is 1-4 resume-style bullet points elaborating on it, each
  starting with a strong verb where it makes sense — omit bullets entirely
  (empty array) if there's too little to support any
- No placeholders, no markdown formatting, no leading bullet characters in
  the bullet text itself
- Do not invent facts, names, dates, or numbers not grounded in the input below
${hasExisting ? `\nEXISTING ENTRY:\nHeading: ${existingEntry!.heading || "(none)"}\nSubheading: ${existingEntry!.subheading || "(none)"}\nBullets:\n${(existingEntry!.bullets || []).map((b) => `- ${b}`).join("\n") || "(none)"}` : ""}
${hasRawInput ? `\nRAW INPUT:\n"""\n${rawInput}\n"""` : ""}

OUTPUT FORMAT (STRICT JSON ONLY):
{ "heading": "...", "subheading": "...", "bulletPoints": ["...", "..."] }

Return ONLY valid JSON.
`;
}
