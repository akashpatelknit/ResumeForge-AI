import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminSession } from "@/lib/admin/session";
import { updateTemplateMeta } from "@/lib/admin/templates";

const updateSchema = z.object({
  isPro: z.boolean().optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
});

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ templateId: string }> }) {
  const auth = await requireAdminSession(request);
  if (!auth.ok) return auth.response;

  const { templateId } = await params;
  const body = await request.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
  }

  const meta = await updateTemplateMeta(templateId, parsed.data);
  return NextResponse.json(meta);
}
