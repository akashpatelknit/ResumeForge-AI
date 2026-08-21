"use client";

import { useCallback, useEffect, useState } from "react";

export type Plan = "free" | "pro";
export type SubscriptionStatusValue = "trialing" | "active" | "past_due" | "cancelled" | null;

export interface SubscriptionStatusResponse {
  plan: Plan;
  status: SubscriptionStatusValue;
  trialEndsAt: string | null;
  currentPeriodEnd: string | null;
  proPriceInr: number;
  // PlatformConfig.billingEnabled — false during the free beta launch, see
  // lib/config/getPlatformConfig.ts.
  billingEnabled: boolean;
  // Weighted AI credits (lib/credits/userCredits.ts), not a flat generation
  // count — `used`/`limit` are the resetting monthly pool, `bonus` is
  // admin-granted and never resets, `available` is what's actually left to
  // spend right now ((limit - used) + bonus).
  aiCredits: { used: number; limit: number; bonus: number; available: number; resetsAt: string; blocked: boolean };
  resumes: { count: number; limit: number };
}

// Backs both the sidebar's usage indicator and the settings Billing
// section — one fetch to GET /api/subscription/status, shared shape.
// `refresh` is exposed so callers can re-fetch after an upgrade/cancel
// action instead of a full page reload.
export function useSubscriptionStatus() {
  const [data, setData] = useState<SubscriptionStatusResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/subscription/status");
      if (!res.ok) return;
      setData(await res.json());
    } catch (error) {
      console.error("Failed to load subscription status:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { data, isLoading, refresh };
}
