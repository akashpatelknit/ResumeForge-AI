interface BuildQuickApplyExtractPromptParams {
  pastedText: string;
}

// Small, dedicated extraction prompt for Quick Apply's "Paste Job Post or
// Context" field — same "only extract what's actually stated" contract as
// buildJobIdentityPrompt.ts, extended with a recipient email field since
// Quick Apply postings often include a direct "send resume to..." address,
// and a jobId field (Job ID / Requisition Number) that unlocks the Referral
// Request message-type option in the UI (see QuickApplyModal.tsx).
export function buildQuickApplyExtractPrompt({ pastedText }: BuildQuickApplyExtractPromptParams) {
  return `
Extract the following four fields from the PASTED TEXT below, if and only
if they are explicitly and clearly present in the text.

FIELDS:
- recipientEmail: an email address explicitly stated as a contact or application address
- companyName: the hiring company's name
- roleTitle: the job title / role being hired for
- jobId: a job ID / requisition number / posting reference code — look for
  labels like "Job ID:", "Req ID:", "Requisition Number:", "Posting ID:",
  "Reference:", or a standalone alphanumeric code clearly presented as the
  posting's identifier (e.g. "REQ-12345", "JOB-2024-0091"). Do not treat an
  unlabeled number or code as a Job ID unless the surrounding text makes it
  unambiguous that it identifies this specific posting.

RULES:
- Do NOT guess, infer, or invent a value that isn't clearly stated in the text.
- If a field isn't identifiable, return null for it (not an empty string, not a guess).
- This is a short, possibly partial snippet — it is expected and fine for some or all fields to be missing.

PASTED TEXT:
${pastedText}

OUTPUT FORMAT (STRICT JSON ONLY):
{
  "recipientEmail": "..." or null,
  "companyName": "..." or null,
  "roleTitle": "..." or null,
  "jobId": "..." or null
}

Return ONLY valid JSON.
`;
}
