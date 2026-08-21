"use client";

import { useEffect } from "react";
import { Loader2, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCreditsStore } from "@/store/creditsStore";

const LOW_CREDITS_THRESHOLD_PCT = 10;

// Small persistent AI credit balance — "42/100 credits". Mounted in both
// the Dashboard header (components/shared/DashboardHeader.tsx) and the
// resume builder toolbar (app/(app)/builder/[resumeId]/page.tsx, via
// BuilderToolbar's endSlot) — one component, not two, so both headers can
// never drift on how this reads or looks.
//
// Reads the shared credits store (store/creditsStore.ts), which every
// AI-triggering component in the builder (GenerateWithAI.tsx,
// JobDescriptionAnalyzer.tsx) refreshes right after a successful call —
// this component itself doesn't poll, it just re-renders whenever that
// shared state changes, so wherever it's mounted reflects a spend made
// from anywhere else almost immediately, no full page refresh needed.
export default function CreditsIndicator() {
  const credits = useCreditsStore((state) => state.credits);
  const isLoading = useCreditsStore((state) => state.isLoading);
  const fetchCredits = useCreditsStore((state) => state.fetchCredits);

  useEffect(() => {
    void fetchCredits();
    // Fetch once per mount — fetchCredits is a stable store action
    // reference, not a per-render value this effect needs to react to.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!credits) {
    if (!isLoading) return null;
    return (
      <div className="flex shrink-0 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-400">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      </div>
    );
  }

  const totalAllowance = credits.limit + credits.bonus;
  const remainingPct = totalAllowance > 0 ? (credits.available / totalAllowance) * 100 : 0;
  const isExhausted = credits.available <= 0;
  const isLow = !isExhausted && remainingPct < LOW_CREDITS_THRESHOLD_PCT;

  return (
    <div
      title={`${credits.available} of ${totalAllowance} AI credits left this month${
        credits.bonus > 0 ? ` (includes ${credits.bonus} bonus credits)` : ""
      }`}
      className={cn(
        "flex shrink-0 items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors",
        isExhausted
          ? "border-red-200 bg-red-50 text-red-700"
          : isLow
            ? "border-amber-200 bg-amber-50 text-amber-700"
            : "border-gray-200 bg-white text-gray-600",
      )}
    >
      <Zap
        className={cn("h-3.5 w-3.5", isExhausted ? "text-red-500" : isLow ? "text-amber-500" : "text-purple-500")}
      />
      <span className="hidden sm:inline">
        {credits.available}/{totalAllowance} credits
      </span>
      <span className="sm:hidden">
        {credits.available}/{totalAllowance}
      </span>
    </div>
  );
}
