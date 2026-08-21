import "server-only";
import type { Prisma } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";

// Generic audit trail for admin actions against a user's AI access/credits
// (see prisma/schema.prisma's AdminActionLog) — action is a short slug
// ("grant_credits", "block_ai_access", "unblock_ai_access"), details is
// whatever structured context that action needs (amount/reason/etc.).
// Best-effort: a logging failure must never take down the admin action it's
// recording, same posture as lib/ai/gateway.ts's AiUsageLog writes.
export async function logAdminAction(entry: {
  adminId: string;
  action: string;
  targetUserId: string;
  details?: Record<string, unknown>;
}): Promise<void> {
  try {
    await prisma.adminActionLog.create({
      data: {
        adminId: entry.adminId,
        action: entry.action,
        targetUserId: entry.targetUserId,
        details: entry.details as Prisma.InputJsonValue | undefined,
      },
    });
  } catch (error) {
    console.error("Failed to write AdminActionLog entry:", error);
  }
}
