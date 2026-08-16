import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin/session";
import { getAdminUsers } from "@/lib/admin/clerkUsers";

export async function GET(request: NextRequest) {
  const auth = await requireAdminSession(request);
  if (!auth.ok) return auth.response;

  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("query") ?? undefined;
  const page = Number(searchParams.get("page") ?? "1") || 1;

  const result = await getAdminUsers({ query, page });
  return NextResponse.json(result);
}
