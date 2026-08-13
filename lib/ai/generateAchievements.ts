import { generateText } from "./llm";
import { buildAchievementsPrompt } from "./buildAchievementsPrompt";

// Same strip-fences-then-parse pattern as generateColdEmails.ts /
// generateSummary.ts — kept as a local copy rather than a shared import,
// matching how each module in lib/ai/ keeps its own copy.
function parseAIJson(text: string): unknown {
  const cleaned = text
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();

  return JSON.parse(cleaned);
}

interface GenerateAchievementsParams {
  rawInput?: string;
  existingAchievements?: string[];
  role?: string;
  company?: string;
}

export async function generateAchievements({
  rawInput,
  existingAchievements,
  role,
  company,
}: GenerateAchievementsParams): Promise<string[]> {
  if (!rawInput?.trim() && (!existingAchievements || existingAchievements.length === 0)) {
    throw new Error(
      "Nothing to generate from — add a description or write an achievement first",
    );
  }

  const prompt = buildAchievementsPrompt({
    rawInput,
    existingAchievements,
    role,
    company,
  });

  const res = await generateText(prompt);
  if (!res) {
    throw new Error("AI response was empty");
  }

  const parsed = parseAIJson(res) as { achievements?: unknown };
  if (!Array.isArray(parsed.achievements) || parsed.achievements.length === 0) {
    throw new Error("AI response did not include achievements");
  }

  const achievements = parsed.achievements
    .filter((a): a is string => typeof a === "string" && a.trim().length > 0)
    .map((a) => a.trim());

  if (achievements.length === 0) {
    throw new Error("AI response did not include usable achievements");
  }

  return achievements;
}
