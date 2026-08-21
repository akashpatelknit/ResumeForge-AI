"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@clerk/nextjs";
import { CheckCircle2, Loader2, Sparkles, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useAuthModalStore } from "@/store/authModalStore";
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";
import { openRazorpayCheckout } from "@/lib/razorpayCheckout";

interface PricingProps {
  proPriceInr: number;
  freeResumeLimit: number;
  freeAiGenerationLimit: number;
  // PlatformConfig.billingEnabled (see prisma/schema.prisma) — while false,
  // Razorpay checkout is unreachable from this page entirely: the Pro CTA
  // just signs the visitor up/in instead, and no trial language is shown.
  billingEnabled: boolean;
}

// Feature copy for things PlanConfig doesn't store as real flags (template
// access, PDF export, Cold Outreach automation, priority support) — the
// numeric limits below (resumes / AI generations / price) come straight
// from PlanConfig via props, so admin changes to those show up here without
// a second edit.
const Pricing = ({ proPriceInr, freeResumeLimit, freeAiGenerationLimit, billingEnabled }: PricingProps) => {
  const { isLoaded, isSignedIn } = useAuth();
  const { data } = useSubscriptionStatus();
  const openAuthModal = useAuthModalStore((state) => state.open);
  const router = useRouter();
  const [isUpgrading, setIsUpgrading] = useState(false);

  const isPro = data?.plan === "pro" && (data.status === "active" || data.status === "trialing");

  const handleYearlyClick = () => {
    toast.info("Yearly billing is coming soon — Pro is monthly-only for now.");
  };

  const handleStartTrial = async () => {
    if (!isSignedIn) {
      openAuthModal("sign-up");
      return;
    }
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
          toast.success("Payment submitted — activating your Pro subscription…");
          setIsUpgrading(false);
        },
        onDismiss: () => setIsUpgrading(false),
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to start checkout");
      setIsUpgrading(false);
    }
  };

  // Billing off -> no Razorpay checkout is ever reachable here. Everyone
  // already gets full (beta) access the moment they have an account, so
  // this just gets them an account (or drops an already-signed-in visitor
  // straight into the dashboard) instead of "starting a trial."
  const handleGetStartedFree = () => {
    if (!isSignedIn) {
      openAuthModal("sign-up");
      return;
    }
    router.push("/dashboard");
  };

  const freeFeatures = [
    `${freeResumeLimit} resumes`,
    `${freeAiGenerationLimit} AI generations / month`,
    "All templates",
    "PDF export",
  ];

  const proFeatures = [
    "Unlimited resumes",
    "Unlimited AI generations",
    "All templates",
    "Cold Outreach automation",
    "Priority support",
  ];

  return (
    <section id="pricing" className="py-20 lg:py-32">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="mx-auto mb-8 max-w-2xl text-center">
          <h1 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Simple, transparent pricing
          </h1>
          <p className="text-lg text-muted-foreground">Start free. Upgrade when you're ready.</p>
        </div>

        {!billingEnabled && (
          <div className="mx-auto mb-8 flex w-fit max-w-xl items-center gap-2.5 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-center">
            <Sparkles className="h-4 w-4 shrink-0 text-amber-500" />
            <p className="text-sm font-medium text-amber-800">
              We&apos;re in early access — all features are free right now.
            </p>
          </div>
        )}

        <div className="mb-12 flex items-center justify-center gap-3 rounded-full border border-gray-200 bg-white px-4 py-2 shadow-sm w-fit mx-auto">
          <span className="text-sm font-semibold text-brand-purple">Monthly</span>
          <Switch
            checked
            onCheckedChange={handleYearlyClick}
            aria-label="Yearly billing (coming soon)"
          />
          <button
            type="button"
            onClick={handleYearlyClick}
            className="text-sm text-muted-foreground cursor-not-allowed"
          >
            Yearly
          </button>
        </div>

        <div className="mx-auto grid max-w-3xl items-stretch gap-6 sm:grid-cols-2">
          {/* Free */}
          <div className="flex flex-col rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900">Free</h3>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-4xl font-extrabold text-gray-900">₹0</span>
              <span className="text-muted-foreground">/month</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">Perfect for trying things out</p>
            <div className="my-6 border-t border-gray-100" />
            <ul className="flex-1 space-y-3">
              {freeFeatures.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-brand-purple" />
                  {f}
                </li>
              ))}
            </ul>
            <Button asChild variant="outline" className="mt-8 w-full">
              <Link href="/signup">Get Started</Link>
            </Button>
          </div>

          {/* Pro */}
          <div className="relative flex flex-col rounded-2xl border-2 border-brand-purple/60 bg-white p-8 shadow-xl shadow-purple-500/10">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Pro</h3>
              <Badge className="gap-1 border-0 bg-purple-100 text-purple-700 hover:bg-purple-100">
                <Star className="h-3 w-3 fill-current" />
                Most Popular
              </Badge>
            </div>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-4xl font-extrabold text-gray-900">₹{proPriceInr}</span>
              <span className="text-muted-foreground">/month</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">For serious job seekers</p>
            <div className="my-6 border-t border-gray-100" />
            <ul className="flex-1 space-y-3">
              {proFeatures.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-brand-purple" />
                  {f}
                </li>
              ))}
            </ul>
            {isPro ? (
              <Button asChild className="mt-8 w-full bg-gradient-hero text-white hover:opacity-90">
                <Link href="/dashboard/settings">You're on Pro</Link>
              </Button>
            ) : billingEnabled ? (
              <Button
                onClick={handleStartTrial}
                disabled={!isLoaded || isUpgrading}
                className="mt-8 w-full gap-2 bg-gradient-hero text-white hover:opacity-90"
              >
                {isUpgrading && <Loader2 className="h-4 w-4 animate-spin" />}
                Start 7-day free trial
              </Button>
            ) : (
              <Button
                onClick={handleGetStartedFree}
                disabled={!isLoaded}
                className="mt-8 w-full gap-2 bg-gradient-hero text-white hover:opacity-90"
              >
                Get started free
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
