import "server-only";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

// Cheap bulk generation
// model = "gemini-2.5-flash-lite";

// // Higher quality writing (optional premium)
// model = "gemini-2.5-flash";

// // Deep analysis / premium feature
// model = "gemini-3-flash";

export async function generateText(prompt: string) {
  const response = await ai.models.generateContent({
    // model: "gemini-3-flash-preview", // recommended stable model
    model: "gemini-2.5-flash-lite", // recommended stable model
    contents: prompt,
  });

  return response.text;
}
