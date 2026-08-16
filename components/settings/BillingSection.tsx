"use client";

import { useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
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

// Razorpay has no hosted customer portal like Stripe's, so this is the
// entire billing management surface: current plan, trial/renewal date,
// upgrade (opens Razorpay Checkout), cancel (calls our own API, which
// calls Razorpay's).
export default function BillingSection() {
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
          // The webhook (source of truth) may take a moment to land after
          // Checkout's client-side handler fires — refetch shortly after
          // instead of trusting the handler callback directly.
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
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const isPro = data.plan === "pro";
  const isTrialing = data.status === "trialing";
  const renewalDate = data.currentPeriodEnd ? new Date(data.currentPeriodEnd) : null;
  const trialEndDate = data.trialEndsAt ? new Date(data.trialEndsAt) : null;
  const usagePct = data.aiGenerations.limit
    ? Math.min(100, (data.aiGenerations.used / data.aiGenerations.limit) * 100)
    : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Billing</CardTitle>
            <CardDescription>Manage your ResumeForge AI plan</CardDescription>
          </div>
          <Badge
            variant={isPro ? "default" : "secondary"}
            className={isPro ? "bg-linear-to-r from-brand-purple to-brand-blue text-white" : undefined}
          >
            {isPro ? (isTrialing ? "Pro — Trial" : "Pro") : "Free"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {isPro ? (
          <>
            <div className="rounded-lg border p-4 text-sm text-muted-foreground">
              {isTrialing && trialEndDate ? (
                <p>
                  Your 7-day free trial ends on{" "}
                  <span className="font-medium text-foreground">{format(trialEndDate, "MMM d, yyyy")}</span>.
                  You&apos;ll be charged ₹149 then, and monthly after that.
                </p>
              ) : renewalDate ? (
                <p>
                  Renews on{" "}
                  <span className="font-medium text-foreground">{format(renewalDate, "MMM d, yyyy")}</span> for
                  ₹149/month.
                </p>
              ) : (
                <p>You have unlimited resumes and AI generations.</p>
              )}
            </div>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" disabled={isCancelling}>
                  {isCancelling && <Loader2 className="h-4 w-4 animate-spin" />}
                  Cancel Subscription
                </Button>
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
          </>
        ) : (
          <>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">AI generations this month</span>
                <span className="font-medium">
                  {data.aiGenerations.used}/{data.aiGenerations.limit}
                </span>
              </div>
              <Progress value={usagePct} />
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Resumes</span>
              <span className="font-medium">
                {data.resumes.count}/{data.resumes.limit}
              </span>
            </div>

            <Button
              onClick={handleUpgrade}
              disabled={isUpgrading}
              className="gap-2 bg-linear-to-r from-brand-purple to-brand-blue text-white hover:opacity-90"
            >
              {isUpgrading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              Upgrade to Pro — ₹149/month
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
