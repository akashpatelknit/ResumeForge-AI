import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin/session";
import { getAdminSubscriptions } from "@/lib/admin/subscriptions";

export async function GET(request: NextRequest) {
  const auth = await requireAdminSession(request);
  if (!auth.ok) return auth.response;

  const subscriptions = await getAdminSubscriptions();
  return NextResponse.json({ subscriptions });
}
