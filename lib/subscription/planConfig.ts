import "server-only";
import { prisma } from "@/lib/prisma";
import type { PlanConfig } from "@/app/generated/prisma/client";

const SINGLETON_ID = "singleton";

// Upsert-on-read: the row is created with schema defaults the first time
// anything asks for it (fresh DB, or before an admin has ever touched the
// Plans & Pricing screen), so callers never have to handle a missing-row
// case. Values here are what the admin dashboard's Plans & Pricing page
// edits — see app/(admin)/admin/(dashboard)/plans and
// app/api/admin/plan-config/route.ts.
export async function getPlanConfig(): Promise<PlanConfig> {
  return prisma.planConfig.upsert({
    where: { id: SINGLETON_ID },
    create: { id: SINGLETON_ID },
    update: {},
  });
}

export interface PlanConfigUpdateInput {
  proPriceInr?: number;
  freeResumeLimit?: number;
  freeAiGenerationLimit?: number;
}

export async function updatePlanConfig(data: PlanConfigUpdateInput): Promise<PlanConfig> {
  return prisma.planConfig.upsert({
    where: { id: SINGLETON_ID },
    create: { id: SINGLETON_ID, ...data },
    update: data,
  });
}
