import "server-only";

// Thrown by callAiGateway() (lib/ai/gateway.ts) — kept in their own file
// (rather than inline in gateway.ts or lib/ai/policy/refusal.ts) so both
// the gateway (which throws them) and refusal.ts's aiRouteErrorResponse
// (which catches and formats them) can import from one place without a
// circular import between those two.

export const AI_BLOCKED_MESSAGE =
  "AI features are currently unavailable for your account. Contact support if you believe this is an error.";

// Checked FIRST in the gateway, before credits — see prisma/schema.prisma's
// UserCredits.aiAccessBlocked doc comment for why this is separate from a
// full-account UserStatus.isBlocked.
export class AiBlockedError extends Error {
  reason?: string | null;

  constructor(reason?: string | null) {
    super(AI_BLOCKED_MESSAGE);
    this.name = "AiBlockedError";
    this.reason = reason;
  }
}

// Thrown when (monthlyAllowance - creditsUsedThisMonth) + bonusCredits is
// less than the feature's creditCost — before Gemini is ever called, so a
// rejected call never costs the user anything.
export class AiCreditsError extends Error {
  required: number;
  available: number;

  constructor(required: number, available: number) {
    super(
      `You don't have enough AI credits for this (needs ${required}, you have ${available} left this month). Upgrade to Pro for a much higher monthly allowance.`,
    );
    this.name = "AiCreditsError";
    this.required = required;
    this.available = available;
  }
}
