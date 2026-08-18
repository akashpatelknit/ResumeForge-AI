import "server-only";
import { clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import type { SubscriptionStatus } from "@/app/generated/prisma/client";
import { PRO_STATUSES } from "@/lib/subscription/getUserPlan";
import { getPlanConfig } from "@/lib/subscription/planConfig";
import { getMonthBoundaries, pctChange } from "@/lib/admin/monthlyDelta";

export interface AdminSubscriptionRow {
  userId: string;
  email: string;
  name: string | null;
  status: SubscriptionStatus;
  // Derived from PRO_STATUSES server-side (rather than re-deriving from
  // `status` in a client component, which can't import the server-only
  // getUserPlan module PRO_STATUSES lives in).
  plan: "pro" | "free";
  isManualOverride: boolean;
  razorpaySubscriptionId: string | null;
  currentPeriodEnd: Date | null;
  trialEndsAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export async function getAdminSubscriptions(): Promise<AdminSubscriptionRow[]> {
  const subscriptions = await prisma.subscription.findMany({ orderBy: { updatedAt: "desc" } });
  if (subscriptions.length === 0) return [];

  const client = await clerkClient();
  const userIds = subscriptions.map((s) => s.userId);
  // Clerk caps userId filters at 100 per call.
  const chunks: string[][] = [];
  for (let i = 0; i < userIds.length; i += 100) chunks.push(userIds.slice(i, i + 100));

  const clerkUsers = (
    await Promise.all(chunks.map((chunk) => client.users.getUserList({ userId: chunk, limit: 100 })))
  ).flatMap((r) => r.data);
  const userById = new Map(clerkUsers.map((u) => [u.id, u]));

  return subscriptions.map((s) => {
    const user = userById.get(s.userId);
    return {
      userId: s.userId,
      email: user?.primaryEmailAddress?.emailAddress ?? user?.emailAddresses[0]?.emailAddress ?? "(unknown)",
      name: user?.fullName ?? null,
      status: s.status,
      plan: PRO_STATUSES.includes(s.status) ? "pro" : "free",
      // No razorpaySubscriptionId means this row was never created by a real
      // Razorpay checkout — the only way that happens is an admin override
      // (see adminOverrideSubscription below).
      isManualOverride: !s.razorpaySubscriptionId,
      razorpaySubscriptionId: s.razorpaySubscriptionId,
      currentPeriodEnd: s.currentPeriodEnd,
      trialEndsAt: s.trialEndsAt,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    };
  });
}

export interface AdminSubscriptionAnalytics {
  activeCount: number;
  activeChangePct: number | null;
  trialingCount: number;
  trialingChangePct: number | null;
  cancelledThisMonth: number;
  cancelledChangePct: number | null;
  mrrInr: number;
  mrrChangePct: number | null;
}

export async function getAdminSubscriptionAnalytics(): Promise<AdminSubscriptionAnalytics> {
  const { startOfMonth, startOfLastMonth } = getMonthBoundaries();

  const [
    activeCount,
    activeLastMonth,
    trialingCount,
    trialingLastMonth,
    cancelledThisMonth,
    cancelledLastMonth,
    proCount,
    proLastMonth,
    planConfig,
  ] = await Promise.all([
    prisma.subscription.count({ where: { status: "active" } }),
    // Approximation, same as getAdminAnalytics: a status whose row hasn't
    // been touched since before this month started is a stand-in for "was
    // already in that state as of last month" — we don't keep a
    // status-change history to compute this exactly.
    prisma.subscription.count({ where: { status: "active", updatedAt: { lt: startOfMonth } } }),
    prisma.subscription.count({ where: { status: "trialing" } }),
    prisma.subscription.count({ where: { status: "trialing", updatedAt: { lt: startOfMonth } } }),
    prisma.subscription.count({ where: { status: "cancelled", updatedAt: { gte: startOfMonth } } }),
    prisma.subscription.count({
      where: { status: "cancelled", updatedAt: { gte: startOfLastMonth, lt: startOfMonth } },
    }),
    prisma.subscription.count({ where: { status: { in: PRO_STATUSES } } }),
    prisma.subscription.count({ where: { status: { in: PRO_STATUSES }, updatedAt: { lt: startOfMonth } } }),
    getPlanConfig(),
  ]);

  return {
    activeCount,
    activeChangePct: pctChange(activeCount, activeLastMonth),
    trialingCount,
    trialingChangePct: pctChange(trialingCount, trialingLastMonth),
    cancelledThisMonth,
    cancelledChangePct: pctChange(cancelledThisMonth, cancelledLastMonth),
    mrrInr: proCount * planConfig.proPriceInr,
    mrrChangePct: pctChange(proCount, proLastMonth),
  };
}

// Support-desk override: writes straight to our Subscription table, never
// touches Razorpay. Documented to the admin in the UI — this does NOT
// create, cancel, or modify anything on the Razorpay side, so a manually
// granted "pro" user won't be billed, and a manually cancelled user who
// still has a real Razorpay subscription will keep being charged until
// that's also cancelled at Razorpay directly.
export async function adminOverrideSubscription(
  userId: string,
  status: SubscriptionStatus,
): Promise<void> {
  const existing = await prisma.subscription.findUnique({ where: { userId } });

  // Only stamp a fresh currentPeriodEnd when granting "active" and there
  // isn't one already — otherwise leave whatever period end (real or
  // previously overridden) alone.
  const currentPeriodEnd =
    status === "active" && !existing?.currentPeriodEnd
      ? new Date(new Date().setMonth(new Date().getMonth() + 1))
      : (existing?.currentPeriodEnd ?? null);

  await prisma.subscription.upsert({
    where: { userId },
    create: { userId, status, currentPeriodEnd },
    update: { status, currentPeriodEnd },
  });
}
