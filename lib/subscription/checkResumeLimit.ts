import "server-only";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserPlan } from "./getUserPlan";
import { getPlanConfig } from "./planConfig";

export interface ResumeLimitResult {
  allowed: boolean;
  count: number;
  limit: number;
}

// Limit comes from PlanConfig (admin-editable, see lib/subscription/planConfig.ts)
// rather than a hardcoded constant, so the admin Plans & Pricing screen can
// change it without a deploy.
export async function checkResumeLimit(userId: string): Promise<ResumeLimitResult> {
  const [count, { freeResumeLimit }] = await Promise.all([
    prisma.resume.count({ where: { userId } }),
    getPlanConfig(),
  ]);
  return {
    allowed: count < freeResumeLimit,
    count,
    limit: freeResumeLimit,
  };
}

export type ResumeCreationGateResult = { allowed: true } | { allowed: false; response: NextResponse };

// Called at the top of POST /api/resumes, before creating anything. Pro
// users always pass without a count query.
export async function checkResumeCreationGate(userId: string): Promise<ResumeCreationGateResult> {
  const { plan } = await getUserPlan(userId);
  if (plan === "pro") return { allowed: true };

  const { allowed, count, limit } = await checkResumeLimit(userId);
  if (allowed) return { allowed: true };

  return {
    allowed: false,
    response: NextResponse.json(
      {
        error: "UPGRADE_REQUIRED",
        message: `You've reached the ${limit}-resume limit on the free plan. Upgrade to Pro for unlimited resumes.`,
        limit,
        count,
      },
      { status: 403 },
    ),
  };
}
