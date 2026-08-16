import "server-only";
import { getRedis } from "@/lib/redis";

const MAX_ATTEMPTS = 5;
const WINDOW_SECONDS = 15 * 60; // 15 minutes

function rateLimitKey(ip: string) {
  return `admin-login-attempts:${ip}`;
}

export interface AdminLoginRateLimitResult {
  allowed: boolean;
  remaining: number;
}

// Same fail-open shape as lib/rateLimit/anonymousParseQuota.ts when Redis
// isn't configured (local dev) — but unlike that quota, this guards a
// credentialed login route, so an operator running without Redis should
// set UPSTASH_REDIS_REST_URL/TOKEN before exposing admin login publicly.
export async function checkAdminLoginRateLimit(ip: string): Promise<AdminLoginRateLimitResult> {
  const redis = getRedis();
  if (!redis) return { allowed: true, remaining: MAX_ATTEMPTS };

  const count = (await redis.get<number>(rateLimitKey(ip))) ?? 0;
  return { allowed: count < MAX_ATTEMPTS, remaining: Math.max(0, MAX_ATTEMPTS - count) };
}

// Called once per login attempt (success or failure) so a burst of correct
// guesses can't be used to enumerate past the window either.
export async function recordAdminLoginAttempt(ip: string): Promise<void> {
  const redis = getRedis();
  if (!redis) return;

  const key = rateLimitKey(ip);
  const count = await redis.incr(key);
  if (count === 1) {
    await redis.expire(key, WINDOW_SECONDS);
  }
}
