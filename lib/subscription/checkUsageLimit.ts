import "server-only";
import { currentUsageMonth, getUsageCounter, incrementAiUsage } from "@/lib/db/subscription";
import { getPlanConfig } from "./planConfig";

export interface UsageLimitResult {
  allowed: boolean;
  used: number;
  limit: number;
  remaining: number;
}

// Checks the free-tier monthly cap (admin-editable via PlanConfig, see
// lib/subscription/planConfig.ts). Callers should check getUserPlan()
// first and skip this for plan === "pro" (see lib/subscription/aiGate.ts) —
// this function only looks at UsageCounter, it doesn't know about plans.
export async function checkUsageLimit(userId: string): Promise<UsageLimitResult> {
  const month = currentUsageMonth();
  const [counter, { freeAiGenerationLimit }] = await Promise.all([
    getUsageCounter(userId, month),
    getPlanConfig(),
  ]);
  const used = counter?.aiGenerationsUsed ?? 0;

  return {
    allowed: used < freeAiGenerationLimit,
    used,
    limit: freeAiGenerationLimit,
    remaining: Math.max(0, freeAiGenerationLimit - used),
  };
}

// Only ever called for free-tier users after a successful AI generation —
// Pro usage is intentionally never recorded (see the UsageCounter model
// comment in prisma/schema.prisma).
export async function incrementUsage(userId: string): Promise<void> {
  await incrementAiUsage(userId, currentUsageMonth());
}
