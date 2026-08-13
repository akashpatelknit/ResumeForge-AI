import { generateText } from "./llm";
import { buildCustomSectionPrompt } from "./buildCustomSectionPrompt";

function parseAIJson(text: string): unknown {
  const cleaned = text
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();

  return JSON.parse(cleaned);
}

export interface GeneratedCustomSectionEntry {
  heading: string;
  subheading: string;
  bulletPoints: string[];
}

interface ExistingEntry {
  heading?: string;
  subheading?: string;
  bullets?: string[];
}

interface GenerateCustomSectionParams {
  rawInput?: string;
  existingEntry?: ExistingEntry;
  sectionTitle?: string;
}

export async function generateCustomSection({
  rawInput,
  existingEntry,
  sectionTitle,
}: GenerateCustomSectionParams): Promise<GeneratedCustomSectionEntry> {
  const hasExisting =
    !!existingEntry &&
    (!!existingEntry.heading?.trim() ||
      !!existingEntry.subheading?.trim() ||
      !!(existingEntry.bullets && existingEntry.bullets.length > 0));

  if (!rawInput?.trim() && !hasExisting) {
    throw new Error(
      "Nothing to generate from — add some notes or fill in an entry first",
    );
  }

  const prompt = buildCustomSectionPrompt({ rawInput, existingEntry, sectionTitle });

  const res = await generateText(prompt);
  if (!res) {
    throw new Error("AI response was empty");
  }

  const parsed = parseAIJson(res) as {
    heading?: unknown;
    subheading?: unknown;
    bulletPoints?: unknown;
  };

  if (typeof parsed.heading !== "string" || !parsed.heading.trim()) {
    throw new Error("AI response did not include a heading");
  }

  const bulletPoints = Array.isArray(parsed.bulletPoints)
    ? parsed.bulletPoints.filter(
        (b): b is string => typeof b === "string" && b.trim().length > 0,
      )
    : [];

  return {
    heading: parsed.heading.trim(),
    subheading: typeof parsed.subheading === "string" ? parsed.subheading.trim() : "",
    bulletPoints,
  };
}
