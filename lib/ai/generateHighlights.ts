import { callAiGateway } from "./gateway";
import { resumeHighlightsSchema } from "./schemas";
import { buildHighlightsPrompt } from "./buildHighlightsPrompt";

interface GenerateHighlightsParams {
  rawInput?: string;
  existingHighlights?: string[];
  projectName?: string;
  techStack?: string[];
}

export async function generateHighlights(
  { rawInput, existingHighlights, projectName, techStack }: GenerateHighlightsParams,
  userId: string,
): Promise<string[]> {
  if (!rawInput?.trim() && (!existingHighlights || existingHighlights.length === 0)) {
    throw new Error(
      "Nothing to generate from — add project notes or write a highlight first",
    );
  }

  const parsed = await callAiGateway({
    feature: "resume.highlights",
    userId,
    input: { rawInput, existingHighlights, projectName, techStack },
    promptBuilder: buildHighlightsPrompt,
    outputSchema: resumeHighlightsSchema,
    freeText: [rawInput],
  });

  if (parsed.highlights.length === 0) {
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
