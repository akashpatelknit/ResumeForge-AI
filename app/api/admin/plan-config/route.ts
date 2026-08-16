import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminSession } from "@/lib/admin/session";
import { getPlanConfig, updatePlanConfig } from "@/lib/subscription/planConfig";

export async function GET(request: NextRequest) {
  const auth = await requireAdminSession(request);
  if (!auth.ok) return auth.response;

  const config = await getPlanConfig();
  return NextResponse.json(config);
}

const updateSchema = z.object({
  proPriceInr: z.number().int().positive().optional(),
  freeResumeLimit: z.number().int().min(0).optional(),
  freeAiGenerationLimit: z.number().int().min(0).optional(),
});

export async function PUT(request: NextRequest) {
  const auth = await requireAdminSession(request);
  if (!auth.ok) return auth.response;

  const body = await request.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
  }

  const config = await updatePlanConfig(parsed.data);
  return NextResponse.json(config);
}
