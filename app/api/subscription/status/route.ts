import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getUserPlan } from "@/lib/subscription/getUserPlan";
import { checkResumeLimit } from "@/lib/subscription/checkResumeLimit";
import { getPlanConfig } from "@/lib/subscription/planConfig";
import { getPlatformConfig } from "@/lib/config/getPlatformConfig";
import { getOrCreateUserCredits, availableCredits } from "@/lib/credits/userCredits";

// Clerk-authed. Read-only view of the current user's plan/usage — the
// billing section of Settings and the sidebar's usage indicator both call
// this instead of re-deriving plan state client-side. Backed entirely by
// our own Subscription/UserCredits tables (never calls Razorpay's API
// live — see the webhook handler for why that table is the source of
// truth).
export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const plan = await getUserPlan(userId);
  const [credits, resumes, planConfig, platformConfig] = await Promise.all([
    getOrCreateUserCredits(userId, plan.plan),
    checkResumeLimit(userId),
    getPlanConfig(),
    getPlatformConfig(),
  ]);

  return NextResponse.json({
    plan: plan.plan,
    status: plan.status,
    trialEndsAt: plan.trialEndsAt,
    currentPeriodEnd: plan.currentPeriodEnd,
    proPriceInr: planConfig.proPriceInr,
    // Same PlatformConfig.billingEnabled the pricing page uses — Settings
    // → Billing gates its own upgrade CTA off this too (see BillingCard.tsx)
    // so a free user can't reach real Razorpay checkout from there either
    // while billing is off, even though the pricing page's CTA already
    // won't send them down that path.
    billingEnabled: platformConfig.billingEnabled,
    aiCredits: {
      used: credits.creditsUsedThisMonth,
      limit: credits.monthlyAllowance,
      bonus: credits.bonusCredits,
      available: availableCredits(credits),
      resetsAt: credits.resetsAt,
      blocked: credits.aiAccessBlocked,
    },
    resumes: { count: resumes.count, limit: resumes.limit },
  });
}
