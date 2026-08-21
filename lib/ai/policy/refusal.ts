import "server-only";
import { NextResponse } from "next/server";
import { AiRateLimitError } from "@/lib/ai/rateLimit";

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
// refusal/rate-limit handling by touching one file rather than 17: a
// refusal gets the fixed message and a 422 (the request was well-formed,
// the model just declined it); a rate limit gets a 429 with a Retry-After
// header and the fixed rate-limit message; everything else keeps that
// route's own existing fallback message and 500, unchanged from before the
// policy pass.
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
  return NextResponse.json({ error: fallbackMessage }, { status: 500 });
}
