import "server-only";
import { prisma } from "@/lib/prisma";
import type { SubscriptionStatus } from "@/app/generated/prisma/client";

export async function getSubscriptionByUserId(userId: string) {
  return prisma.subscription.findUnique({ where: { userId } });
}

interface CreateTrialSubscriptionInput {
  userId: string;
  razorpaySubscriptionId: string;
  razorpayCustomerId: string;
  trialEndsAt: Date;
}

// Called right after Razorpay accepts the subscription (before the user has
// finished Checkout), so the settings page has something to show
// immediately instead of a blank state during the redirect/modal flow.
// subscription.activated (see app/api/webhooks/razorpay/route.ts) is what
// actually confirms this — this row is optimistic, matching Razorpay's own
// created -> authenticated -> active lifecycle. Upsert because a user can
// retry checkout (e.g. closed the modal, tries again) without erroring on
// the unique userId constraint.
export async function createTrialSubscription({
  userId,
  razorpaySubscriptionId,
  razorpayCustomerId,
  trialEndsAt,
}: CreateTrialSubscriptionInput) {
  return prisma.subscription.upsert({
    where: { userId },
    create: {
      userId,
      razorpaySubscriptionId,
      razorpayCustomerId,
      status: "trialing",
      trialEndsAt,
    },
    update: {
      razorpaySubscriptionId,
      razorpayCustomerId,
      status: "trialing",
      trialEndsAt,
    },
  });
}

// Webhooks identify the subscription by Razorpay's ID, not our userId —
// updateMany (rather than update) so an event for a subscription ID we
// don't have a row for yet (e.g. arrives before createTrialSubscription's
// write commits) is a no-op instead of a thrown "record not found".
export async function updateSubscriptionByRazorpayId(
  razorpaySubscriptionId: string,
  data: { status?: SubscriptionStatus; currentPeriodEnd?: Date | null },
) {
  return prisma.subscription.updateMany({
    where: { razorpaySubscriptionId },
    data,
  });
}

export async function updateSubscriptionStatusForUser(userId: string, status: SubscriptionStatus) {
  return prisma.subscription.updateMany({
    where: { userId },
    data: { status },
  });
}

// "2026-08" — sortable, human-readable, and matches what UsageCounter.month
// stores. Deliberately UTC-based so usage resets at a fixed instant
// worldwide rather than drifting with server timezone.
export function currentUsageMonth(): string {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
}

export async function getUsageCounter(userId: string, month: string) {
  return prisma.usageCounter.findUnique({
    where: { userId_month: { userId, month } },
  });
}

export async function incrementAiUsage(userId: string, month: string) {
  return prisma.usageCounter.upsert({
    where: { userId_month: { userId, month } },
    create: { userId, month, aiGenerationsUsed: 1 },
    update: { aiGenerationsUsed: { increment: 1 } },
  });
}
