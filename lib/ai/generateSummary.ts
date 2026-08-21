import { callAiGateway } from "./gateway";
import { resumeSummarySchema } from "./schemas";
import { buildSummaryPrompt } from "./buildSummaryPrompt";

interface ResumeContext {
  name?: string;
  targetRole?: string;
}

interface GenerateSummaryParams {
  // Both optional — rawInput may be left blank (falls back to polishing
  // existingSummary), and existingSummary may not exist yet for a brand
  // new resume. At least one of the two must be present.
  rawInput?: string;
  existingSummary?: string;
  resumeContext?: ResumeContext;
}

export async function generateSummary(
  { rawInput, existingSummary, resumeContext }: GenerateSummaryParams,
  userId: string,
): Promise<string> {
  if (!rawInput?.trim() && !existingSummary?.trim()) {
    throw new Error(
      "Nothing to generate from — add some notes, paste a job description, or write a summary first",
    );
  }

  const parsed = await callAiGateway({
    feature: "resume.summary",
    userId,
    input: { rawInput, existingSummary, resumeContext },
    promptBuilder: buildSummaryPrompt,
    outputSchema: resumeSummarySchema,
    freeText: [rawInput, existingSummary],
  });

  if (!parsed.summary.trim()) {
    throw new Error("AI response did not include a summary");
  }

  return parsed.summary.trim();
}
