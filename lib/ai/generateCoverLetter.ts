import { callAiGateway } from "./gateway";
import { outreachCoverLetterSchema } from "./schemas";
import { buildCoverLetterPrompt } from "./buildCoverLetterPrompt";

interface GenerateCoverLetterParams {
  resume: string | object;
  jobDescription?: string | object;
  tone?: string;
}

export async function generateCoverLetter(
  { resume, jobDescription, tone }: GenerateCoverLetterParams,
  userId: string,
): Promise<string> {
  const parsed = await callAiGateway({
    feature: "outreach.coverLetter",
    userId,
    input: { resume, jobDescription, tone },
    promptBuilder: buildCoverLetterPrompt,
    outputSchema: outreachCoverLetterSchema,
    freeText: [
      typeof resume === "string" ? resume : undefined,
      typeof jobDescription === "string" ? jobDescription : undefined,
    ],
  });

  if (!parsed.coverLetter.trim()) {
    throw new Error("AI response did not include a cover letter");
  }

  return parsed.coverLetter.trim();
}
