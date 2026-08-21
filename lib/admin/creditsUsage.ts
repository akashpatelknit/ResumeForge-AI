import "server-only";
import { prisma } from "@/lib/prisma";
import { AI_FEATURES, type AiFeature } from "@/lib/ai/features";

// AiUsageLog (lib/ai/gateway.ts) logs every call attempt, but doesn't store
// how many credits a successful one actually cost — credits are only ever
// spent on "success"/"success_flagged_injection" (see gateway.ts's
// spendCredits call), so re-deriving the same set here and weighting by
// each feature's current creditCost (lib/ai/features.ts) reconstructs the
// real platform-wide spend without a redundant column that could drift out
// of sync with a feature's cost changing over time.
const SUCCESS_STATUSES = ["success", "success_flagged_injection"];

function startOfUtcDay(from: Date): Date {
  return new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate()));
}

function startOfUtcMonth(from: Date): Date {
  return new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), 1));
}

async function sumCreditsUsedSince(since: Date): Promise<number> {
  const rows = await prisma.aiUsageLog.groupBy({
    by: ["feature"],
    where: { status: { in: SUCCESS_STATUSES }, createdAt: { gte: since } },
    _count: { _all: true },
  });

  return rows.reduce((total, row) => {
    // A feature name logged before it existed in the registry (renamed or
    // retired since) contributes 0 rather than throwing — this is a
    // best-effort aggregate, not a billing ledger.
    const creditCost = AI_FEATURES[row.feature as AiFeature]?.creditCost ?? 0;
    return total + creditCost * row._count._all;
  }, 0);
}

export interface PlatformCreditsUsage {
  usedToday: number;
  usedThisMonth: number;
}

// Platform-wide aggregate for the admin header (components/admin/AdminShell.tsx)
// — distinct from a single user's balance (lib/credits/userCredits.ts):
// total AI credits actually spent across every user, not one account's
// remaining allowance.
export async function getPlatformCreditsUsage(): Promise<PlatformCreditsUsage> {
  const now = new Date();
  const [usedToday, usedThisMonth] = await Promise.all([
    sumCreditsUsedSince(startOfUtcDay(now)),
    sumCreditsUsedSince(startOfUtcMonth(now)),
  ]);
  return { usedToday, usedThisMonth };
}
