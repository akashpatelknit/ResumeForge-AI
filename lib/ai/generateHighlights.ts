import { generateText } from "./llm";
import { buildHighlightsPrompt } from "./buildHighlightsPrompt";

function parseAIJson(text: string): unknown {
  const cleaned = text
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();

  return JSON.parse(cleaned);
}

interface GenerateHighlightsParams {
  rawInput?: string;
  existingHighlights?: string[];
  projectName?: string;
  techStack?: string[];
}

export async function generateHighlights({
  rawInput,
  existingHighlights,
  projectName,
  techStack,
}: GenerateHighlightsParams): Promise<string[]> {
  if (!rawInput?.trim() && (!existingHighlights || existingHighlights.length === 0)) {
    throw new Error(
      "Nothing to generate from — add project notes or write a highlight first",
    );
  }

  const prompt = buildHighlightsPrompt({
    rawInput,
    existingHighlights,
    projectName,
    techStack,
  });

  const res = await generateText(prompt);
  if (!res) {
    throw new Error("AI response was empty");
  }

  const parsed = parseAIJson(res) as { highlights?: unknown };
  if (!Array.isArray(parsed.highlights) || parsed.highlights.length === 0) {
    throw new Error("AI response did not include highlights");
  }

  const highlights = parsed.highlights
    .filter((h): h is string => typeof h === "string" && h.trim().length > 0)
    .map((h) => h.trim());

  if (highlights.length === 0) {
    throw new Error("AI response did not include usable highlights");
  }

  return highlights;
}
