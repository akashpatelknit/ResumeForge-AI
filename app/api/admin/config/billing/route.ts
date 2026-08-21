import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdminSession } from "@/lib/admin/session";
import { getPlatformConfig, updatePlatformConfig } from "@/lib/config/getPlatformConfig";
import { logAdminAction } from "@/lib/admin/actionLog";

export async function GET(request: NextRequest) {
  const auth = await requireAdminSession(request);
  if (!auth.ok) return auth.response;

  const config = await getPlatformConfig();
  return NextResponse.json(config);
}

const updateSchema = z.object({
  billingEnabled: z.boolean().optional(),
  betaCreditsPerMonth: z.number().int().min(0).optional(),
});

// Flips PlatformConfig.billingEnabled and/or edits betaCreditsPerMonth —
// see prisma/schema.prisma's PlatformConfig doc comment for exactly what
// each controls. Does NOT touch Razorpay itself (plan creation, checkout,
// webhooks) — this only controls whether that existing flow is reachable
// from the pricing page and which credit allowance the gateway applies.
export async function PUT(request: NextRequest) {
  const auth = await requireAdminSession(request);
  if (!auth.ok) return auth.response;

  const body = await request.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
  }

  const config = await updatePlatformConfig(parsed.data);

  await logAdminAction({
    adminId: auth.admin.adminId,
    action: "update_platform_config",
    // Not a real Clerk userId — this action targets the whole platform,
    // not one user. AdminActionLog.targetUserId is otherwise always a
    // Clerk id (grant_credits, block_ai_access, ...); this sentinel keeps
    // the same generic (action + details) log shape rather than adding a
    // nullable column just for this one action type.
    targetUserId: "platform",
    details: parsed.data,
  });

  // /pricing is statically prerendered (same reasoning as
  // app/api/admin/plan-config/route.ts) — without this, a billing toggle
  // wouldn't show up there until the next deploy.
  revalidatePath("/pricing");
  return NextResponse.json(config);
}
