import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin/session";

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8, "New password must be at least 8 characters."),
});

// Requires the current password (not just a valid session) so a hijacked
// but still-live admin session can't silently lock the real admin out by
// rotating their credentials.
export async function POST(request: NextRequest) {
  const auth = await requireAdminSession(request);
  if (!auth.ok) return auth.response;

  const body = await request.json().catch(() => null);
  const parsed = changePasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "INVALID_INPUT", message: parsed.error.issues[0]?.message ?? "Invalid input." },
      { status: 400 },
    );
  }

  const admin = await prisma.admin.findUnique({ where: { id: auth.admin.adminId } });
  if (!admin) {
    return NextResponse.json({ error: "NOT_FOUND", message: "Admin account not found." }, { status: 404 });
  }

  const currentPasswordMatches = await bcrypt.compare(parsed.data.currentPassword, admin.passwordHash);
  if (!currentPasswordMatches) {
    return NextResponse.json({ error: "INVALID_CREDENTIALS", message: "Current password is incorrect." }, { status: 401 });
  }

  const passwordHash = await bcrypt.hash(parsed.data.newPassword, 12);
  await prisma.admin.update({ where: { id: admin.id }, data: { passwordHash } });

  return NextResponse.json({ ok: true });
}
