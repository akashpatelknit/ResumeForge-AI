"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { AdminSubscriptionRow } from "@/lib/admin/subscriptions";

const STATUS_OPTIONS = ["trialing", "active", "past_due", "cancelled"] as const;

export function SubscriptionsTable({ initialSubscriptions }: { initialSubscriptions: AdminSubscriptionRow[] }) {
  const [subscriptions, setSubscriptions] = useState(initialSubscriptions);
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);

  async function overrideStatus(userId: string, status: (typeof STATUS_OPTIONS)[number]) {
    setPendingUserId(userId);
    try {
      const response = await fetch(`/api/admin/subscriptions/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error();

      setSubscriptions((prev) =>
        prev.map((s) => (s.userId === userId ? { ...s, status, isManualOverride: true } : s)),
      );
      toast.success("Subscription updated (local override — Razorpay was not called).");
    } catch {
      toast.error("Failed to update subscription.");
    } finally {
      setPendingUserId(null);
    }
  }

  return (
    <div className="rounded-md border border-slate-800">
      <Table>
        <TableHeader>
          <TableRow className="border-slate-800 hover:bg-transparent">
            <TableHead className="text-slate-400">User</TableHead>
            <TableHead className="text-slate-400">Status</TableHead>
            <TableHead className="text-slate-400">Source</TableHead>
            <TableHead className="text-slate-400">Renews / trial ends</TableHead>
            <TableHead className="text-slate-400">Override</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {subscriptions.map((sub) => (
            <TableRow key={sub.userId} className="border-slate-800 hover:bg-slate-900/50">
              <TableCell className="text-slate-200">{sub.email}</TableCell>
              <TableCell>
                <Badge variant={sub.status === "cancelled" ? "outline" : "default"}>{sub.status}</Badge>
              </TableCell>
              <TableCell>
                {sub.isManualOverride ? (
                  <Badge variant="outline" className="border-amber-800 text-amber-400">
                    Manual override
                  </Badge>
                ) : (
                  <span className="text-xs text-slate-500">Razorpay</span>
                )}
              </TableCell>
              <TableCell className="text-slate-400">
                {(sub.currentPeriodEnd ?? sub.trialEndsAt) != null
                  ? new Date((sub.currentPeriodEnd ?? sub.trialEndsAt)!).toLocaleDateString()
                  : "—"}
              </TableCell>
              <TableCell>
                <Select
                  value={sub.status}
                  disabled={pendingUserId === sub.userId}
                  onValueChange={(value) => overrideStatus(sub.userId, value as (typeof STATUS_OPTIONS)[number])}
                >
                  <SelectTrigger size="sm" className="w-36 border-slate-700 bg-slate-950 text-slate-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
            </TableRow>
          ))}
          {subscriptions.length === 0 && (
            <TableRow className="border-slate-800 hover:bg-transparent">
              <TableCell colSpan={5} className="text-center text-slate-500">
                No subscriptions yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
