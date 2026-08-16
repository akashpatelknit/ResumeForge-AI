import "server-only";
import { prisma } from "@/lib/prisma";

export async function blockUser(userId: string, reason?: string) {
  return prisma.userStatus.upsert({
    where: { userId },
    create: { userId, isBlocked: true, blockedAt: new Date(), blockedReason: reason ?? null },
    update: { isBlocked: true, blockedAt: new Date(), blockedReason: reason ?? null },
  });
}

export async function unblockUser(userId: string) {
  return prisma.userStatus.upsert({
    where: { userId },
    create: { userId, isBlocked: false },
    update: { isBlocked: false, blockedAt: null, blockedReason: null },
  });
}
