import "server-only";
import { z } from "zod";
import { generateText } from "./llm";
import { AI_FEATURES, type AiFeature } from "./features";
import { checkFreeText } from "./policy/scope";
import { buildPolicyPreamble } from "./policy/preamble";
import { AiRefusalError } from "./policy/refusal";
import { checkAiRateLimit, AiRateLimitError } from "./rateLimit";
import { prisma } from "@/lib/prisma";

// Every AI feature in the app is required to call the provider through this
// module — nothing else may import lib/ai/llm.ts directly. That's what
// makes the set of AI operations closed (AI_FEATURES) and every call
// consistently validated and logged (AiUsageLog), instead of each feature
// hand-rolling its own generateText()/parseAIJson() pair.
//
// Layered on top of the base gateway: scope policy + prompt-injection
// defense (deterministic pre-check on free-text input, an always-on
// untrusted-data preamble, and an output-level refusal shape), and
// two-tier rate limiting (per-feature + global-per-user, see
// lib/ai/rateLimit.ts). Still explicitly NOT handled here: credits,
// idempotency, and model routing, and rate limits don't yet vary by plan
// — separate follow-up passes on top of this gateway.

export class AiGatewayError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AiGatewayError";
  }
}

// Rough estimate only (~4 chars/token) — none of the three provider clients
// (lib/ai/providers/*.ts) currently return real usage metadata through the
// shared generateText(prompt): string interface, so this is what both the
// input-size cap and the logged token counts are based on. Good enough for
// "is this input way too big" and "roughly how much did this cost" — not
// billing-grade.
const CHARS_PER_TOKEN = 4;

function estimateTokens(text: string): number {
  return Math.ceil(text.length / CHARS_PER_TOKEN);
}

// Single definition of the strip-fences-then-parse pattern that used to be
// copy-pasted into nearly every lib/ai/generate*.ts file.
function parseAIJson(text: string): unknown {
  const cleaned = text
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();

  return JSON.parse(cleaned);
}

// Checked against every parsed response, before the feature's own
// outputSchema — this is what makes { refused: true, reason: "..." } a
// valid alternative response shape for every one of the 17 features
// without having to union it into each individual schema in schemas.ts.
const refusalSchema = z.object({
  refused: z.literal(true),
  reason: z.string().optional(),
});

type UsageStatus =
  | "success"
  // Free text contained injection-style phrasing (see policy/scope.ts) but
  // the call proceeded and completed normally — logged distinctly so these
  // attempts stay auditable even when they don't work.
  | "success_flagged_injection"
  | "refused"
  | "rate_limited"
  | "rejected_invalid_input"
  | "rejected_input_too_large"
  | "empty_response"
  | "provider_error"
  | "validation_error";

async function logUsage(entry: {
  userId: string;
  feature: AiFeature;
  model: string;
  status: UsageStatus;
  inputTokens?: number;
  outputTokens?: number;
}): Promise<void> {
  try {
    await prisma.aiUsageLog.create({
      data: {
        userId: entry.userId,
        feature: entry.feature,
        model: entry.model,
        status: entry.status,
        inputTokens: entry.inputTokens ?? null,
        outputTokens: entry.outputTokens ?? null,
      },
    });
  } catch (error) {
    // Logging must never take down the actual AI feature it's observing.
    console.error("Failed to write AiUsageLog entry:", error);
  }
}

interface CallAiGatewayParams<TInput, TOutput> {
  feature: AiFeature;
  userId: string;
  input: TInput;
  promptBuilder: (input: TInput) => string;
  outputSchema: z.ZodType<TOutput>;
  // The subset of `input` that's free-form user/external text (job
  // description paste, resume text, LinkedIn About section, ...) as
  // opposed to structured fields (ids, enums, short titles) — those don't
  // need this check, the endpoint itself already defines the allowed
  // operation. Each generateX.ts wrapper knows which of its own fields
  // these are; omit entirely for calls with no free-text surface at all.
  freeText?: (string | undefined | null)[];
}

export async function callAiGateway<TInput, TOutput>({
  feature,
  userId,
  input,
  promptBuilder,
  outputSchema,
  freeText,
}: CallAiGatewayParams<TInput, TOutput>): Promise<TOutput> {
  const config = AI_FEATURES[feature];
  if (!config) {
    throw new AiGatewayError(`Unknown AI feature "${feature}" — not registered in AI_FEATURES`);
  }

  // First gate, before anything else — an over-limit caller shouldn't burn
  // a free-text check, a prompt build, or a Gemini call just to get
  // rejected. Counts every attempt (this call included), not just
  // successful completions — that's the correct meaning of "N AI requests
  // per window" for abuse prevention.
  const rateLimitResult = await checkAiRateLimit(userId, feature, config.rateLimit);
  if (!rateLimitResult.allowed) {
    await logUsage({ userId, feature, model: config.model, status: "rate_limited" });
    throw new AiRateLimitError(rateLimitResult.retryAfterSeconds ?? config.rateLimit.windowSeconds);
  }

  // Deterministic pre-check, before any prompt is built or LLM called —
  // cheap rejection of obvious garbage, plus a non-blocking flag for
  // obvious injection phrasing (see policy/scope.ts for why that flags
  // rather than rejects).
  let injectionFlagged = false;
  for (const text of freeText ?? []) {
    if (!text || !text.trim()) continue;
    const check = checkFreeText(text);
    if (!check.ok) {
      await logUsage({ userId, feature, model: config.model, status: "rejected_invalid_input" });
      throw new AiGatewayError(check.rejectionReason ?? `Input for "${feature}" was rejected`);
    }
    if (check.injectionFlagged) injectionFlagged = true;
  }

  const featurePrompt = promptBuilder(input);
  const prompt = `${buildPolicyPreamble()}\n\n${featurePrompt}`;

  const maxInputChars = config.maxInputTokens * CHARS_PER_TOKEN;
  if (prompt.length > maxInputChars) {
    await logUsage({ userId, feature, model: config.model, status: "rejected_input_too_large" });
    throw new AiGatewayError(
      `Input for "${feature}" is too large (~${estimateTokens(prompt)} tokens, limit ~${config.maxInputTokens})`,
    );
  }

  const rawText = await generateText(prompt).catch(async (error) => {
    await logUsage({ userId, feature, model: config.model, status: "provider_error" });
    throw error;
  });

  if (!rawText) {
    await logUsage({ userId, feature, model: config.model, status: "empty_response" });
    throw new AiGatewayError(`AI response was empty for "${feature}"`);
  }

  // Most features return JSON; linkedin.outreach returns plain generated
  // text. Rather than have every feature declare its own response format,
  // try JSON first and fall back to validating the raw text itself — a
  // string-shaped outputSchema accepts that fallback, an object-shaped one
  // fails validation same as it would on any other malformed response.
  let candidate: unknown;
  try {
    candidate = parseAIJson(rawText);
  } catch {
    candidate = rawText;
  }

  const refusal = refusalSchema.safeParse(candidate);
  if (refusal.success) {
    await logUsage({
      userId,
      feature,
      model: config.model,
      status: "refused",
      inputTokens: estimateTokens(prompt),
      outputTokens: estimateTokens(rawText),
    });
    // The model's own `reason` is logged above for debugging but never
    // surfaced to the caller — the frontend always gets the same fixed
    // message (see policy/refusal.ts), regardless of what the model wrote.
    throw new AiRefusalError(refusal.data.reason);
  }

  const result = outputSchema.safeParse(candidate);
  if (!result.success) {
    await logUsage({
      userId,
      feature,
      model: config.model,
      status: "validation_error",
      inputTokens: estimateTokens(prompt),
      outputTokens: estimateTokens(rawText),
    });
    throw new AiGatewayError(
      `AI response for "${feature}" did not match the expected shape: ${result.error.message}`,
    );
  }

  await logUsage({
    userId,
    feature,
    model: config.model,
    status: injectionFlagged ? "success_flagged_injection" : "success",
    inputTokens: estimateTokens(prompt),
    outputTokens: estimateTokens(rawText),
  });

  return result.data;
}
