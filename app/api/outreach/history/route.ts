import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import type { OutreachStatus as PrismaOutreachStatus } from "@/app/generated/prisma/client";

// Terminal states only — "history" is what already happened, not what's
// still in flight (draft/generated/approved/scheduled/generating/sending).
const HISTORY_STATUSES = ["sent", "replied", "bounced", "failed"] as const;
type HistoryStatus = (typeof HISTORY_STATUSES)[number];

// Same casing bridge as GET /api/outreach/queue.
function toFrontendOutreachType(value: string | null): string | null {
  return value === "quick_apply" ? "quickApply" : value;
}

function snippetFrom(body: string | null): string {
  if (!body) return "";
  const trimmed = body.trim();
  return trimmed.length > 180 ? `${trimmed.slice(0, 180)}...` : trimmed;
}

// The History page's UI (from its original mock) has a "Reply" preview
// block and a "replied"/"bounced" status — but nothing in this codebase
// ever sets outreachStatus to those two values, because there's no reply-
// tracking infra: GmailAccount only requests the gmail.send scope, never
// gmail.readonly, so there's no inbox to detect a reply or bounce from.
// Both remain real, correctly-wired states here (so this endpoint doesn't
// need touching again if that infra gets built later) — they'll just
// always read as zero/absent until then. Not faked.
export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = await prisma.savedJob.findMany({
    where: { userId, outreachStatus: { in: [...HISTORY_STATUSES] as PrismaOutreachStatus[] } },
    orderBy: [{ sentAt: "desc" }, { lastActivityAt: "desc" }, { updatedAt: "desc" }],
  });

  const entries = rows.map((row) => ({
    id: row.id,
    company: row.company,
    role: row.jobTitle,
    outreachType: toFrontendOutreachType(row.outreachType),
    email: row.contactEmails[0] ?? "",
    emailCount: row.contactEmails.length,
    status: row.outreachStatus as HistoryStatus,
    timestamp: (row.sentAt ?? row.lastActivityAt ?? row.updatedAt).toISOString(),
    subject: row.generatedSubject ?? "",
    snippet: snippetFrom(row.generatedBody),
    reason: row.outreachStatus === "failed" || row.outreachStatus === "bounced" ? (row.lastError ?? undefined) : undefined,
  }));

  // "Sent" for these stats means the email actually left the outbox —
  // sent/replied/bounced all imply that; only "failed" means it never sent.
  const sentLikeCount = rows.filter(
    (r) => r.outreachStatus === "sent" || r.outreachStatus === "replied" || r.outreachStatus === "bounced",
  ).length;
  const repliedCount = rows.filter((r) => r.outreachStatus === "replied").length;
  const bouncedCount = rows.filter((r) => r.outreachStatus === "bounced").length;

  return NextResponse.json({
    entries,
    stats: {
      totalSent: sentLikeCount,
      replyRate: sentLikeCount > 0 ? Math.round((repliedCount / sentLikeCount) * 1000) / 10 : 0,
      bounceRate: sentLikeCount > 0 ? Math.round((bouncedCount / sentLikeCount) * 1000) / 10 : 0,
    },
  });
}
