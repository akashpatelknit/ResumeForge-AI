import { callAiGateway } from "./gateway";
import { linkedInAuditSchema } from "./schemas";
import { buildLinkedInAuditPrompt } from "./buildLinkedInAuditPrompt";

export interface LinkedInAuditResult {
  headlineScore: number;
  headlineSuggestions: string[];
  aboutSuggestions: string[];
  missingKeywords: string[];
  rewrittenHeadline?: string;
  rewrittenAbout?: string;
}

interface GenerateLinkedInAuditParams {
  headline: string;
  aboutSection: string;
  resume?: string | object;
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (v): v is string => typeof v === "string" && v.trim().length > 0,
  );
}

export async function generateLinkedInAudit(
  { headline, aboutSection, resume }: GenerateLinkedInAuditParams,
  userId: string,
): Promise<LinkedInAuditResult> {
  const parsed = await callAiGateway({
    feature: "linkedin.audit",
    userId,
    input: { headline, aboutSection, resume },
    promptBuilder: buildLinkedInAuditPrompt,
    outputSchema: linkedInAuditSchema,
    freeText: [headline, aboutSection],
  });

  const hasResume = resume !== undefined && resume !== null;

  return {
    headlineScore: Math.max(0, Math.min(100, Math.round(parsed.headlineScore))),
    headlineSuggestions: toStringArray(parsed.headlineSuggestions),
    aboutSuggestions: toStringArray(parsed.aboutSuggestions),
    // Defensively cleared when no resume was given, regardless of what the
    // model returned — matches the API contract ("only populate if resumeId
    // was provided") rather than trusting the model to have honored it.
    missingKeywords: hasResume ? toStringArray(parsed.missingKeywords) : [],
    rewrittenHeadline:
      typeof parsed.rewrittenHeadline === "string" &&
      parsed.rewrittenHeadline.trim()
        ? parsed.rewrittenHeadline.trim()
        : undefined,
    rewrittenAbout:
      typeof parsed.rewrittenAbout === "string" &&
      parsed.rewrittenAbout.trim()
        ? parsed.rewrittenAbout.trim()
        : undefined,
  };
}
