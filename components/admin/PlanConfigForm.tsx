"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { PlanConfig } from "@/app/generated/prisma/client";

export function PlanConfigForm({ initialConfig }: { initialConfig: PlanConfig }) {
  const [proPriceInr, setProPriceInr] = useState(String(initialConfig.proPriceInr));
  const [freeResumeLimit, setFreeResumeLimit] = useState(String(initialConfig.freeResumeLimit));
  const [freeAiGenerationLimit, setFreeAiGenerationLimit] = useState(String(initialConfig.freeAiGenerationLimit));
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setIsSaving(true);
    try {
      const response = await fetch("/api/admin/plan-config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          proPriceInr: Number(proPriceInr),
          freeResumeLimit: Number(freeResumeLimit),
          freeAiGenerationLimit: Number(freeAiGenerationLimit),
        }),
      });
      if (!response.ok) throw new Error();
      toast.success("Plan config saved.");
    } catch {
      toast.error("Failed to save plan config.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md space-y-5 rounded-md border border-slate-800 p-6">
      <div className="space-y-1.5">
        <Label htmlFor="proPrice" className="text-slate-300">
          Pro price (₹/month)
        </Label>
        <Input
          id="proPrice"
          type="number"
          min={1}
          required
          value={proPriceInr}
          onChange={(e) => setProPriceInr(e.target.value)}
          className="border-slate-700 bg-slate-950 text-slate-100"
        />
        <p className="text-xs text-amber-500">
          Display and gating only. Actually changing what Razorpay charges requires updating the Plan in Razorpay&apos;s
          dashboard separately — this field alone will not change what a customer is billed.
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="resumeLimit" className="text-slate-300">
          Free tier resume limit
        </Label>
        <Input
          id="resumeLimit"
          type="number"
          min={0}
          required
          value={freeResumeLimit}
          onChange={(e) => setFreeResumeLimit(e.target.value)}
          className="border-slate-700 bg-slate-950 text-slate-100"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="aiLimit" className="text-slate-300">
          Free tier AI generations / month
        </Label>
        <Input
          id="aiLimit"
          type="number"
          min={0}
          required
          value={freeAiGenerationLimit}
          onChange={(e) => setFreeAiGenerationLimit(e.target.value)}
          className="border-slate-700 bg-slate-950 text-slate-100"
        />
      </div>

      <Button type="submit" disabled={isSaving}>
        {isSaving ? "Saving…" : "Save changes"}
      </Button>
    </form>
  );
}
