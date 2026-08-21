import "server-only";
import { prisma } from "@/lib/prisma";
import { getRedis } from "@/lib/redis";
import type { PlatformConfig } from "@/app/generated/prisma/client";

// Upsert-on-read singleton, same pattern as lib/subscription/planConfig.ts
// — but this one is read on nearly every AI gateway call (lib/credits/
// userCredits.ts's getOrCreateUserCredits), not just admin-facing pages, so
// it's cached in Redis with a short TTL rather than hitting Postgres every
// time. A short TTL (not "cache forever + invalidate only") means even if
// an invalidation is ever missed, the toggle still converges within
// CACHE_TTL_SECONDS — correctness doesn't depend on the cache-busting path
// being perfect.
//
// No Redis configured (local dev) falls back to reading Postgres directly
// every time — same fail-open posture as every other lib/redis.ts consumer
// (lib/ai/rateLimit.ts, lib/rateLimit/*.ts): missing cache infra degrades
// to "slower," never to "broken."
const SINGLETON_ID = "singleton";
const CACHE_KEY = "platform_config:singleton";
const CACHE_TTL_SECONDS = 30;

export async function getPlatformConfig(): Promise<PlatformConfig> {
  const redis = getRedis();

  if (redis) {
    try {
      const cached = await redis.get<PlatformConfig>(CACHE_KEY);
      if (cached) return cached;
    } catch (error) {
      console.error("Failed to read platform config from cache:", error);
    }
  }

  const config = await prisma.platformConfig.upsert({
    where: { id: SINGLETON_ID },
    create: { id: SINGLETON_ID },
    update: {},
  });

  if (redis) {
    redis.set(CACHE_KEY, config, { ex: CACHE_TTL_SECONDS }).catch((error) => {
      console.error("Failed to cache platform config:", error);
    });
  }

  return config;
}

export interface PlatformConfigUpdateInput {
  billingEnabled?: boolean;
  betaCreditsPerMonth?: number;
}

// Admin action — see app/api/admin/config/billing/route.ts. Writes through
// to Postgres then invalidates the cache immediately, so the toggle takes
// effect on the very next read rather than waiting out CACHE_TTL_SECONDS.
export async function updatePlatformConfig(data: PlatformConfigUpdateInput): Promise<PlatformConfig> {
  const config = await prisma.platformConfig.upsert({
    where: { id: SINGLETON_ID },
    create: { id: SINGLETON_ID, ...data },
    update: data,
  });

  await invalidatePlatformConfigCache();
  return config;
}

export async function invalidatePlatformConfigCache(): Promise<void> {
  const redis = getRedis();
  if (!redis) return;
  await redis.del(CACHE_KEY).catch((error) => {
    console.error("Failed to invalidate platform config cache:", error);
  });
}
