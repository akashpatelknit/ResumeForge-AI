import { Queue } from "bullmq";
import { getQueueConnection } from "@/lib/queue/connection";

export const OUTREACH_SEND_QUEUE_NAME = "outreach-send";

let queue: Queue<OutreachSendJobData> | undefined;

export interface OutreachSendJobData {
  savedJobId: string;
}

function getOutreachQueue(): Queue<OutreachSendJobData> {
  if (queue) return queue;
  queue = new Queue<OutreachSendJobData>(OUTREACH_SEND_QUEUE_NAME, { connection: getQueueConnection() });
  return queue;
}

// Delayed BullMQ job = the actual trigger now (replacing the old cron poll
// that scanned for `scheduledSendTime <= now()` every couple minutes). Uses
// the SavedJob id as the BullMQ job id so scheduling the same job twice
// (e.g. re-running "Approve & Schedule" after editing settings) replaces
// the pending send rather than creating a duplicate — remove-then-add
// because BullMQ silently no-ops an add() with a jobId that already exists,
// which would leave the *old* delay in place instead of the new one.
export async function enqueueOutreachSend(savedJobId: string, sendAt: Date): Promise<void> {
  const q = getOutreachQueue();
  await q.remove(savedJobId);

  const delay = Math.max(0, sendAt.getTime() - Date.now());
  await q.add(
    "send",
    { savedJobId },
    {
      jobId: savedJobId,
      delay,
      attempts: 1, // No BullMQ auto-retry — failures are surfaced as outreachStatus="failed" for manual retry, per product spec.
      removeOnComplete: { age: 7 * 24 * 60 * 60 },
      removeOnFail: { age: 30 * 24 * 60 * 60 },
    },
  );
}

// Used when a scheduled job is removed from the queue / unqueued before its
// send fires, so it doesn't get sent anyway after the user cancelled it.
export async function cancelOutreachSend(savedJobId: string): Promise<void> {
  const q = getOutreachQueue();
  await q.remove(savedJobId);
}
