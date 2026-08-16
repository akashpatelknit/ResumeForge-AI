import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin/session";
import { blockUser } from "@/lib/admin/userStatus";

export async function POST(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const auth = await requireAdminSession(request);
  if (!auth.ok) return auth.response;

  const { userId } = await params;
  const body = await request.json().catch(() => ({}));
  const reason = typeof body?.reason === "string" ? body.reason : undefined;

  await blockUser(userId, reason);
  return NextResponse.json({ ok: true });
}
