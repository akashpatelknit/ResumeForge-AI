import { generateText } from "../gemini";
import { buildColdEmailPrompt } from "./buildColdEmailPrompt";
export function parseAIJson(text: string) {
  const cleaned = text
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();

  return JSON.parse(cleaned);
}

export async function generateColdEmails(payload: any) {
  const prompt = buildColdEmailPrompt(payload);

  const res = await generateText(prompt);
  if (!res) {
    throw new Error("AI response is empty");
  }

  return parseAIJson(res);
}
