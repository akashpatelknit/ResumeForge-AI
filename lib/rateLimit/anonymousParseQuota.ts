import "server-only";
import { getRedis } from "@/lib/redis";

export const ANON_ID_COOKIE = "rezlo_anon_id";
export const FREE_PARSE_LIMIT = 5;

// ~180 days — long enough that the "5 free tries" limit is a real limit
// and not something a page refresh resets, short enough not to grow the
// Redis keyspace forever.
const QUOTA_TTL_SECONDS = 60 * 60 * 24 * 180;

function quotaKey(anonId: string) {
  return `anon-parse-quota:${anonId}`;
}

// Returns null when Redis isn't configured — the parse route treats that as
// "quota unavailable" and lets the request through rather than failing the
// whole feature over missing infra.
export async function getRemainingParses(anonId: string): Promise<number | null> {
  const redis = getRedis();
  if (!redis) return null;

  const count = (await redis.get<number>(quotaKey(anonId))) ?? 0;
  return Math.max(0, FREE_PARSE_LIMIT - count);
}

// Only called after a successful parse (extraction + Gemini both succeeded).
export async function incrementParseCount(anonId: string): Promise<void> {
  const redis = getRedis();
  if (!redis) return;

  const key = quotaKey(anonId);
  const count = await redis.incr(key);
  if (count === 1) {
    await redis.expire(key, QUOTA_TTL_SECONDS);
  }
}
