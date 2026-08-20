import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import type { OutreachStatus as PrismaOutreachStatus } from "@/app/generated/prisma/client";

// Prisma's enum uses "quick_apply" (snake_case, matching this schema's
// convention for multi-word enum values); the existing frontend mock types
// in components/outreach/outreachData.ts use "quickApply" — this is the
// one place that gap gets bridged.
function toFrontendOutreachType(value: string | null): string | null {
  return value === "quick_apply" ? "quickApply" : value;
}

// The Cold Outreach Dashboard's table (app/(app)/dashboard/outreach/page.tsx)
// sources exclusively from a user's own isQueued=true SavedJob rows — never
// raw/unsaved Job Discovery listings, since this is the page real outreach
// emails get generated and scheduled from. A user's own queue is expected
// to be dozens of rows at most (not the thousands Job Discovery deals
// with), so this fetches everything in one call and lets the page filter/
// paginate client-side, same as it already did with mock data.
export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = await prisma.savedJob.findMany({
    where: { userId, isQueued: true },
    orderBy: [{ lastActivityAt: "desc" }, { addedAt: "desc" }],
  });

  // Terminal outcomes (sent/replied/bounced/failed) belong exclusively in
  // Outreach History now (GET /api/outreach/history, same 4 statuses) — the
  // dashboard table only shows the active pipeline (queued, generating,
  // scheduled, etc.) so it doesn't fill up with resolved rows over time.
  // Stats below still read from the unfiltered `rows`, not `entries` — the
  // "Sent Today"/bounce-rate numbers need the terminal rows to count them.
  const TERMINAL_STATUSES: PrismaOutreachStatus[] = ["sent", "replied", "bounced", "failed"];

  const entries = rows
    .filter((row) => !row.outreachStatus || !TERMINAL_STATUSES.includes(row.outreachStatus))
    .map((row) => ({
      id: row.id,
      company: row.company,
      role: row.jobTitle,
      outreachType: toFrontendOutreachType(row.outreachType),
      jobId: row.requisitionId,
      emails: row.contactEmails,
      status: row.outreachStatus ?? "draft",
      scheduledSendTime: row.scheduledSendTime ? row.scheduledSendTime.toISOString() : null,
      lastActivity: row.lastActivityAt ? row.lastActivityAt.toISOString() : null,
    }));

  const now = Date.now();
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const weekAgoMs = now - 7 * 24 * 60 * 60 * 1000;

  const isStatus = (row: (typeof rows)[number], status: PrismaOutreachStatus) => row.outreachStatus === status;

  const sentToday = rows.filter(
    (r) => isStatus(r, "sent") && r.lastActivityAt && r.lastActivityAt.getTime() >= todayStart.getTime(),
  ).length;
  const repliesThisWeek = rows.filter(
    (r) => isStatus(r, "replied") && r.lastActivityAt && r.lastActivityAt.getTime() >= weekAgoMs,
  ).length;
  const scheduledCount = rows.filter((r) => isStatus(r, "scheduled")).length;

  const bouncedCount = rows.filter((r) => isStatus(r, "bounced")).length;
  const sentRepliedOrBounced = rows.filter(
    (r) => isStatus(r, "sent") || isStatus(r, "replied") || isStatus(r, "bounced"),
  ).length;
  const bounceRate = sentRepliedOrBounced > 0 ? (bouncedCount / sentRepliedOrBounced) * 100 : 0;

  return NextResponse.json({
    entries,
    stats: {
      sentToday,
      repliesThisWeek,
      bounceRate: Math.round(bounceRate * 10) / 10,
      scheduledCount,
    },
  });
}
