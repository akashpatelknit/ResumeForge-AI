import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin/session";
import { getAdminTemplates } from "@/lib/admin/templates";

export async function GET(request: NextRequest) {
  const auth = await requireAdminSession(request);
  if (!auth.ok) return auth.response;

  const templates = await getAdminTemplates();
  return NextResponse.json({ templates });
}
