"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Gift, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { AdminUserRow } from "@/lib/admin/clerkUsers";

// Controlled (no own trigger) so it can be opened from a DropdownMenuItem
// in UsersTable.tsx — a DialogTrigger nested inside a dropdown item closes
// both the menu and the dialog together in Radix, so the parent owns
// `user` (non-null = open) and drives it via a plain onClick instead.
export function GrantCreditsDialog({
  user,
  onOpenChange,
  onGranted,
}: {
  user: AdminUserRow | null;
  onOpenChange: (open: boolean) => void;
  onGranted: () => void;
}) {
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function reset() {
    setAmount("");
    setReason("");
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!user) return;

    const parsedAmount = Number(amount);
    if (!Number.isInteger(parsedAmount) || parsedAmount <= 0) {
      toast.error("Enter a positive whole number of credits.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/admin/users/${user.id}/grant-credits`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: parsedAmount, reason: reason.trim() || undefined }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        toast.error(data?.error ?? "Failed to grant credits.");
        return;
      }

      onGranted();
      toast.success(`Granted ${parsedAmount} bonus credits to ${user.email}.`);
      reset();
      onOpenChange(false);
    } catch {
      toast.error("Network error — please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog
      open={!!user}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) reset();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Grant AI credits</DialogTitle>
          <DialogDescription>
            {user ? `Adds bonus credits to ${user.email}'s balance — doesn't reset monthly, spent before their regular allowance.` : ""}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="grant-amount">Amount</Label>
            <Input
              id="grant-amount"
              type="number"
              min={1}
              step={1}
              required
              autoFocus
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 50"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="grant-reason">Reason / note (optional)</Label>
            <Input
              id="grant-reason"
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Compensation for a bug they hit"
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting} className="gap-2">
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Gift className="h-4 w-4" />}
              {isSubmitting ? "Granting…" : "Grant credits"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
