import { generateText } from "../gemini";
import { LINKEDIN_PROMPTS } from "./prompts";

export async function generateLinkedInContent({
  tool,
  resume,
  jobDescription,
  tone,
}: {
  tool: keyof typeof LINKEDIN_PROMPTS;
  resume: string;
  jobDescription?: string;
  tone?: string;
}) {
  const prompt = `
    You are a professional AI career assistant specializing in LinkedIn communication.

    Global Rules:
    - Never explain your reasoning
    - Never provide templates
    - Always produce final ready-to-use content

    RESUME:
    ${JSON.stringify(resume, null, 2)}

    JOB DESCRIPTION:
    ${jobDescription ?? "Not provided"}

    TONE:
    ${tone ?? "Friendly"}

    TASK:
    ${LINKEDIN_PROMPTS[tool]}
    `;

  // return prompt;

  return await generateText(prompt);
}
