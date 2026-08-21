import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin/session";
import { setAiAccessBlocked } from "@/lib/credits/userCredits";
import { logAdminAction } from "@/lib/admin/actionLog";

// Blocks/unblocks AI access specifically — separate from the full-account
// block (app/api/admin/users/[userId]/block, UserStatus.isBlocked): a user
// can stay fully active (view/edit resumes) while only their AI access is
// cut off. See UserCredits.aiAccessBlocked in prisma/schema.prisma.
export async function POST(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const auth = await requireAdminSession(request);
  if (!auth.ok) return auth.response;

  const { userId } = await params;
  const body = await request.json().catch(() => ({}));

  const blocked = body?.blocked !== false; // default true — mirrors block/unblock being separate endpoints elsewhere, but this one endpoint toggles both directions via the `blocked` flag
  const reason = typeof body?.reason === "string" && body.reason.trim() ? body.reason.trim() : undefined;

  if (blocked && !reason) {
    return NextResponse.json({ error: "A reason is required to block AI access" }, { status: 400 });
  }

  const credits = await setAiAccessBlocked(userId, blocked, reason);

  await logAdminAction({
    adminId: auth.admin.adminId,
    action: blocked ? "block_ai_access" : "unblock_ai_access",
    targetUserId: userId,
    details: { reason: reason ?? null },
  });

  return NextResponse.json({
    ok: true,
    aiAccessBlocked: credits.aiAccessBlocked,
    aiBlockedReason: credits.aiBlockedReason,
  });
}
