import "server-only";
import { clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { PRO_STATUSES } from "@/lib/subscription/getUserPlan";
import { getPlanConfig } from "@/lib/subscription/planConfig";

export interface AdminAnalytics {
  totalUsers: number;
  proSubscribers: number;
  mrrEstimateInr: number;
  resumesThisMonth: number;
}

export async function getAdminAnalytics(): Promise<AdminAnalytics> {
  const startOfMonth = new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), 1));

  const client = await clerkClient();
  const [totalUsers, proSubscribers, resumesThisMonth, planConfig] = await Promise.all([
    client.users.getCount(),
    prisma.subscription.count({ where: { status: { in: PRO_STATUSES } } }),
    prisma.resume.count({ where: { createdAt: { gte: startOfMonth } } }),
    getPlanConfig(),
  ]);

  return {
    totalUsers,
    proSubscribers,
    mrrEstimateInr: proSubscribers * planConfig.proPriceInr,
    resumesThisMonth,
  };
}
