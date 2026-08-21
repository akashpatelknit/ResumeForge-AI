import { callAiGateway } from "./gateway";
import { outreachColdEmailSchema } from "./schemas";
import { buildColdEmailPrompt } from "./buildColdEmailPrompt";

export async function generateColdEmails(payload: any, userId: string) {
  return callAiGateway({
    feature: "outreach.coldEmail",
    userId,
    input: payload,
    promptBuilder: buildColdEmailPrompt,
    outputSchema: outreachColdEmailSchema,
    freeText: [
      typeof payload?.jobDescription === "string" ? payload.jobDescription : undefined,
      typeof payload?.resume === "string" ? payload.resume : undefined,
    ],
  });
}
