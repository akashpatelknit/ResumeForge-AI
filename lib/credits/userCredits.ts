import "server-only";
import { prisma } from "@/lib/prisma";
import { getPlanConfig } from "@/lib/subscription/planConfig";
import { getPlatformConfig } from "@/lib/config/getPlatformConfig";
import { getUserPlan, type Plan } from "@/lib/subscription/getUserPlan";
import type { UserCredits, PlatformConfig } from "@/app/generated/prisma/client";

// Replaces the old flat UsageCounter (see prisma/schema.prisma's
// UserCredits doc comment) — one row per user, reset in place rather than
// by starting a new month-keyed row.

function startOfNextUtcMonth(from: Date): Date {
  return new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth() + 1, 1, 0, 0, 0, 0));
}

// The beta/billing rules (see PlatformConfig's doc comment in
// prisma/schema.prisma):
// - billing off -> EVERY user gets betaCreditsPerMonth, Free/Pro doesn't
//   matter.
// - billing on, but this user is grandfathered (signedUpDuringBeta) -> they
//   keep betaCreditsPerMonth permanently, never downgraded.
// - billing on, not grandfathered -> normal Free (15) / Pro (proAiCreditLimit)
//   allowance from PlanConfig.
async function resolveMonthlyAllowance(
  plan: Plan,
  signedUpDuringBeta: boolean,
  platformConfig: PlatformConfig,
): Promise<number> {
  if (!platformConfig.billingEnabled || signedUpDuringBeta) {
    return platformConfig.betaCreditsPerMonth;
  }
  const planConfig = await getPlanConfig();
  return plan === "pro" ? planConfig.proAiCreditLimit : planConfig.freeAiGenerationLimit;
}

// The one function every AI call goes through (lib/ai/gateway.ts calls
// this before checking anything else) — ensures a UserCredits row exists,
// and lazily rolls it over to the current month / current allowance if
// either has changed since it was last touched. Cheap by design: one
// upsert, and a second update only on the (comparatively rare) month
// rollover or allowance-change path.
export async function getOrCreateUserCredits(userId: string, plan: Plan): Promise<UserCredits> {
  const platformConfig = await getPlatformConfig();
  const now = new Date();

  // Only meaningful if this call is the one that actually creates the row
  // — see UserCredits.signedUpDuringBeta's doc comment in
  // prisma/schema.prisma for why "row doesn't exist yet" stands in for
  // "signup time" here.
  const signedUpDuringBetaIfNew = !platformConfig.billingEnabled;

  const credits = await prisma.userCredits.upsert({
    where: { userId },
    create: {
      userId,
      monthlyAllowance: 0, // corrected immediately below via the allowanceChanged check
      creditsUsedThisMonth: 0,
      resetsAt: startOfNextUtcMonth(now),
      signedUpDuringBeta: signedUpDuringBetaIfNew,
    },
    update: {},
  });

  const monthlyAllowance = await resolveMonthlyAllowance(plan, credits.signedUpDuringBeta, platformConfig);
  const needsReset = credits.resetsAt <= now;
  const allowanceChanged = credits.monthlyAllowance !== monthlyAllowance;
  if (!needsReset && !allowanceChanged) {
    return credits;
  }

  return prisma.userCredits.update({
    where: { userId },
    data: {
      monthlyAllowance,
      ...(needsReset
        ? { creditsUsedThisMonth: 0, resetsAt: startOfNextUtcMonth(now) }
        : {}),
    },
  });
}

// (monthlyAllowance - creditsUsedThisMonth), floored at 0 so an allowance
// cut mid-cycle (plan downgrade, admin lowering PlanConfig) never goes
// negative, plus bonusCredits on top.
export function availableCredits(credits: Pick<UserCredits, "monthlyAllowance" | "creditsUsedThisMonth" | "bonusCredits">): number {
  return Math.max(0, credits.monthlyAllowance - credits.creditsUsedThisMonth) + credits.bonusCredits;
}

// Spends bonusCredits first (admin-granted, never resets), then the
// resetting monthly pool — see prisma/schema.prisma. Only ever called
// after a successful, schema-valid AI response (see gateway.ts) — never on
// a rejected or failed call.
export async function spendCredits(userId: string, amount: number): Promise<void> {
  if (amount <= 0) return;

  const credits = await prisma.userCredits.findUnique({ where: { userId } });
  if (!credits) return; // getOrCreateUserCredits always runs first in the gateway

  const fromBonus = Math.min(credits.bonusCredits, amount);
  const fromMonthly = amount - fromBonus;

  await prisma.userCredits.update({
    where: { userId },
    data: {
      bonusCredits: { decrement: fromBonus },
      creditsUsedThisMonth: { increment: fromMonthly },
    },
  });
}

export async function getUserCredits(userId: string): Promise<UserCredits | null> {
  return prisma.userCredits.findUnique({ where: { userId } });
}

// Admin action — see app/api/admin/users/[userId]/grant-credits/route.ts.
// bonusCredits never resets monthly, so a grant persists until spent.
export async function grantBonusCredits(userId: string, amount: number): Promise<UserCredits> {
  const { plan } = await getUserPlan(userId);
  await getOrCreateUserCredits(userId, plan);
  return prisma.userCredits.update({
    where: { userId },
    data: { bonusCredits: { increment: amount } },
  });
}

// Admin action — see app/api/admin/users/[userId]/toggle-ai-block/route.ts.
// Separate from UserStatus.isBlocked (lib/admin/userStatus.ts), which
// blocks the whole account.
export async function setAiAccessBlocked(userId: string, blocked: boolean, reason?: string): Promise<UserCredits> {
  const { plan } = await getUserPlan(userId);
  await getOrCreateUserCredits(userId, plan);
  return prisma.userCredits.update({
    where: { userId },
    data: {
      aiAccessBlocked: blocked,
      aiBlockedReason: blocked ? (reason ?? null) : null,
    },
  });
}
