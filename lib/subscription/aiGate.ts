import "server-only";
import { NextResponse } from "next/server";
import { getUserPlan, type Plan } from "./getUserPlan";
import { checkUsageLimit, incrementUsage } from "./checkUsageLimit";

export type AiGateResult = { allowed: true; plan: Plan } | { allowed: false; response: NextResponse };

// Called at the top of every AI generation route, before doing any actual
// generation work. Pro users always pass without touching UsageCounter.
// Free users are checked against the monthly cap. This only checks — call
// recordAiGeneration() below once the generation has actually succeeded.
export async function checkAiGate(userId: string): Promise<AiGateResult> {
  const { plan } = await getUserPlan(userId);

  if (plan === "pro") {
    return { allowed: true, plan };
  }

  const usage = await checkUsageLimit(userId);
  if (!usage.allowed) {
    return {
      allowed: false,
      response: NextResponse.json(
        {
          error: "UPGRADE_REQUIRED",
          message: `You've used all ${usage.limit} free AI generations this month. Upgrade to Pro for unlimited generations.`,
          limit: usage.limit,
          used: usage.used,
        },
        { status: 403 },
      ),
    };
  }

  return { allowed: true, plan };
}

// Call only after the AI generation itself has succeeded. No-op for Pro —
// UsageCounter exists purely to enforce the free-tier cap (see
// prisma/schema.prisma), so Pro usage is never recorded.
export async function recordAiGeneration(userId: string, plan: Plan): Promise<void> {
  if (plan === "free") {
    await incrementUsage(userId);
  }
}
