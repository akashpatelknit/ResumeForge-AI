import "server-only";
import { clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { PRO_STATUSES } from "@/lib/subscription/getUserPlan";
import { getPlanConfig } from "@/lib/subscription/planConfig";
import { getMonthBoundaries, pctChange } from "@/lib/admin/monthlyDelta";

export interface AdminAnalytics {
  totalUsers: number;
  proSubscribers: number;
  proSubscribersChangePct: number | null;
  mrrEstimateInr: number;
  mrrChangePct: number | null;
  resumesThisMonth: number;
  resumesChangePct: number | null;
}

export async function getAdminAnalytics(): Promise<AdminAnalytics> {
  const { startOfMonth, startOfLastMonth } = getMonthBoundaries();

  const client = await clerkClient();
  const [totalUsers, proSubscribers, proSubscribersLastMonth, resumesThisMonth, resumesLastMonth, planConfig] =
    await Promise.all([
      client.users.getCount(),
      prisma.subscription.count({ where: { status: { in: PRO_STATUSES } } }),
      // Approximation: subscriptions acquired before this month started, as
      // a stand-in for "pro subscriber count as of last month" — we don't
      // keep a status-change history, so this ignores cancellations that
      // happened after acquisition but ordinarily reads close enough for a
      // directional admin metric (mirrors the MRR-is-an-estimate disclaimer
      // already shown on the Plans page).
      prisma.subscription.count({ where: { status: { in: PRO_STATUSES }, createdAt: { lt: startOfMonth } } }),
      prisma.resume.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.resume.count({ where: { createdAt: { gte: startOfLastMonth, lt: startOfMonth } } }),
      getPlanConfig(),
    ]);

  // Total Users has no delta: Clerk's getCount() has no created-at filter,
  // so "users as of last month" isn't cheaply computable — better to omit
  // it than show a fabricated percentage.
  return {
    totalUsers,
    proSubscribers,
    proSubscribersChangePct: pctChange(proSubscribers, proSubscribersLastMonth),
    mrrEstimateInr: proSubscribers * planConfig.proPriceInr,
    // Proportional to proSubscribers (MRR = subscribers × constant price),
    // so the same percentage applies rather than an independent estimate.
    mrrChangePct: pctChange(proSubscribers, proSubscribersLastMonth),
    resumesThisMonth,
    resumesChangePct: pctChange(resumesThisMonth, resumesLastMonth),
  };
}
