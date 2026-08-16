import "server-only";
import { getSubscriptionByUserId } from "@/lib/db/subscription";
import type { SubscriptionStatus } from "@/app/generated/prisma/client";

export type Plan = "free" | "pro";

export interface UserPlanInfo {
  plan: Plan;
  status: SubscriptionStatus | null;
  trialEndsAt: Date | null;
  currentPeriodEnd: Date | null;
}

// "trialing" and "active" are the obvious Pro states. "past_due" also
// counts as Pro — Razorpay is still retrying a failed charge at that point
// (see the payment.failed handler in app/api/webhooks/razorpay/route.ts),
// and treating it as an immediate downgrade would cut off a paying
// customer over a transient card issue. Only "cancelled", or no
// subscription row at all, is free tier.
export const PRO_STATUSES: SubscriptionStatus[] = ["trialing", "active", "past_due"];

export async function getUserPlan(userId: string): Promise<UserPlanInfo> {
  const subscription = await getSubscriptionByUserId(userId);

  if (!subscription || !PRO_STATUSES.includes(subscription.status)) {
    return {
      plan: "free",
      status: subscription?.status ?? null,
      trialEndsAt: subscription?.trialEndsAt ?? null,
      currentPeriodEnd: subscription?.currentPeriodEnd ?? null,
    };
  }

  return {
    plan: "pro",
    status: subscription.status,
    trialEndsAt: subscription.trialEndsAt,
    currentPeriodEnd: subscription.currentPeriodEnd,
  };
}
