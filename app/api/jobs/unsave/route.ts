import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const b = body as Record<string, unknown>;
  const savedJobId = typeof b.savedJobId === "string" ? b.savedJobId.trim() : "";
  const action = b.action === "bookmark" ? "bookmark" : b.action === "queue" ? "queue" : null;

  if (!savedJobId || !action) {
    return NextResponse.json({ error: "savedJobId and action ('bookmark' | 'queue') are required" }, { status: 400 });
  }

  const existing = await prisma.savedJob.findFirst({ where: { id: savedJobId, userId } });
  if (!existing) {
    return NextResponse.json({ error: "Saved job not found" }, { status: 404 });
  }

  const nextIsBookmarked = action === "bookmark" ? false : existing.isBookmarked;
  const nextIsQueued = action === "queue" ? false : existing.isQueued;

  // Once a saved job is neither bookmarked nor queued AND has no outreach
  // history (outreachStatus was never set — i.e. it was never actually
  // queued for real, or somehow both flags flipped false before that ever
  // happened), there's no reason for the row to survive. A row that DOES
  // carry outreach history (e.g. an email was already generated/sent for
  // it) is kept even after being pulled out of the queue, so that history
  // isn't silently lost.
  if (!nextIsBookmarked && !nextIsQueued && !existing.outreachStatus) {
    await prisma.savedJob.delete({ where: { id: existing.id } });
    return NextResponse.json({ deleted: true, isBookmarked: false, isQueued: false });
  }

  const updated = await prisma.savedJob.update({
    where: { id: existing.id },
    data: { isBookmarked: nextIsBookmarked, isQueued: nextIsQueued },
  });

  return NextResponse.json({ deleted: false, isBookmarked: updated.isBookmarked, isQueued: updated.isQueued });
}
