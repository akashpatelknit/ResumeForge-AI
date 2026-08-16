import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin/session";
import { unblockUser } from "@/lib/admin/userStatus";

export async function POST(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const auth = await requireAdminSession(request);
  if (!auth.ok) return auth.response;

  const { userId } = await params;
  await unblockUser(userId);
  return NextResponse.json({ ok: true });
}
