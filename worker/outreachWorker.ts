// Standalone BullMQ worker for Schedule Outreach — the actual send trigger,
// replacing the old cron-poll approach. Deploy this as its own long-running
// service (e.g. a Render "Background Worker"), separate from the Next.js
// app on Vercel: `npm run worker` (== `tsx --tsconfig worker/tsconfig.json
// worker/outreachWorker.ts`).
//
// IMPORTANT — this process is not bundled by Next.js, but it imports lib/
// modules that assume they will be (they start with `import "server-only"`,
// a marker package whose real implementation always throws unless the
// resolver is given Next's internal "react-server" export condition).
// Setting that condition process-wide (e.g. via NODE_OPTIONS) "fixes" the
// throw but breaks far more than it repairs — React, Next, and Clerk all
// branch on the same condition for their OWN exports, and @react-pdf/renderer
// needs plain React, not Next's stripped RSC build of it. The actual fix is
// worker/tsconfig.json, which path-aliases the bare specifier "server-only"
// to worker/shims/server-only.ts (a no-op) — surgical, and it only affects
// this worker's own module graph. Must run via `tsx --tsconfig
// worker/tsconfig.json`, not plain `tsx`, or that alias won't apply and the
// first server-only-guarded import (getValidAccessToken.ts, aiGate.ts, etc.,
// pulled in transitively via processOutreachSend.ts) throws on startup.
import "dotenv/config";
import { Worker, type Job } from "bullmq";
import { getQueueConnection } from "@/lib/queue/connection";
import { OUTREACH_SEND_QUEUE_NAME, type OutreachSendJobData } from "@/lib/queue/outreachQueue";
import { prisma } from "@/lib/prisma";
import { markOutreachSendFailed, processOutreachSend } from "@/lib/outreach/processOutreachSend";

const CONCURRENCY = Number(process.env.OUTREACH_WORKER_CONCURRENCY ?? 3);

async function handleJob(job: Job<OutreachSendJobData>) {
  const { savedJobId } = job.data;
  const savedJob = await prisma.savedJob.findUnique({ where: { id: savedJobId } });

  if (!savedJob) {
    console.warn(`[outreach-worker] SavedJob ${savedJobId} no longer exists — skipping.`);
    return;
  }

  // Re-checked here rather than trusted from the job payload: the job could
  // have been sitting delayed for hours/days, during which the user could
  // have removed it from the queue (which cancels the BullMQ job — see
  // cancelOutreachSend — but a job already popped for processing right as
  // that happens is still worth this belt-and-suspenders check) or a
  // previous worker run already handled it.
  if (savedJob.outreachStatus !== "scheduled") {
    console.log(`[outreach-worker] Skipping ${savedJobId}: status is "${savedJob.outreachStatus}", not "scheduled".`);
    return;
  }

  try {
    await processOutreachSend(savedJob);
  } catch (error) {
    // processOutreachSend already catches and records its own expected
    // failure modes (Gmail errors, generation errors, etc.) — reaching here
    // means something unexpected blew up mid-pipeline, potentially leaving
    // the row stuck at "generating"/"sending". Surface it the same way.
    console.error(`[outreach-worker] Unexpected error processing ${savedJobId}:`, error);
    await markOutreachSendFailed(savedJobId, savedJob.sendAttempts, "Unexpected error while sending.");
    throw error;
  }
}

const worker = new Worker<OutreachSendJobData>(OUTREACH_SEND_QUEUE_NAME, handleJob, {
  connection: getQueueConnection(),
  concurrency: CONCURRENCY,
});

worker.on("completed", (job) => {
  console.log(`[outreach-worker] Completed job ${job.id} (SavedJob ${job.data.savedJobId}).`);
});

worker.on("failed", (job, err) => {
  console.error(`[outreach-worker] Job ${job?.id} (SavedJob ${job?.data.savedJobId}) failed:`, err.message);
});

worker.on("error", (err) => {
  console.error("[outreach-worker] Worker-level error (e.g. Redis connection issue):", err);
});

console.log(`[outreach-worker] Listening on queue "${OUTREACH_SEND_QUEUE_NAME}" (concurrency=${CONCURRENCY})...`);

async function shutdown(signal: string) {
  console.log(`[outreach-worker] Received ${signal}, shutting down gracefully...`);
  await worker.close();
  process.exit(0);
}

process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));
