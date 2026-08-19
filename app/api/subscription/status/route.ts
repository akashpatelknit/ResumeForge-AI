import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getUserPlan } from "@/lib/subscription/getUserPlan";
import { checkUsageLimit } from "@/lib/subscription/checkUsageLimit";
import { checkResumeLimit } from "@/lib/subscription/checkResumeLimit";
import { getPlanConfig } from "@/lib/subscription/planConfig";

// Clerk-authed. Read-only view of the current user's plan/usage — the
// billing section of Settings and the sidebar's usage indicator both call
// this instead of re-deriving plan state client-side. Backed entirely by
// our own Subscription/UsageCounter tables (never calls Razorpay's API
// live — see the webhook handler for why that table is the source of
// truth).
export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const plan = await getUserPlan(userId);
  const [usage, resumes, planConfig] = await Promise.all([
    checkUsageLimit(userId),
    checkResumeLimit(userId),
    getPlanConfig(),
  ]);

  return NextResponse.json({
    plan: plan.plan,
    status: plan.status,
    trialEndsAt: plan.trialEndsAt,
    currentPeriodEnd: plan.currentPeriodEnd,
    proPriceInr: planConfig.proPriceInr,
    aiGenerations: { used: usage.used, limit: usage.limit, remaining: usage.remaining },
    resumes: { count: resumes.count, limit: resumes.limit },
  });
}
