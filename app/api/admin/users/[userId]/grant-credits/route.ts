import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin/session";
import { grantBonusCredits } from "@/lib/credits/userCredits";
import { logAdminAction } from "@/lib/admin/actionLog";

// Grants bonus AI credits to a user — added to UserCredits.bonusCredits,
// which never resets monthly (see prisma/schema.prisma) and is spent
// before the resetting monthly allowance (lib/credits/userCredits.ts).
export async function POST(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const auth = await requireAdminSession(request);
  if (!auth.ok) return auth.response;

  const { userId } = await params;
  const body = await request.json().catch(() => ({}));

  const amount = Number(body?.amount);
  if (!Number.isFinite(amount) || !Number.isInteger(amount) || amount <= 0) {
    return NextResponse.json({ error: "amount must be a positive integer" }, { status: 400 });
  }

  const reason = typeof body?.reason === "string" && body.reason.trim() ? body.reason.trim() : undefined;

  const credits = await grantBonusCredits(userId, amount);

  await logAdminAction({
    adminId: auth.admin.adminId,
    action: "grant_credits",
    targetUserId: userId,
    details: { amount, reason: reason ?? null },
  });

  return NextResponse.json({ ok: true, bonusCredits: credits.bonusCredits });
}
