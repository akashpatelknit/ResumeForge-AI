import { z } from "zod";

// One Zod schema per AI_FEATURES entry (lib/ai/features.ts) — the shape
// callAiGateway() validates a feature's parsed JSON against before handing
// it back to the caller. These intentionally mirror the *existing* manual
// checks each generateX.ts already performed (a hard `throw` on a missing/
// wrong-typed required field, everything else left loose) rather than a
// stricter ideal shape — tightening them is a separate, deliberate change,
// not a side effect of introducing the gateway.

export const resumeSummarySchema = z.object({
  summary: z.string(),
});

export const resumeAchievementsSchema = z.object({
  achievements: z.array(z.unknown()),
});

export const resumeHighlightsSchema = z.object({
  highlights: z.array(z.unknown()),
});

export const resumeCustomSectionSchema = z.object({
  heading: z.string(),
  subheading: z.unknown().optional(),
  bulletPoints: z.array(z.unknown()).optional(),
});

// generateTailorResume.ts never throws on shape today — every field is
// defensively reconciled against the original resume. Just require valid
// JSON that's actually an object (rejects e.g. a bare array or string).
export const resumeTailorSchema = z.looseObject({});

export const resumeParseSchema = z.looseObject({});

export const resumeLatexImportSchema = z.looseObject({});

export const resumeProjectFromRepoSchema = z.object({
  projectName: z.string(),
  description: z.unknown().optional(),
  highlights: z.array(z.unknown()).optional(),
  techStack: z.array(z.unknown()).optional(),
});

export const jobAnalyzeSchema = z.object({
  score: z.number(),
  matchedKeywords: z.array(z.unknown()).optional(),
  missingKeywords: z.array(z.unknown()).optional(),
  suggestions: z.array(z.unknown()).optional(),
});

export const jobExtractIdentitySchema = z.looseObject({});

export const linkedInAuditSchema = z.object({
  headlineScore: z.number(),
  headlineSuggestions: z.array(z.unknown()).optional(),
  aboutSuggestions: z.array(z.unknown()).optional(),
  missingKeywords: z.array(z.unknown()).optional(),
  rewrittenHeadline: z.unknown().optional(),
  rewrittenAbout: z.unknown().optional(),
});

// linkedin.ts returns raw generated text, not JSON — the gateway falls back
// to validating the raw string directly when JSON parsing fails (see
// gateway.ts), so this is a plain non-empty string schema.
export const linkedInOutreachSchema = z.string().min(1);

export const outreachColdEmailSchema = z.object({
  subjects: z.array(z.unknown()),
  emails: z.array(z.unknown()),
});

export const outreachCoverLetterSchema = z.object({
  coverLetter: z.string(),
});

export const outreachQuickApplyExtractSchema = z.looseObject({});

export const outreachQuickApplyEmailSchema = z.object({
  subject: z.string(),
  body: z.string(),
});

export const outreachScheduledEmailSchema = z.object({
  subject: z.string(),
  body: z.string(),
});
