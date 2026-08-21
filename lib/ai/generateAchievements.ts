import { callAiGateway } from "./gateway";
import { resumeAchievementsSchema } from "./schemas";
import { buildAchievementsPrompt } from "./buildAchievementsPrompt";

interface GenerateAchievementsParams {
  rawInput?: string;
  existingAchievements?: string[];
  role?: string;
  company?: string;
}

export async function generateAchievements(
  { rawInput, existingAchievements, role, company }: GenerateAchievementsParams,
  userId: string,
): Promise<string[]> {
  if (!rawInput?.trim() && (!existingAchievements || existingAchievements.length === 0)) {
    throw new Error(
      "Nothing to generate from — add a description or write an achievement first",
    );
  }

  const parsed = await callAiGateway({
    feature: "resume.achievements",
    userId,
    input: { rawInput, existingAchievements, role, company },
    promptBuilder: buildAchievementsPrompt,
    outputSchema: resumeAchievementsSchema,
    freeText: [rawInput],
  });

  if (parsed.achievements.length === 0) {
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
