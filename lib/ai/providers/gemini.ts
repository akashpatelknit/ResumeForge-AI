import "server-only";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

// "gemini-2.5-flash-lite" started returning 404 "no longer available to
// new users" for this API key/project — verified directly against the
// live API, not assumed. Using the floating "-latest" alias instead of a
// pinned version specifically so this doesn't go stale the same way
// again; Google moves the alias forward as it deprecates models.
export async function generateText(prompt: string) {
  const response = await ai.models.generateContent({
    model: process.env.GEMINI_MODEL || "gemini-flash-latest",
    contents: prompt,
  });

  return response.text;
}
