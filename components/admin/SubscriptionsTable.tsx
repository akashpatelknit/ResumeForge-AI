"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ChevronDown, Filter, LayoutGrid, MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NumberedPagination } from "@/components/admin/NumberedPagination";
import { AVATAR_COLORS, getInitials } from "@/lib/admin/avatarInitials";
import type { SubscriptionStatus } from "@/app/generated/prisma/client";
import type { AdminSubscriptionRow } from "@/lib/admin/subscriptions";

const STATUS_OPTIONS: SubscriptionStatus[] = ["trialing", "active", "past_due", "cancelled"];

const STATUS_STYLES: Record<SubscriptionStatus, { dot: string; text: string; label: string }> = {
  active: { dot: "bg-emerald-500", text: "text-emerald-600", label: "Active" },
  trialing: { dot: "bg-blue-500", text: "text-blue-600", label: "Trialing" },
  past_due: { dot: "bg-amber-500", text: "text-amber-600", label: "Past Due" },
  cancelled: { dot: "bg-red-500", text: "text-red-600", label: "Cancelled" },
};

const PAGE_SIZE = 8;

function formatDate(date: Date | null) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
}

// Full client-side pagination over the already-fetched list — subscriptions
// are bounded by "users who ever subscribed", not the whole Clerk user
// base, so a single findMany (see getAdminSubscriptions) is cheap enough
// that a paginated server round-trip (like clerkUsers.ts needs) isn't
// worth the extra API surface here.
export function SubscriptionsTable({
  initialSubscriptions,
  proPriceInr,
}: {
  initialSubscriptions: AdminSubscriptionRow[];
  proPriceInr: number;
}) {
  const [subscriptions, setSubscriptions] = useState(initialSubscriptions);
  const [page, setPage] = useState(1);
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);

  const total = subscriptions.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const rangeStart = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, total);
  const pageRows = subscriptions.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  async function overrideStatus(userId: string, status: SubscriptionStatus) {
    setPendingUserId(userId);
    try {
      const response = await fetch(`/api/admin/subscriptions/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error();

      setSubscriptions((prev) =>
        prev.map((s) =>
          s.userId === userId
            ? { ...s, status, plan: status === "cancelled" ? "free" : "pro", isManualOverride: true }
            : s,
        ),
      );
      toast.success("Subscription updated (local override — Razorpay was not called).");
    } catch {
      toast.error("Failed to update subscription.");
    } finally {
      setPendingUserId(null);
    }
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="flex justify-end gap-2.5 border-b border-gray-100 px-6 py-4">
        <Button
          variant="outline"
          className="gap-2 border-gray-200 text-gray-700 hover:bg-gray-50"
          onClick={() => toast.info("Filtering isn't wired up yet — coming in a follow-up pass.")}
        >
          <Filter className="h-4 w-4" />
          Filter
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="border-gray-200 text-gray-500 hover:bg-gray-50"
          onClick={() => toast.info("Column/view options aren't wired up yet — coming in a follow-up pass.")}
          aria-label="View options"
        >
          <LayoutGrid className="h-4 w-4" />
        </Button>
      </div>

      {/* Desktop table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-xs font-medium text-gray-500">
              <th className="px-6 py-3 font-medium">User</th>
              <th className="px-6 py-3 font-medium">Plan</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium">Amount</th>
              <th className="px-6 py-3 font-medium">
                <span className="inline-flex items-center gap-1">
                  Renewal Date
                  <ChevronDown className="h-3.5 w-3.5" />
                </span>
              </th>
              <th className="px-6 py-3 font-medium">Started Date</th>
              <th className="px-6 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {pageRows.map((sub, index) => {
              const color = AVATAR_COLORS[index % AVATAR_COLORS.length];
              const statusStyle = STATUS_STYLES[sub.status];
              const renewalDate = sub.currentPeriodEnd ?? sub.trialEndsAt;

              return (
                <tr key={sub.userId} className="hover:bg-gray-50/60">
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-3">
                      <span
                        className={cn(
                          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                          color.bg,
                          color.text,
                        )}
                      >
                        {getInitials(sub.name, sub.email)}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-gray-900">{sub.name ?? "(no name)"}</p>
                        <p className="truncate text-xs text-gray-500">{sub.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-3.5">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
                        sub.plan === "pro" ? "bg-purple-100 text-brand-purple" : "bg-gray-100 text-gray-600",
                      )}
                    >
                      {sub.plan === "pro" ? "Pro" : "Free"}
                    </span>
                  </td>
                  <td className="px-6 py-3.5">
                    <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium", statusStyle.text)}>
                      <span className={cn("h-1.5 w-1.5 rounded-full", statusStyle.dot)} />
                      {statusStyle.label}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-gray-600">
                    {sub.plan === "pro" ? `₹${proPriceInr.toLocaleString("en-IN")} / month` : "₹0 / month"}
                  </td>
                  <td className={cn("px-6 py-3.5", sub.status === "past_due" ? "font-medium text-red-600" : "text-gray-600")}>
                    {formatDate(renewalDate)}
                  </td>
                  <td className="px-6 py-3.5 text-gray-600">{formatDate(sub.createdAt)}</td>
                  <td className="px-6 py-3.5 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          disabled={pendingUserId === sub.userId}
                          className="cursor-pointer rounded-md p-3.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 sm:p-1.5 disabled:pointer-events-none disabled:opacity-50"
                          aria-label={`Actions for ${sub.email}`}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onClick={() =>
                            toast.info("A dedicated subscriber detail view isn't wired up yet — coming in a follow-up pass.")
                          }
                        >
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuSub>
                          <DropdownMenuSubTrigger className="cursor-pointer">Override Plan</DropdownMenuSubTrigger>
                          <DropdownMenuSubContent>
                            {STATUS_OPTIONS.map((status) => (
                              <DropdownMenuItem
                                key={status}
                                disabled={status === sub.status}
                                className="cursor-pointer capitalize"
                                onClick={() => overrideStatus(sub.userId, status)}
                              >
                                {STATUS_STYLES[status].label}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuSubContent>
                        </DropdownMenuSub>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              );
            })}
            {pageRows.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-10 text-center text-sm text-gray-500">
                  No subscriptions yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="space-y-3 border-t border-gray-100 p-4 md:hidden">
        {pageRows.length === 0 && (
          <p className="py-10 text-center text-sm text-gray-500">No subscriptions yet.</p>
        )}
        {pageRows.map((sub, index) => {
          const color = AVATAR_COLORS[index % AVATAR_COLORS.length];
          const statusStyle = STATUS_STYLES[sub.status];
          const renewalDate = sub.currentPeriodEnd ?? sub.trialEndsAt;

          return (
            <div key={sub.userId} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                      color.bg,
                      color.text,
                    )}
                  >
                    {getInitials(sub.name, sub.email)}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-gray-900">{sub.name ?? "(no name)"}</p>
                    <p className="truncate text-xs text-gray-500">{sub.email}</p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      disabled={pendingUserId === sub.userId}
                      className="shrink-0 cursor-pointer rounded-md p-3.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 sm:p-1.5 disabled:pointer-events-none disabled:opacity-50"
                      aria-label={`Actions for ${sub.email}`}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44">
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() =>
                        toast.info("A dedicated subscriber detail view isn't wired up yet — coming in a follow-up pass.")
                      }
                    >
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger className="cursor-pointer">Override Plan</DropdownMenuSubTrigger>
                      <DropdownMenuSubContent>
                        {STATUS_OPTIONS.map((status) => (
                          <DropdownMenuItem
                            key={status}
                            disabled={status === sub.status}
                            className="cursor-pointer capitalize"
                            onClick={() => overrideStatus(sub.userId, status)}
                          >
                            {STATUS_STYLES[status].label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="mb-3 flex items-center gap-2">
                <span
                  className={cn(
                    "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
                    sub.plan === "pro" ? "bg-purple-100 text-brand-purple" : "bg-gray-100 text-gray-600",
                  )}
                >
                  {sub.plan === "pro" ? "Pro" : "Free"}
                </span>
                <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium", statusStyle.text)}>
                  <span className={cn("h-1.5 w-1.5 rounded-full", statusStyle.dot)} />
                  {statusStyle.label}
                </span>
              </div>

              <div className="space-y-1.5 border-t border-gray-100 pt-2.5 text-xs text-gray-500">
                <div className="flex items-center justify-between">
                  <span>Amount</span>
                  <span className="text-gray-700">
                    {sub.plan === "pro" ? `₹${proPriceInr.toLocaleString("en-IN")} / month` : "₹0 / month"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Renewal date</span>
                  <span className={sub.status === "past_due" ? "font-medium text-red-600" : "text-gray-700"}>
                    {formatDate(renewalDate)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Started date</span>
                  <span className="text-gray-700">{formatDate(sub.createdAt)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col gap-3 border-t border-gray-100 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-gray-500">
          Showing {rangeStart} to {rangeEnd} of {total.toLocaleString()} subscriptions
        </p>
        <NumberedPagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </div>
  );
}
