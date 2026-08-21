import { callAiGateway } from "./gateway";
import { outreachQuickApplyExtractSchema } from "./schemas";
import { buildQuickApplyExtractPrompt } from "./buildQuickApplyExtractPrompt";

export interface QuickApplyExtractResult {
  recipientEmail: string | null;
  companyName: string | null;
  roleTitle: string | null;
  jobId: string | null;
}

function cleanField(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export async function generateQuickApplyExtract(pastedText: string, userId: string): Promise<QuickApplyExtractResult> {
  // No `freeText` pre-check here on purpose: this route is documented
  // (app/api/outreach/quick-apply/extract/route.ts) as deliberately lenient
  // — pasted context is expected to be a short, partial snippet, and the
  // stricter nonsense-detection is explicitly reserved for the generate
  // endpoint. Adding a length/gibberish reject here would undo that
  // existing product decision. Still covered by the always-on preamble +
  // output-level refusal check, same as every other feature.
  const parsed = (await callAiGateway({
    feature: "outreach.quickApplyExtract",
    userId,
    input: { pastedText },
    promptBuilder: buildQuickApplyExtractPrompt,
    outputSchema: outreachQuickApplyExtractSchema,
  })) as {
    recipientEmail?: unknown;
    companyName?: unknown;
    roleTitle?: unknown;
    jobId?: unknown;
  };

  return {
    recipientEmail: cleanField(parsed.recipientEmail),
    companyName: cleanField(parsed.companyName),
    roleTitle: cleanField(parsed.roleTitle),
    jobId: cleanField(parsed.jobId),
  };
}
