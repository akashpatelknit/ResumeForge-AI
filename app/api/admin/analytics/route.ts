import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin/session";
import { getAdminAnalytics } from "@/lib/admin/analytics";

export async function GET(request: NextRequest) {
  const auth = await requireAdminSession(request);
  if (!auth.ok) return auth.response;

  const analytics = await getAdminAnalytics();
  return NextResponse.json(analytics);
}
