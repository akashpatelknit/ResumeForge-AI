import { create } from "zustand";

export interface CreditsSummary {
  used: number;
  limit: number;
  bonus: number;
  available: number;
}

interface CreditsStore {
  credits: CreditsSummary | null;
  isLoading: boolean;
  fetchCredits: () => Promise<void>;
}

// Lightweight global cache of the current user's AI credit balance —
// mounted by components/shared/CreditsIndicator.tsx (used in both the
// Dashboard header and the resume builder toolbar), refreshed by any
// AI-triggering component in the builder (GenerateWithAI.tsx,
// JobDescriptionAnalyzer.tsx) right after a successful call, so the
// indicator updates live instead of requiring a full page refresh. Backed
// by the same GET /api/subscription/status the Settings Billing card and
// sidebar usage widget already use, rather than a separate endpoint or
// client-side credit math (which would have to duplicate
// lib/ai/features.ts's creditCost weights to stay accurate).
export const useCreditsStore = create<CreditsStore>((set) => ({
  credits: null,
  isLoading: false,
  fetchCredits: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch("/api/subscription/status");
      if (!res.ok) return;
      const data = await res.json();
      set({
        credits: {
          used: data.aiCredits.used,
          limit: data.aiCredits.limit,
          bonus: data.aiCredits.bonus,
          available: data.aiCredits.available,
        },
      });
    } catch (error) {
      console.error("Failed to fetch AI credits:", error);
    } finally {
      set({ isLoading: false });
    }
  },
}));
