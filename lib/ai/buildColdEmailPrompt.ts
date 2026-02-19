import { COLD_EMAIL_PROMPTS } from "./coldEmailPrompts";

export function buildColdEmailPrompt({
  emailType,
  resume,
  jobDescription,
  tone,
  sequenceLength,
  followupSchedule,
}: any) {
  return `
You are an expert career communication assistant.

Generate a professional cold email sequence.

GLOBAL RULES:
- Write natural human emails
- No placeholders
- No explanations
- No markdown formatting
- Tone: ${tone}
- Emails must feel personalized
- Each follow-up should add new value

RESUME:
${JSON.stringify(resume, null, 2)}

JOB DESCRIPTION:
${jobDescription || "Not provided"}

TASK:
${COLD_EMAIL_PROMPTS[emailType as keyof typeof COLD_EMAIL_PROMPTS]}

SEQUENCE LENGTH:
${sequenceLength} emails

FOLLOW-UP SCHEDULE (days):
${JSON.stringify(followupSchedule)}

OUTPUT FORMAT (STRICT JSON ONLY):

{
  "subjects": ["subject 1","subject 2","subject 3"],
  "emails": [
    {
      "day": 0,
      "label": "Initial Email",
      "subject": "",
      "body": ""
    }
  ]
}

Return ONLY valid JSON.
`;
}
