"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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
} from "@/components/ui/alert-dialog";
import type { PlatformConfig } from "@/app/generated/prisma/client";

// The launch-in-beta switch (see prisma/schema.prisma's PlatformConfig doc
// comment) — separate control from the toggle in that it applies
// immediately on confirm rather than being batched behind PlanConfigForm's
// "Save Changes" button, since a toggle this consequential shouldn't sit
// half-applied waiting on an unrelated field edit.
export function BillingConfigForm({ initialConfig }: { initialConfig: PlatformConfig }) {
  const [billingEnabled, setBillingEnabled] = useState(initialConfig.billingEnabled);
  const [betaCreditsPerMonth, setBetaCreditsPerMonth] = useState(initialConfig.betaCreditsPerMonth);
  const [savedBetaCredits, setSavedBetaCredits] = useState(initialConfig.betaCreditsPerMonth);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isTogglingBilling, setIsTogglingBilling] = useState(false);
  const [isSavingCredits, setIsSavingCredits] = useState(false);

  async function persistBillingEnabled(next: boolean) {
    setIsTogglingBilling(true);
    try {
      const response = await fetch("/api/admin/config/billing", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ billingEnabled: next }),
      });
      if (!response.ok) throw new Error();
      setBillingEnabled(next);
      toast.success(next ? "Billing is now live." : "Billing is off — everyone is on the beta plan.");
    } catch {
      toast.error("Failed to update billing settings.");
    } finally {
      setIsTogglingBilling(false);
    }
  }

  function handleToggle(next: boolean) {
    // Only the OFF -> ON direction is a significant, one-way-feeling
    // change (starts real charges) — turning it back off needs no
    // confirmation.
    if (next) {
      setConfirmOpen(true);
      return;
    }
    void persistBillingEnabled(false);
  }

  function handleConfirmEnable() {
    setConfirmOpen(false);
    void persistBillingEnabled(true);
  }

  async function handleSaveCredits() {
    setIsSavingCredits(true);
    try {
      const response = await fetch("/api/admin/config/billing", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ betaCreditsPerMonth }),
      });
      if (!response.ok) throw new Error();
      setSavedBetaCredits(betaCreditsPerMonth);
      toast.success("Beta credit allowance saved.");
    } catch {
      toast.error("Failed to save beta credit allowance.");
    } finally {
      setIsSavingCredits(false);
    }
  }

  const creditsIsDirty = betaCreditsPerMonth !== savedBetaCredits;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-bold text-gray-900">Billing</h2>
      <p className="mt-1 text-sm text-gray-500">
        Razorpay checkout isn&apos;t reachable while this is off — every user gets the beta credit allowance below,
        regardless of Free/Pro.
      </p>

      <div className="mt-5 flex items-center justify-between gap-4 rounded-xl border border-gray-200 p-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900">Enable Razorpay Billing</p>
          <p className="mt-0.5 text-xs text-gray-500">
            {billingEnabled
              ? "Live — new Pro signups go through Razorpay checkout, and normal Free/Pro credit limits apply to non-beta users."
              : "Off — the pricing page shows a free early-access CTA and no trial language; no checkout is ever triggered."}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {isTogglingBilling && <Loader2 className="h-4 w-4 animate-spin text-gray-400" />}
          <Switch
            checked={billingEnabled}
            onCheckedChange={handleToggle}
            disabled={isTogglingBilling}
            aria-label="Enable Razorpay Billing"
          />
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 rounded-xl border border-gray-200 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <Label htmlFor="beta-credits" className="text-sm font-semibold text-gray-900">
            Beta credits / month
          </Label>
          <p className="mt-0.5 text-xs text-gray-500">
            What every user gets while billing is off, and what grandfathered beta signups keep getting after it&apos;s
            turned on.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Input
            id="beta-credits"
            type="number"
            min={0}
            value={betaCreditsPerMonth}
            onChange={(e) => setBetaCreditsPerMonth(Math.max(0, Number(e.target.value) || 0))}
            className="w-24"
          />
          <Button size="sm" onClick={handleSaveCredits} disabled={!creditsIsDirty || isSavingCredits}>
            {isSavingCredits ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
          </Button>
        </div>
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Turn on Razorpay billing?</AlertDialogTitle>
            <AlertDialogDescription>
              Turning this on will start charging new Pro signups via Razorpay and reduce free-tier credits to normal
              limits for new users. Existing beta users will keep their current plan. Continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmEnable}>Enable billing</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
