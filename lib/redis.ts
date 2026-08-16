import "server-only";
import { Redis } from "@upstash/redis";

let client: Redis | null | undefined;

// Lazily constructed (and memoized) rather than a top-level singleton so an
// unconfigured UPSTASH_REDIS_REST_URL/TOKEN in local dev doesn't crash the
// module graph — callers (lib/rateLimit/anonymousParseQuota.ts) treat a null
// client as "rate limiting unavailable" and fail open instead of blocking
// the core parse feature over missing infra.
export function getRedis(): Redis | null {
  if (client !== undefined) return client;

  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    console.warn(
      "UPSTASH_REDIS_REST_URL/UPSTASH_REDIS_REST_TOKEN not set — anonymous resume-parse rate limiting is disabled.",
    );
    client = null;
    return client;
  }

  client = Redis.fromEnv();
  return client;
}
