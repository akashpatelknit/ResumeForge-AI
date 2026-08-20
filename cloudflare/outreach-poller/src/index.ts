// Cloudflare Worker replacement for the polling side of Schedule Outreach.
//
// Why this exists: BullMQ's Worker (worker/outreachWorker.ts, in the repo
// root) needs a long-lived TCP connection to Redis holding blocking commands
// open — that doesn't fit Workers' bounded, per-invocation execution model,
// so it can't run here. What CAN run here: a Cron Trigger that pings the
// Next.js app's own backstop endpoint (app/api/cron/process-outreach-queue)
// on a schedule — the same endpoint that was Vercel Cron's target before
// Hobby's once-a-day cap made that impractical for a "every couple minutes"
// job. Cloudflare's Cron Triggers support 1-minute granularity on the free
// plan with no such restriction.
//
// This does NOT require the BullMQ worker to be deployed anywhere — the
// backstop endpoint (lib/outreach/processOutreachSend.ts under the hood)
// does the actual send. If you separately get a BullMQ worker running too
// (Render/Oracle/etc.), this just becomes a redundant safety net alongside
// it, which is fine — the endpoint only processes rows that are actually
// due, so overlapping triggers don't double-send.

export interface Env {
  // Full URL to the backstop endpoint, e.g.
  // https://your-domain.vercel.app/api/cron/process-outreach-queue
  TARGET_URL: string;
  // Same value as CRON_SECRET in the Next.js app's env vars — set via
  // `wrangler secret put CRON_SECRET`, never committed as a plain var.
  CRON_SECRET: string;
}

async function triggerOutreachProcessing(env: Env): Promise<void> {
  if (!env.TARGET_URL || !env.CRON_SECRET) {
    console.error("[outreach-poller] TARGET_URL or CRON_SECRET is not configured.");
    return;
  }

  const res = await fetch(env.TARGET_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${env.CRON_SECRET}` },
  });

  const body = await res.text();
  if (!res.ok) {
    console.error(`[outreach-poller] ${res.status} ${body}`);
    return;
  }
  console.log(`[outreach-poller] ${res.status} ${body}`);
}

export default {
  async scheduled(_event: ScheduledController, env: Env, ctx: ExecutionContext): Promise<void> {
    ctx.waitUntil(triggerOutreachProcessing(env));
  },
} satisfies ExportedHandler<Env>;
