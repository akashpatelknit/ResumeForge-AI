import "server-only";
import { clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import type { SubscriptionStatus } from "@/app/generated/prisma/client";

export interface AdminSubscriptionRow {
  userId: string;
  email: string;
  status: SubscriptionStatus;
  isManualOverride: boolean;
  razorpaySubscriptionId: string | null;
  currentPeriodEnd: Date | null;
  trialEndsAt: Date | null;
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
  const emailByUser = new Map(
    clerkUsers.map((u) => [u.id, u.primaryEmailAddress?.emailAddress ?? u.emailAddresses[0]?.emailAddress ?? "(unknown)"]),
  );

  return subscriptions.map((s) => ({
    userId: s.userId,
    email: emailByUser.get(s.userId) ?? "(deleted user)",
    status: s.status,
    // No razorpaySubscriptionId means this row was never created by a real
    // Razorpay checkout — the only way that happens is an admin override
    // (see adminOverrideSubscription below).
    isManualOverride: !s.razorpaySubscriptionId,
    razorpaySubscriptionId: s.razorpaySubscriptionId,
    currentPeriodEnd: s.currentPeriodEnd,
    trialEndsAt: s.trialEndsAt,
    updatedAt: s.updatedAt,
  }));
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
