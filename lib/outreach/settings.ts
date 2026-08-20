import "server-only";
import { prisma } from "@/lib/prisma";
import type { UserOutreachSettings } from "@/app/generated/prisma/client";

// Defaults mirror the Send Scheduler settings page's original UI mock
// (app/(app)/dashboard/outreach/settings/page.tsx) — 15/day, 9am-6pm
// weekdays only, jitter 30s-5m — so a user who never opens Settings still
// gets sane spacing the first time they schedule outreach.
export async function getOrCreateOutreachSettings(userId: string): Promise<UserOutreachSettings> {
  const existing = await prisma.userOutreachSettings.findUnique({ where: { userId } });
  if (existing) return existing;

  return prisma.userOutreachSettings.create({
    data: { userId },
  });
}
