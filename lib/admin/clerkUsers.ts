import "server-only";
import { clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { PRO_STATUSES } from "@/lib/subscription/getUserPlan";
import { availableCredits } from "@/lib/credits/userCredits";

export interface AdminUserRow {
  id: string;
  email: string;
  name: string | null;
  createdAt: Date;
  plan: "free" | "pro";
  subscriptionStatus: string | null;
  resumeCount: number;
  isBlocked: boolean;
  blockedReason: string | null;
  // AI credit balance — null when the user has never made an AI call yet
  // (no UserCredits row exists; one is only created lazily on first AI
  // gateway call, see lib/credits/userCredits.ts's getOrCreateUserCredits).
  aiCredits: { available: number; monthlyAllowance: number; bonusCredits: number } | null;
  aiAccessBlocked: boolean;
  aiBlockedReason: string | null;
}

export interface AdminUserListResult {
  users: AdminUserRow[];
  total: number;
}

const PAGE_SIZE = 25;

// Identity lives in Clerk; everything else (subscription, resume count,
// block status) lives in our own Postgres, keyed by Clerk's userId — so a
// page of users always starts from Clerk's list, then batch-joins the rest
// in memory rather than N+1 querying per row.
export async function getAdminUsers({
  query,
  page = 1,
  pageSize = PAGE_SIZE,
}: {
  query?: string;
  page?: number;
  // Lets the Dashboard's compact preview table ask for fewer rows than the
  // full /admin/users page without duplicating this fetch/join logic.
  pageSize?: number;
}): Promise<AdminUserListResult> {
  const client = await clerkClient();
  const offset = (page - 1) * pageSize;

  const [{ data: clerkUsers, totalCount }] = await Promise.all([
    client.users.getUserList({
      query: query || undefined,
      limit: pageSize,
      offset,
      orderBy: "-created_at",
    }),
  ]);

  const userIds = clerkUsers.map((u) => u.id);

  const [subscriptions, statuses, resumeCounts, credits] = userIds.length
    ? await Promise.all([
        prisma.subscription.findMany({ where: { userId: { in: userIds } } }),
        prisma.userStatus.findMany({ where: { userId: { in: userIds } } }),
        prisma.resume.groupBy({ by: ["userId"], where: { userId: { in: userIds } }, _count: { _all: true } }),
        prisma.userCredits.findMany({ where: { userId: { in: userIds } } }),
      ])
    : [[], [], [], []];

  const subscriptionByUser = new Map(subscriptions.map((s) => [s.userId, s]));
  const statusByUser = new Map(statuses.map((s) => [s.userId, s]));
  const resumeCountByUser = new Map(resumeCounts.map((r) => [r.userId, r._count._all]));
  const creditsByUser = new Map(credits.map((c) => [c.userId, c]));

  const users: AdminUserRow[] = clerkUsers.map((u) => {
    const subscription = subscriptionByUser.get(u.id);
    const isPro = !!subscription && PRO_STATUSES.includes(subscription.status);
    const status = statusByUser.get(u.id);
    const userCredits = creditsByUser.get(u.id);

    return {
      id: u.id,
      email: u.primaryEmailAddress?.emailAddress ?? u.emailAddresses[0]?.emailAddress ?? "(no email)",
      name: u.fullName,
      createdAt: new Date(u.createdAt),
      plan: isPro ? "pro" : "free",
      subscriptionStatus: subscription?.status ?? null,
      resumeCount: resumeCountByUser.get(u.id) ?? 0,
      isBlocked: status?.isBlocked ?? false,
      blockedReason: status?.blockedReason ?? null,
      aiCredits: userCredits
        ? {
            available: availableCredits(userCredits),
            monthlyAllowance: userCredits.monthlyAllowance,
            bonusCredits: userCredits.bonusCredits,
          }
        : null,
      aiAccessBlocked: userCredits?.aiAccessBlocked ?? false,
      aiBlockedReason: userCredits?.aiBlockedReason ?? null,
    };
  });

  return { users, total: totalCount };
}

export { PAGE_SIZE as ADMIN_USER_PAGE_SIZE };
