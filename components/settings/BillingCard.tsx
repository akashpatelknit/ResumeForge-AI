"use client";

import { useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import { Crown, FileText, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";
import { openRazorpayCheckout } from "@/lib/razorpayCheckout";

// Real data throughout: plan/status/renewal/trial/usage/limit/price all
// come from GET /api/subscription/status (Subscription + UsageCounter +
// PlanConfig tables). Upgrade and Cancel are the same real Razorpay-backed
// actions BillingSection.tsx already had — this replaces that component
// with a layout matching the reference design instead of duplicating it.
export default function BillingCard() {
  const { data, isLoading, refresh } = useSubscriptionStatus();
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const handleUpgrade = async () => {
    setIsUpgrading(true);
    try {
      const res = await fetch("/api/subscription/create", { method: "POST" });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Failed to start checkout");

      await openRazorpayCheckout({
        subscriptionId: body.subscriptionId,
        keyId: body.keyId,
        prefill: body.prefill,
        onSuccess: () => {
          toast.success("Payment submitted — activating your subscription…");
          setTimeout(() => void refresh(), 2500);
          setIsUpgrading(false);
        },
        onDismiss: () => setIsUpgrading(false),
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to start checkout");
      setIsUpgrading(false);
    }
  };

  const handleCancel = async () => {
    setIsCancelling(true);
    try {
      const res = await fetch("/api/subscription/cancel", { method: "POST" });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Failed to cancel subscription");
      toast.success("Subscription cancelled.");
      await refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to cancel subscription");
    } finally {
      setIsCancelling(false);
    }
  };

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-gray-200 bg-white p-12 shadow-sm">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const isPro = data.plan === "pro";
  const isTrialing = data.status === "trialing";
  const renewalDate = data.currentPeriodEnd ? new Date(data.currentPeriodEnd) : null;
  const trialEndDate = data.trialEndsAt ? new Date(data.trialEndsAt) : null;

  const priceLine = isPro ? `₹${data.proPriceInr}/month` : "₹0/month";
  const renewalLine = isPro
    ? isTrialing && trialEndDate
      ? `Trial ends ${format(trialEndDate, "MMM d, yyyy")}`
      : renewalDate
        ? `Renews on ${format(renewalDate, "MMM d, yyyy")}`
        : null
    : null;

  // Razorpay has no hosted customer portal (unlike Stripe) — there's no
  // real "manage billing" destination beyond the two actions this card
  // already offers. For a free user, "manage billing" is meaningfully the
  // same as upgrading, so it does that for real; for a Pro user there's
  // nothing further to manage today, so it's honest about that instead of
  // pretending to open something that doesn't exist.
  const handleManageBilling = () => {
    if (!isPro) {
      handleUpgrade();
    } else {
      toast.info("No hosted billing portal yet — use Cancel Subscription below, or contact support for changes.");
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-bold text-gray-900">Billing &amp; Subscription</h2>

      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-purple-100">
            <Crown className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <p className="font-bold text-gray-900">{isPro ? "Pro Plan" : "Free Plan"}</p>
            <p className="text-sm text-gray-500">
              {priceLine}
              {renewalLine && <> · {renewalLine}</>}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:gap-8">
          <div className="flex items-center justify-between gap-4 sm:justify-start">
            <span className="inline-flex items-center gap-2 text-sm text-gray-600">
              <Sparkles className="h-4 w-4 text-purple-500" />
              AI Generations
            </span>
            <span className="text-sm font-semibold text-gray-900">
              {isPro ? "Unlimited (Pro)" : `${data.aiGenerations.used}/${data.aiGenerations.limit}`}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4 sm:justify-start">
            <span className="inline-flex items-center gap-2 text-sm text-gray-600">
              <FileText className="h-4 w-4 text-purple-500" />
              Resumes
            </span>
            <span className="text-sm font-semibold text-gray-900">
              {isPro ? "Unlimited (Pro)" : `${data.resumes.count}/${data.resumes.limit}`}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-start gap-1.5 sm:items-end">
          <Button variant="outline" onClick={handleManageBilling} disabled={isUpgrading} className="gap-2">
            {isUpgrading && <Loader2 className="h-4 w-4 animate-spin" />}
            Manage Billing
          </Button>

          {isPro && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button
                  type="button"
                  disabled={isCancelling}
                  className="cursor-pointer text-xs text-gray-500 underline-offset-2 hover:text-red-600 hover:underline disabled:opacity-50"
                >
                  {isCancelling ? "Cancelling…" : "Cancel Subscription"}
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Cancel your Pro subscription?</AlertDialogTitle>
                  <AlertDialogDescription>
                    You&apos;ll lose unlimited resumes and AI generations immediately, and your card won&apos;t be
                    charged again. You can resubscribe any time.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
                  <AlertDialogAction onClick={handleCancel}>Cancel Subscription</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>
    </div>
  );
}
