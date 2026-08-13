interface ResumeContext {
  name?: string;
  targetRole?: string;
}

interface BuildSummaryPromptParams {
  // Optional now — the user can leave this blank and just have their
  // existing summary polished, or paste either background notes or a job
  // description to tailor toward. Which one it is gets figured out by the
  // model from the text itself rather than a UI toggle.
  rawInput?: string;
  existingSummary?: string;
  resumeContext?: ResumeContext;
}

export function buildSummaryPrompt({
  rawInput,
  existingSummary,
  resumeContext,
}: BuildSummaryPromptParams) {
  const hasRawInput = !!rawInput?.trim();
  const hasExistingSummary = !!existingSummary?.trim();

  const instructions = hasRawInput
    ? hasExistingSummary
      ? `The candidate has an EXISTING SUMMARY below and has also pasted ADDITIONAL INPUT.
First figure out what the additional input is:
- If it reads like a job description or job posting, treat it as a TARGET JOB DESCRIPTION: rewrite the existing summary to emphasize the skills, experience, and language most relevant to that specific job, without inventing anything not already true of the candidate.
- Otherwise, treat it as extra background notes: merge it with the existing summary into one improved summary.`
      : `The candidate pasted RAW INPUT below — this could be a LinkedIn "About" section, rough notes, a brain-dump about their background, or a job description they're targeting. If it reads like a job posting, write a summary that highlights how a candidate with the given name/role context would fit it, without inventing specific experience not mentioned anywhere. Otherwise, extract the relevant professional details from it and write a summary.`
    : `The candidate provided no new input — just rewrite and improve the EXISTING SUMMARY below into a stronger, more polished 2-3 sentence version. Same underlying facts, better writing, nothing invented.`;

  return `
You are an expert resume writer.

${instructions}

${resumeContext?.name ? `Candidate name: ${resumeContext.name}` : ""}
${resumeContext?.targetRole ? `Target role: ${resumeContext.targetRole}` : ""}

RULES:
- Exactly 2-3 sentences
- Resume-appropriate tone, third person implied (no "I")
- No placeholders, no markdown formatting, no surrounding quotation marks
- Do not invent facts, companies, titles, or numbers not grounded in the input below
- Output only the summary content — no preamble like "Here is your summary"
${hasExistingSummary ? `\nEXISTING SUMMARY:\n"""\n${existingSummary}\n"""` : ""}
${hasRawInput ? `\n${hasExistingSummary ? "ADDITIONAL INPUT (background notes or a target job description)" : "RAW INPUT"}:\n"""\n${rawInput}\n"""` : ""}

OUTPUT FORMAT (STRICT JSON ONLY):
{ "summary": "..." }

Return ONLY valid JSON.
`;
}
