import "server-only";
import { getRedis } from "@/lib/redis";
import type { AiFeature } from "./features";

export interface RateLimitConfig {
  requests: number;
  windowSeconds: number;
}

// Same abuse-prevention limit for every user regardless of plan — Free vs.
// Pro limit differences are a credit-system-pass decision, not this one.
// "Global" here means "across every feature," so someone can't dodge a
// tight per-feature limit by spreading calls across the other 16.
export const AI_GLOBAL_RATE_LIMIT: RateLimitConfig = { requests: 30, windowSeconds: 3600 };

function featureKey(userId: string, feature: AiFeature): string {
  return `ratelimit:ai:${userId}:${feature}`;
}

function globalKey(userId: string): string {
  return `ratelimit:ai:${userId}:global`;
}

export class AiRateLimitError extends Error {
  retryAfterSeconds: number;

  constructor(retryAfterSeconds: number) {
    super("You're sending requests too quickly — please wait a moment and try again.");
    this.name = "AiRateLimitError";
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

export interface RateLimitCheckResult {
  allowed: boolean;
  retryAfterSeconds?: number;
}

// Fixed-window counter via INCR + EXPIRE-on-first-increment — the same
// primitive lib/rateLimit/adminLoginRateLimit.ts and
// lib/rateLimit/anonymousParseQuota.ts already use. Unlike those two (which
// separate a "check" read from a later "record" write, racy under
// concurrency), this increments first and checks the result: INCR is a
// single atomic Redis op, so two concurrent requests can't both slip
// through under the same count the way a read-then-write pair could — a
// meaningful difference here since gateway calls are far more concurrent
// than admin login attempts.
async function checkAndIncrement(key: string, config: RateLimitConfig): Promise<RateLimitCheckResult> {
  const redis = getRedis();
  // Same fail-open posture as the existing rate limiters: no Redis
  // configured (local dev) means rate limiting is unavailable, not that
  // every request gets rejected.
  if (!redis) return { allowed: true };

  const count = await redis.incr(key);
  if (count === 1) {
    await redis.expire(key, config.windowSeconds);
  }

  if (count <= config.requests) {
    return { allowed: true };
  }

  // TTL reflects how much of the actual window is left, which is a more
  // honest retry-after hint than just re-stating windowSeconds every time.
  const ttl = await redis.ttl(key);
  return { allowed: false, retryAfterSeconds: ttl > 0 ? ttl : config.windowSeconds };
}

// Per-feature check first — it's the more specific, more actionable limit
// ("this one operation" vs. "everything"), and there's no reason to also
// burn a global-bucket increment on a call that's about to be rejected by
// the tighter feature-specific one anyway.
export async function checkAiRateLimit(
  userId: string,
  feature: AiFeature,
  featureLimit: RateLimitConfig,
): Promise<RateLimitCheckResult> {
  const featureResult = await checkAndIncrement(featureKey(userId, feature), featureLimit);
  if (!featureResult.allowed) return featureResult;

  return checkAndIncrement(globalKey(userId), AI_GLOBAL_RATE_LIMIT);
}
