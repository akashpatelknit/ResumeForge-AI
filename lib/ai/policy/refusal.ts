import "server-only";
import { NextResponse } from "next/server";
import { AiRateLimitError } from "@/lib/ai/rateLimit";
import { AiBlockedError, AiCreditsError } from "@/lib/credits/errors";

// Fixed message shown to the frontend for every refusal, regardless of
// whatever "reason" text the model itself produced — never surface the
// model's own explanation directly (see gateway.ts's refusal handling).
export const AI_REFUSAL_MESSAGE =
  "I can only help with resume, job application, and career-related tasks.";

// Deliberately extends Error directly rather than gateway.ts's
// AiGatewayError — gateway.ts imports this module (to throw
// AiRefusalError), so importing AiGatewayError back from gateway.ts here
// would be a circular import.
export class AiRefusalError extends Error {
  reason?: string;

  constructor(reason?: string) {
    super(AI_REFUSAL_MESSAGE);
    this.name = "AiRefusalError";
    this.reason = reason;
  }
}

// Shared catch-block helper for every AI route — despite the file name
// (kept from when this only handled refusals), this is now the one place
// that turns any gateway error into an HTTP response, so every route gets
// refusal/rate-limit/credit handling by touching one file rather than 17:
// a refusal gets the fixed message and a 422 (the request was well-formed,
// the model just declined it); a rate limit gets a 429 with a Retry-After
// header and the fixed rate-limit message; an AI-access block or an
// insufficient-credits rejection (lib/credits/errors.ts, thrown by
// lib/ai/gateway.ts before Gemini is ever called) both get a 403 with the
// same { error: "UPGRADE_REQUIRED" | "AI_ACCESS_BLOCKED", message } shape
// lib/subscription/checkResumeCreationGate already uses, so
// lib/subscription/upgradeToast.ts's existing frontend helpers work for AI
// rejections too; everything else keeps that route's own existing fallback
// message and 500, unchanged from before the policy pass.
export function aiRouteErrorResponse(error: unknown, fallbackMessage: string): NextResponse {
  if (error instanceof AiRefusalError) {
    return NextResponse.json({ error: AI_REFUSAL_MESSAGE }, { status: 422 });
  }
  if (error instanceof AiRateLimitError) {
    return NextResponse.json(
      { error: error.message, retryAfterSeconds: error.retryAfterSeconds },
      { status: 429, headers: { "Retry-After": String(error.retryAfterSeconds) } },
    );
  }
  if (error instanceof AiBlockedError) {
    return NextResponse.json({ error: "AI_ACCESS_BLOCKED", message: error.message }, { status: 403 });
  }
  if (error instanceof AiCreditsError) {
    return NextResponse.json(
      { error: "UPGRADE_REQUIRED", message: error.message, required: error.required, available: error.available },
      { status: 403 },
    );
  }
  return NextResponse.json({ error: fallbackMessage }, { status: 500 });
}
