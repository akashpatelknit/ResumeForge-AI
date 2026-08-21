import "server-only";
import { looksLikeGibberish } from "@/lib/validation/textSanity";

// Scope categories every AI feature falls under — see the `scope` field on
// each AI_FEATURES entry (lib/ai/features.ts). For most features the scope
// is already implicit in which endpoint was called (resume.tailor is
// inherently "resume" scope) — this taxonomy exists for logging/auditing
// and so the policy preamble's allowed-categories list has one source of
// truth, not because callers branch on it today.
export const AI_SCOPES = [
  "resume",
  "job_search",
  "cover_letter",
  "linkedin",
  "outreach",
  "interview",
  "career",
] as const;

export type AiScope = (typeof AI_SCOPES)[number];

// First-pass, deterministic heuristics run on free-text fields BEFORE the
// prompt is even built — cheap enough to run on every call, and cuts off
// the obvious junk before it burns a Gemini call. This is not the real
// defense against prompt injection (an LLM can't be fully secured by
// regexes); it's a cheap pre-filter. The actual defense is the untrusted-
// data framing in the policy preamble (lib/ai/policy/preamble.ts) plus the
// model's own { refused: true } escape hatch, enforced in gateway.ts.

// Below this, there's no realistic way the text is genuine content of the
// expected type (a real job description, resume, or profile section) —
// short legitimate fields (a role title, a company name) go through
// lib/validation/textSanity.ts's own looksLikeGibberish() at the route
// layer instead, not this check.
const DEFAULT_MIN_LENGTH = 15;

// Deliberately simple substring/regex matches, not an NLP classifier — the
// goal is catching an unsophisticated injection attempt for logging and
// stricter downstream handling, not proving a negative. Innocent text can
// legitimately contain these phrases (a job description quoting "act as a
// thought leader" in its culture blurb) — that's exactly why a match here
// FLAGS rather than rejects; the actual task still proceeds, defended by
// the prompt-level untrusted-data framing.
const INJECTION_PATTERNS: RegExp[] = [
  /ignore\s+(all\s+|any\s+|the\s+)?(previous|prior|above|earlier)\s+instructions?/i,
  /ignore\s+the\s+above/i,
  /disregard\s+(all\s+|any\s+|the\s+)?(previous|prior|above)\s+instructions?/i,
  /forget\s+(all\s+|your\s+)?(previous|prior)\s+instructions?/i,
  /you\s+are\s+now\b/i,
  /new\s+instructions?\s*:/i,
  /system\s*(prompt|message)\b/i,
  /\bact\s+as\b/i,
  /pretend\s+(you\s+are|to\s+be)\b/i,
];

export interface FreeTextCheckResult {
  ok: boolean;
  // Set only when ok is false — why the input was rejected outright.
  rejectionReason?: string;
  // True when injection-style phrasing was found. Does NOT set ok to
  // false — the caller proceeds to the LLM as normal, this is purely for
  // AiUsageLog visibility (see gateway.ts's "flagged_possible_injection"
  // status) so these attempts are auditable even when they don't work.
  injectionFlagged: boolean;
}

export function checkFreeText(text: string, options?: { minLength?: number }): FreeTextCheckResult {
  const trimmed = text.trim();
  const minLength = options?.minLength ?? DEFAULT_MIN_LENGTH;

  if (trimmed.length < minLength) {
    return {
      ok: false,
      rejectionReason: `Input is too short to be genuine content (minimum ${minLength} characters)`,
      injectionFlagged: false,
    };
  }

  if (looksLikeGibberish(trimmed)) {
    return {
      ok: false,
      rejectionReason: "Input doesn't look like real content — check what was pasted and try again",
      injectionFlagged: false,
    };
  }

  const injectionFlagged = INJECTION_PATTERNS.some((pattern) => pattern.test(trimmed));

  return { ok: true, injectionFlagged };
}
