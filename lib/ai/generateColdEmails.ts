import { generateText } from "../gemini";
import { buildColdEmailPrompt } from "./buildColdEmailPrompt";

export async function generateColdEmails(payload: any) {
  const prompt = buildColdEmailPrompt(payload);

  const res = await generateText(prompt);
  if (!res) {
    throw new Error("AI response is empty");
  }
  return JSON.parse(res);
}
