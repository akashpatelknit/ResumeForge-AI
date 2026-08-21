import "server-only";
import type { AiScope } from "./policy/scope";
import type { RateLimitConfig } from "./rateLimit";

// Closed registry of every AI operation the app is allowed to perform.
// callAiGateway() (lib/ai/gateway.ts) rejects any feature name not listed
// here — this is what makes "every AI call in the app" a fixed, auditable
// set instead of an open-ended one.
//
// `model` is descriptive metadata only (stored on AiUsageLog for
// reporting) — it does NOT select which provider/model actually serves the
// call. That's still resolved by lib/ai/llm.ts from env vars
// (GEMINI_API_KEY / OPENAI_API_KEY / ANTHROPIC_API_KEY, optionally pinned
// via AI_PROVIDER), same as before the gateway existed. Model routing is
// out of scope for this pass.
//
// maxInputTokens/maxOutputTokens are enforced on the *input* side only
// (see gateway.ts) — maxOutputTokens is recorded as intent/logging context
// today, not passed to the provider as a hard cap (none of the three
// provider clients currently accept a per-call token limit).
//
// `scope` (lib/ai/policy/scope.ts) is which of the 7 allowed categories
// this feature falls under. It's not branched on at call time — the
// endpoint itself already defines the allowed operation — this is the
// registry-side half of "the categories match the registry," and the
// source of truth for AiUsageLog auditing / the policy preamble's category
// list.
//
// `rateLimit` (lib/ai/rateLimit.ts) is the per-feature abuse-prevention
// cap, checked in the gateway alongside a single global per-user cap
// (AI_GLOBAL_RATE_LIMIT). Same limit for every plan today — Free vs. Pro
// differences are a credit-system-pass decision, not this one. Roughly:
// cheap/fast single-field rewrites get generous limits, multi-field or
// long-generation operations get tighter ones, matched to maxOutputTokens
// above as a proxy for how expensive/slow the call is.
interface FeatureConfig {
  model: string;
  maxInputTokens: number;
  maxOutputTokens: number;
  scope: AiScope;
  rateLimit: RateLimitConfig;
}

export const AI_FEATURES = {
  "resume.summary": { model: "gemini-flash-latest", maxInputTokens: 1500, maxOutputTokens: 300, scope: "resume", rateLimit: { requests: 5, windowSeconds: 60 } },
  "resume.achievements": { model: "gemini-flash-latest", maxInputTokens: 2000, maxOutputTokens: 500, scope: "resume", rateLimit: { requests: 5, windowSeconds: 60 } },
  "resume.highlights": { model: "gemini-flash-latest", maxInputTokens: 2000, maxOutputTokens: 500, scope: "resume", rateLimit: { requests: 5, windowSeconds: 60 } },
  "resume.customSection": { model: "gemini-flash-latest", maxInputTokens: 2000, maxOutputTokens: 500, scope: "resume", rateLimit: { requests: 5, windowSeconds: 60 } },
  "resume.tailor": { model: "gemini-flash-latest", maxInputTokens: 8000, maxOutputTokens: 3000, scope: "resume", rateLimit: { requests: 1, windowSeconds: 30 } },
  "resume.parse": { model: "gemini-flash-latest", maxInputTokens: 12000, maxOutputTokens: 4000, scope: "resume", rateLimit: { requests: 1, windowSeconds: 20 } },
  "resume.latexImport": { model: "gemini-flash-latest", maxInputTokens: 12000, maxOutputTokens: 4000, scope: "resume", rateLimit: { requests: 1, windowSeconds: 20 } },
  "resume.projectFromRepo": { model: "gemini-flash-latest", maxInputTokens: 6000, maxOutputTokens: 800, scope: "resume", rateLimit: { requests: 3, windowSeconds: 60 } },
  "job.analyze": { model: "gemini-flash-latest", maxInputTokens: 6000, maxOutputTokens: 2000, scope: "job_search", rateLimit: { requests: 3, windowSeconds: 60 } },
  "job.extractIdentity": { model: "gemini-flash-latest", maxInputTokens: 3000, maxOutputTokens: 300, scope: "job_search", rateLimit: { requests: 8, windowSeconds: 60 } },
  "linkedin.audit": { model: "gemini-flash-latest", maxInputTokens: 3000, maxOutputTokens: 1000, scope: "linkedin", rateLimit: { requests: 3, windowSeconds: 60 } },
  "linkedin.outreach": { model: "gemini-flash-latest", maxInputTokens: 4000, maxOutputTokens: 600, scope: "linkedin", rateLimit: { requests: 4, windowSeconds: 60 } },
  "outreach.coldEmail": { model: "gemini-flash-latest", maxInputTokens: 4000, maxOutputTokens: 1500, scope: "outreach", rateLimit: { requests: 3, windowSeconds: 60 } },
  "outreach.coverLetter": { model: "gemini-flash-latest", maxInputTokens: 6000, maxOutputTokens: 1200, scope: "cover_letter", rateLimit: { requests: 1, windowSeconds: 10 } },
  "outreach.quickApplyExtract": { model: "gemini-flash-latest", maxInputTokens: 3000, maxOutputTokens: 400, scope: "outreach", rateLimit: { requests: 10, windowSeconds: 60 } },
  "outreach.quickApplyEmail": { model: "gemini-flash-latest", maxInputTokens: 4000, maxOutputTokens: 600, scope: "outreach", rateLimit: { requests: 4, windowSeconds: 60 } },
  "outreach.scheduledEmail": { model: "gemini-flash-latest", maxInputTokens: 4000, maxOutputTokens: 600, scope: "outreach", rateLimit: { requests: 5, windowSeconds: 60 } },
} as const satisfies Record<string, FeatureConfig>;

export type AiFeature = keyof typeof AI_FEATURES;
