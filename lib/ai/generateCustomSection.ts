import { callAiGateway } from "./gateway";
import { resumeCustomSectionSchema } from "./schemas";
import { buildCustomSectionPrompt } from "./buildCustomSectionPrompt";

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

export async function generateCustomSection(
  { rawInput, existingEntry, sectionTitle }: GenerateCustomSectionParams,
  userId: string,
): Promise<GeneratedCustomSectionEntry> {
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

  const parsed = await callAiGateway({
    feature: "resume.customSection",
    userId,
    input: { rawInput, existingEntry, sectionTitle },
    promptBuilder: buildCustomSectionPrompt,
    outputSchema: resumeCustomSectionSchema,
    freeText: [rawInput],
  });

  if (!parsed.heading.trim()) {
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
