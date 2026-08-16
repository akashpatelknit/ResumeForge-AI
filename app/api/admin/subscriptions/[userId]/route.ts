import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminSession } from "@/lib/admin/session";
import { adminOverrideSubscription } from "@/lib/admin/subscriptions";

const overrideSchema = z.object({
  status: z.enum(["trialing", "active", "past_due", "cancelled"]),
});

// PATCH rather than POST — this replaces the subscription's status, and is
// a local-only override (see lib/admin/subscriptions.ts's doc comment):
// it never calls Razorpay.
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const auth = await requireAdminSession(request);
  if (!auth.ok) return auth.response;

  const { userId } = await params;
  const body = await request.json().catch(() => null);
  const parsed = overrideSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
  }

  await adminOverrideSubscription(userId, parsed.data.status);
  return NextResponse.json({ ok: true });
}
