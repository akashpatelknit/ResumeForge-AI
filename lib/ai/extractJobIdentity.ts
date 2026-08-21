import { callAiGateway } from "./gateway";
import { jobExtractIdentitySchema } from "./schemas";
import { buildJobIdentityPrompt } from "./buildJobIdentityPrompt";

export interface JobIdentityResult {
  companyName: string;
  roleTitle: string;
}

export async function extractJobIdentity(
  jobDescription: string,
  userId: string,
): Promise<JobIdentityResult> {
  const parsed = (await callAiGateway({
    feature: "job.extractIdentity",
    userId,
    input: { jobDescription },
    promptBuilder: buildJobIdentityPrompt,
    outputSchema: jobExtractIdentitySchema,
    freeText: [jobDescription],
  })) as { companyName?: unknown; roleTitle?: unknown };

  return {
    companyName:
      typeof parsed.companyName === "string" ? parsed.companyName.trim() : "",
    roleTitle:
      typeof parsed.roleTitle === "string" ? parsed.roleTitle.trim() : "",
  };
}
