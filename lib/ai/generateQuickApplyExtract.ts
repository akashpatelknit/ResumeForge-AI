import { generateText } from "./llm";
import { buildQuickApplyExtractPrompt } from "./buildQuickApplyExtractPrompt";

// Same strip-fences-then-parse pattern as generateColdEmails.ts / extractJobIdentity.ts
// — kept as a local copy rather than a shared import, matching how those do it.
function parseAIJson(text: string): unknown {
  const cleaned = text
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();

  return JSON.parse(cleaned);
}

export interface QuickApplyExtractResult {
  recipientEmail: string | null;
  companyName: string | null;
  roleTitle: string | null;
}

function cleanField(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export async function generateQuickApplyExtract(pastedText: string): Promise<QuickApplyExtractResult> {
  const prompt = buildQuickApplyExtractPrompt({ pastedText });

  const res = await generateText(prompt);
  if (!res) {
    throw new Error("AI response was empty");
  }

  const parsed = parseAIJson(res) as {
    recipientEmail?: unknown;
    companyName?: unknown;
    roleTitle?: unknown;
  };

  return {
    recipientEmail: cleanField(parsed.recipientEmail),
    companyName: cleanField(parsed.companyName),
    roleTitle: cleanField(parsed.roleTitle),
  };
}
