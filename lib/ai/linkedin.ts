import { generateText } from "../openai";
import { LINKEDIN_PROMPTS } from "./linkedinPrompts";

export async function generateLinkedInContent({
  tool,
  resume,
  jobDescription,
  tone,
  manualInputs,
}: {
  tool: keyof typeof LINKEDIN_PROMPTS;
  resume: string | object;
  jobDescription?: string | object;
  manualInputs?: Record<string, string>;
  tone?: string;
}) {
  const resumeText =
    typeof resume === "string"
      ? resume.trim()
      : JSON.stringify(resume, null, 2);

  const jobDesc =
    typeof jobDescription === "string"
      ? jobDescription.trim()
      : JSON.stringify(jobDescription ?? "");

  const hasJobDescription = jobDesc.trim().length > 0;
  const hasManualInputs = manualInputs && Object.keys(manualInputs).length > 0;

  const prompt = `
TASK: ${tool.toUpperCase()}

TONE: ${tone ?? "Professional"}

RESUME:
${resumeText}

JOB DESCRIPTION:
${hasJobDescription ? jobDesc : "Not provided — write naturally without referencing a specific role or company."}

${
  hasJobDescription
    ? `EXTRACTION TASK:
Before writing the message, silently extract the following from the JOB DESCRIPTION if present:
- Role Name
- Job ID / Requisition ID
- Company Name
- Location
- Job Type (Full-time / Contract / Part-time)
- Work Mode (Remote / Hybrid / On-site)

Use these extracted values naturally in the message where relevant.
Do NOT list or display the extracted values — just use them in the output.`
    : ""
}

${
  hasManualInputs
    ? `ADDITIONAL CONTEXT:\n${Object.entries(manualInputs!)
        .map(([key, value]) => `${key}: ${value}`)
        .join("\n")}`
    : ""
}

INSTRUCTIONS:
${LINKEDIN_PROMPTS[tool]}
  `.trim();

  return await generateText(prompt);
}
