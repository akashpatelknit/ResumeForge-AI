"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { ChevronDown, Filter, MoreVertical, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NumberedPagination } from "@/components/admin/NumberedPagination";
import { AVATAR_COLORS, getInitials } from "@/lib/admin/avatarInitials";
import type { AdminUserRow } from "@/lib/admin/clerkUsers";

// Compact, read-focused users table embedded in the Dashboard view —
// separate from the full-featured UsersTable on /admin/users (which keeps
// its own search box and dark styling for now). Shares the same
// block/unblock API calls, just presented as a lighter preview with
// numbered pagination to match the reference design.
export function DashboardUsersPreview({
  initialUsers,
  initialTotal,
  pageSize,
}: {
  initialUsers: AdminUserRow[];
  initialTotal: number;
  pageSize: number;
}) {
  const [users, setUsers] = useState(initialUsers);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(1);
  const [isPending, startTransition] = useTransition();
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  async function fetchPage(nextPage: number) {
    const params = new URLSearchParams({ page: String(nextPage), pageSize: String(pageSize) });
    const response = await fetch(`/api/admin/users?${params.toString()}`);
    if (!response.ok) {
      toast.error("Failed to load users.");
      return;
    }
    const data = await response.json();
    setUsers(data.users);
    setTotal(data.total);
  }

  function goToPage(nextPage: number) {
    if (nextPage < 1 || nextPage > totalPages || nextPage === page) return;
    setPage(nextPage);
    startTransition(() => fetchPage(nextPage));
  }

  async function toggleBlock(user: AdminUserRow) {
    setPendingUserId(user.id);
    try {
      const endpoint = user.isBlocked ? "unblock" : "block";
      const reason = user.isBlocked ? undefined : (window.prompt("Reason for blocking (optional):") ?? undefined);
      const response = await fetch(`/api/admin/users/${user.id}/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      if (!response.ok) throw new Error();

      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id ? { ...u, isBlocked: !user.isBlocked, blockedReason: user.isBlocked ? null : (reason ?? null) } : u,
        ),
      );
      toast.success(user.isBlocked ? "User unblocked." : "User blocked.");
    } catch {
      toast.error("Failed to update user status.");
    } finally {
      setPendingUserId(null);
    }
  }

  const rangeStart = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd = Math.min(page * pageSize, total);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-gray-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Users</h2>
          <p className="text-sm text-gray-500">Manage and monitor all registered users on the platform.</p>
        </div>
        <div className="flex shrink-0 items-center gap-2.5">
          <Button
            variant="outline"
            className="gap-2 border-gray-200 text-gray-700 hover:bg-gray-50"
            onClick={() => toast.info("Filtering isn't wired up yet — coming in a follow-up pass.")}
          >
            <Filter className="h-4 w-4" />
            Filter
          </Button>
          <Button
            className="gap-2 bg-brand-purple text-white hover:bg-brand-purple/90"
            onClick={() => toast.info("Adding users manually isn't wired up yet — coming in a follow-up pass.")}
          >
            <Plus className="h-4 w-4" />
            Add User
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-xs font-medium text-gray-500">
              <th className="px-6 py-3 font-medium">User</th>
              <th className="px-6 py-3 font-medium">Email</th>
              <th className="px-6 py-3 font-medium">Plan</th>
              <th className="px-6 py-3 font-medium">
                <span className="inline-flex items-center gap-1">
                  Signup Date
                  <ChevronDown className="h-3.5 w-3.5" />
                </span>
              </th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((user, index) => {
              const color = AVATAR_COLORS[index % AVATAR_COLORS.length];
              return (
                <tr key={user.id} className="hover:bg-gray-50/60">
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-3">
                      <span
                        className={cn(
                          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                          color.bg,
                          color.text,
                        )}
                      >
                        {getInitials(user.name, user.email)}
                      </span>
                      <span className="font-medium text-gray-900">{user.name ?? "(no name)"}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3.5 text-gray-600">{user.email}</td>
                  <td className="px-6 py-3.5">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
                        user.plan === "pro" ? "bg-purple-100 text-brand-purple" : "bg-gray-100 text-gray-600",
                      )}
                    >
                      {user.plan === "pro" ? "Pro" : "Free"}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-gray-600">
                    {new Date(user.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-6 py-3.5">
                    {user.isBlocked ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-red-600">
                        <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                        Blocked
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        Active
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-3.5 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          disabled={pendingUserId === user.id}
                          className="cursor-pointer rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:pointer-events-none disabled:opacity-50"
                          aria-label={`Actions for ${user.email}`}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          variant={user.isBlocked ? "default" : "destructive"}
                          onClick={() => toggleBlock(user)}
                          className="cursor-pointer"
                        >
                          {user.isBlocked ? "Unblock user" : "Block user"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              );
            })}
            {users.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-sm text-gray-500">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 border-t border-gray-100 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-gray-500">
          Showing {rangeStart} to {rangeEnd} of {total.toLocaleString()} users
        </p>

        <NumberedPagination page={page} totalPages={totalPages} onPageChange={goToPage} disabled={isPending} />
      </div>
    </div>
  );
}
