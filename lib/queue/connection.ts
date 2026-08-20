import IORedis from "ioredis";

// BullMQ needs a real TCP Redis connection (via ioredis) — the app's
// existing lib/redis.ts wraps @upstash/redis's REST API client, which
// BullMQ can't use (no blocking commands/Lua scripting over HTTP). This is
// a second, separate connection string: REDIS_URL, a standard redis://
// or rediss:// URL. If you're already on Upstash for the REST-based
// getRedis() cache, the same Upstash instance also exposes a TCP endpoint
// (see its dashboard's "Connect" tab, ioredis/node-redis section) — you
// don't need a second Redis provider, just a second connection string.
//
// No "server-only" import here — this module is loaded by both Next.js API
// routes and the standalone worker (worker/outreachWorker.ts), which isn't
// bundled by Next and can't resolve that package outside the "react-server"
// condition (see the worker's own comment for the flag that fixes that for
// modules that DO need it, like lib/prisma.ts's dependents).

let connection: IORedis | undefined;

export function getQueueConnection(): IORedis {
  if (connection) return connection;

  const url = process.env.REDIS_URL;
  if (!url) {
    throw new Error(
      "REDIS_URL is not set — required for the outreach send queue (BullMQ). " +
        "Use a TCP redis://or rediss:// URL, not the REST-based UPSTASH_REDIS_REST_URL.",
    );
  }

  // BullMQ requires maxRetriesPerRequest: null on any connection it uses for
  // blocking operations (Worker/QueueEvents) — without it, ioredis gives up
  // on long-polling blocking commands after its default retry budget.
  connection = new IORedis(url, { maxRetriesPerRequest: null });
  return connection;
}
