import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin/session";
import { getPlatformCreditsUsage } from "@/lib/admin/creditsUsage";

// Powers the small platform-wide credit-usage indicator in the admin
// header (components/admin/AdminShell.tsx) — separate from
// GET /api/admin/analytics, which backs the dashboard's stat cards and is
// only fetched on the admin home page; this is fetched on every admin page
// (the header is global), so it's kept as its own small, fast query.
export async function GET(request: NextRequest) {
  const auth = await requireAdminSession(request);
  if (!auth.ok) return auth.response;

  const usage = await getPlatformCreditsUsage();
  return NextResponse.json(usage);
}
