"use client";

import { toast } from "sonner";

// Where the minimal Razorpay-backed billing management UI lives (see
// app/(app)/dashboard/settings/page.tsx) — there's no hosted customer
// portal like Stripe's, so every "Upgrade" action just routes here.
export const BILLING_SETTINGS_URL = "/dashboard/settings?tab=billing";

interface UpgradeRequiredBody {
  error: "UPGRADE_REQUIRED";
  message: string;
}

// The shape every gating route (lib/subscription/aiGate.ts,
// lib/subscription/checkResumeLimit.ts) returns on a 403. Narrows an
// already-parsed error body so call sites can branch on it instead of
// falling through to a generic error toast.
export function isUpgradeRequiredResponse(body: unknown): body is UpgradeRequiredBody {
  return (
    !!body &&
    typeof body === "object" &&
    (body as Record<string, unknown>).error === "UPGRADE_REQUIRED" &&
    typeof (body as Record<string, unknown>).message === "string"
  );
}

// Non-blocking upgrade prompt shown at the exact point a free-tier limit
// was hit (resume creation, AI generation) — an action button on the toast
// itself, not a dead-end error message.
export function showUpgradeRequiredToast(message: string) {
  toast.error(message, {
    duration: 8000,
    action: {
      label: "Upgrade to Pro",
      onClick: () => {
        window.location.href = BILLING_SETTINGS_URL;
      },
    },
  });
}

// Thrown (after already showing the upgrade toast) so call sites' generic
// catch-and-toast blocks can recognize "this was already surfaced nicely"
// and skip toasting a second, plainer error on top of it.
export class UpgradeRequiredError extends Error {}

// Every resume-creation call site (lib/api/resumes.ts, store/resumeStore.ts,
// hooks/useResumeActions.tsx, hooks/useAuthGatedSave.ts,
// components/dashboard/TailorResumeModal.tsx) hits POST /api/resumes and
// needs the exact same "was this the free-tier limit?" branch — centralized
// here instead of repeated 5 times.
export async function assertOkOrShowUpgrade(response: Response, fallbackMessage: string): Promise<void> {
  if (response.ok) return;

  const body = await response.json().catch(() => ({}));
  if (isUpgradeRequiredResponse(body)) {
    showUpgradeRequiredToast(body.message);
    throw new UpgradeRequiredError(body.message);
  }

  throw new Error((body as { error?: string })?.error || fallbackMessage);
}
