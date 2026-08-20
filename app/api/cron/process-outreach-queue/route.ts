import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { markOutreachSendFailed, processOutreachSend } from "@/lib/outreach/processOutreachSend";

// No longer the primary trigger — BullMQ (lib/queue/outreachQueue.ts +
// worker/outreachWorker.ts) delivers scheduled sends the moment they're
// due. This route is now a backstop: it catches anything that's due but
// somehow has nothing pending in the queue (e.g. enqueueing failed
// transiently when it was scheduled, or the worker was down when a delayed
// job fired and got dropped). Safe to call on any interval, including
// Vercel Hobby's once-a-day cron cap, or an external pinger — it's a
// redundant safety net, not something latency-sensitive depends on.
export const runtime = "nodejs";
export const maxDuration = 120;

const BATCH_SIZE = 20;

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;

  const authHeader = request.headers.get("authorization");
  const bearer = authHeader?.match(/^Bearer\s+(.+)$/i)?.[1];
  const explicitHeader = request.headers.get("x-cron-secret");

  return bearer === secret || explicitHeader === secret;
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const due = await prisma.savedJob.findMany({
    where: { outreachStatus: "scheduled", scheduledSendTime: { lte: new Date() } },
    orderBy: { scheduledSendTime: "asc" },
    take: BATCH_SIZE,
  });

  const results = { processed: due.length, succeeded: 0, failed: 0 };

  for (const job of due) {
    try {
      await processOutreachSend(job);
      const updated = await prisma.savedJob.findUnique({ where: { id: job.id }, select: { outreachStatus: true } });
      if (updated?.outreachStatus === "sent") results.succeeded++;
      else results.failed++;
    } catch (error) {
      console.error(`Unexpected error processing outreach job ${job.id}:`, error);
      try {
        await markOutreachSendFailed(job.id, job.sendAttempts, "Unexpected error while sending.");
      } catch (updateError) {
        console.error(`Failed to mark job ${job.id} as failed after an unexpected error:`, updateError);
      }
      results.failed++;
    }
  }

  return NextResponse.json(results);
}

// Also allow GET so this can be triggered/verified manually (e.g. from a
// browser or curl, or an external pinger like cron-job.org) without needing
// to craft a POST.
export async function GET(request: NextRequest) {
  return POST(request);
}
