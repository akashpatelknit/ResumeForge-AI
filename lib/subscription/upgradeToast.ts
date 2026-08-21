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

// The shape every gating route (lib/ai/policy/refusal.ts's
// aiRouteErrorResponse for AI credit exhaustion, lib/subscription/
// checkResumeLimit.ts) returns on a 403. Narrows an already-parsed error
// body so call sites can branch on it instead of falling through to a
// generic error toast.
export function isUpgradeRequiredResponse(body: unknown): body is UpgradeRequiredBody {
  return (
    !!body &&
    typeof body === "object" &&
    (body as Record<string, unknown>).error === "UPGRADE_REQUIRED" &&
    typeof (body as Record<string, unknown>).message === "string"
  );
}

interface AiAccessBlockedBody {
  error: "AI_ACCESS_BLOCKED";
  message: string;
}

// The shape aiRouteErrorResponse returns when lib/ai/gateway.ts's
// AiBlockedError fires (admin-blocked AI access, separate from a full
// account block).
export function isAiAccessBlockedResponse(body: unknown): body is AiAccessBlockedBody {
  return (
    !!body &&
    typeof body === "object" &&
    (body as Record<string, unknown>).error === "AI_ACCESS_BLOCKED" &&
    typeof (body as Record<string, unknown>).message === "string"
  );
}

// Resolves the best user-facing message from any AI/gating route's JSON
// error body. UPGRADE_REQUIRED and AI_ACCESS_BLOCKED bodies carry a human
// `message` distinct from their `error` code; every other route's `error`
// field already IS the human-readable message (unchanged pre-existing
// convention), so this is a safe default for both shapes.
export function resolveErrorMessage(body: unknown, fallback: string): string {
  if (isUpgradeRequiredResponse(body) || isAiAccessBlockedResponse(body)) return body.message;
  const err = (body as { error?: unknown } | null)?.error;
  return typeof err === "string" && err ? err : fallback;
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

  throw new Error(resolveErrorMessage(body, fallbackMessage));
}

// AI call sites' equivalent of assertOkOrShowUpgrade above — every AI
// feature (Generate with AI popovers, the ATS checker, Quick Apply, the
// resume tailor/JD analyzer) can hit either an UPGRADE_REQUIRED (out of AI
// credits) or an AI_ACCESS_BLOCKED (admin-blocked) rejection from
// lib/ai/gateway.ts, on top of the plain string errors every route already
// had. Shows the right toast for each and always returns a human-readable
// message the caller can also render inline, so call sites don't have to
// duplicate this branching themselves.
export function resolveAiRejection(body: unknown, fallback: string): string {
  if (isUpgradeRequiredResponse(body)) {
    showUpgradeRequiredToast(body.message);
    return body.message;
  }
  if (isAiAccessBlockedResponse(body)) {
    toast.error(body.message, { duration: 8000 });
    return body.message;
  }
  return resolveErrorMessage(body, fallback);
}
