"use client";

import { useState, useTransition, type FormEvent } from "react";
import { toast } from "sonner";
import { MoreVertical } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { GrantCreditsDialog } from "@/components/admin/GrantCreditsDialog";
import type { AdminUserRow } from "@/lib/admin/clerkUsers";

function CreditsCell({ user }: { user: AdminUserRow }) {
  if (!user.aiCredits) {
    return <span className="text-gray-400">Never used AI</span>;
  }
  return (
    <div className="text-gray-600">
      <span className="font-medium text-gray-900">{user.aiCredits.available}</span>
      <span className="text-gray-400"> / {user.aiCredits.monthlyAllowance} left</span>
      {user.aiCredits.bonusCredits > 0 && (
        <span className="ml-1.5 text-xs text-brand-purple">(+{user.aiCredits.bonusCredits} bonus)</span>
      )}
    </div>
  );
}

function AiAccessBadge({ user }: { user: AdminUserRow }) {
  return user.aiAccessBlocked ? (
    <Badge variant="destructive" title={user.aiBlockedReason ?? undefined}>
      AI Blocked
    </Badge>
  ) : (
    <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">
      AI Active
    </Badge>
  );
}

export function UsersTable({
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
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [isPending, startTransition] = useTransition();
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);
  const [grantCreditsUser, setGrantCreditsUser] = useState<AdminUserRow | null>(null);

  async function fetchUsers(nextQuery: string, nextPage: number) {
    const params = new URLSearchParams({ page: String(nextPage) });
    if (nextQuery) params.set("query", nextQuery);

    const response = await fetch(`/api/admin/users?${params.toString()}`);
    if (!response.ok) {
      toast.error("Failed to load users.");
      return;
    }
    const data = await response.json();
    setUsers(data.users);
    setTotal(data.total);
  }

  function handleSearch(event: FormEvent) {
    event.preventDefault();
    setPage(1);
    startTransition(() => fetchUsers(query, 1));
  }

  function goToPage(nextPage: number) {
    setPage(nextPage);
    startTransition(() => fetchUsers(query, nextPage));
  }

  async function toggleBlock(user: AdminUserRow) {
    setPendingUserId(user.id);
    try {
      const endpoint = user.isBlocked ? "unblock" : "block";
      const reason = user.isBlocked ? undefined : window.prompt("Reason for blocking (optional):") ?? undefined;
      const response = await fetch(`/api/admin/users/${user.id}/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      if (!response.ok) throw new Error();

      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id ? { ...u, isBlocked: !user.isBlocked, blockedReason: user.isBlocked ? null : reason ?? null } : u,
        ),
      );
      toast.success(user.isBlocked ? "User unblocked." : "User blocked.");
    } catch {
      toast.error("Failed to update user status.");
    } finally {
      setPendingUserId(null);
    }
  }

  // AI-access-only block, separate from the full-account block above (see
  // UserCredits.aiAccessBlocked) — a reason is required when blocking, same
  // pattern as toggleBlock, but re-prompted until non-empty since the API
  // rejects an empty reason on block.
  async function toggleAiBlock(user: AdminUserRow) {
    const nextBlocked = !user.aiAccessBlocked;
    let reason: string | undefined;
    if (nextBlocked) {
      const entered = window.prompt("Reason for blocking AI access (required):");
      if (entered === null) return; // cancelled
      if (!entered.trim()) {
        toast.error("A reason is required to block AI access.");
        return;
      }
      reason = entered.trim();
    }

    setPendingUserId(user.id);
    try {
      const response = await fetch(`/api/admin/users/${user.id}/toggle-ai-block`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blocked: nextBlocked, reason }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        toast.error(data?.error ?? "Failed to update AI access.");
        return;
      }

      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id ? { ...u, aiAccessBlocked: data.aiAccessBlocked, aiBlockedReason: data.aiBlockedReason } : u,
        ),
      );
      toast.success(nextBlocked ? "AI access blocked for this user." : "AI access restored.");
    } catch {
      toast.error("Network error — please try again.");
    } finally {
      setPendingUserId(null);
    }
  }

  // Refetches the current page rather than patching state in place — a
  // user with no prior AI usage has no aiCredits row yet (see
  // AdminUserRow.aiCredits' null case), so a grant can create one from
  // scratch with a monthlyAllowance this component has no other way to know.
  function handleGranted() {
    startTransition(() => fetchUsers(query, page));
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <form onSubmit={handleSearch} className="flex gap-2">
        <Input
          placeholder="Search by email or name…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="max-w-xs border-gray-200 bg-white text-gray-900"
        />
        <Button type="submit" variant="outline" disabled={isPending} className="border-gray-200 text-gray-700 hover:bg-gray-50">
          Search
        </Button>
      </form>

      {/* Desktop table */}
      <div className="hidden rounded-md border border-gray-200 md:block">
        <Table>
          <TableHeader>
            <TableRow className="border-gray-100 hover:bg-transparent">
              <TableHead className="text-gray-500">User</TableHead>
              <TableHead className="text-gray-500">Plan</TableHead>
              <TableHead className="text-gray-500">Resumes</TableHead>
              <TableHead className="text-gray-500">AI Credits</TableHead>
              <TableHead className="text-gray-500">Signed up</TableHead>
              <TableHead className="text-gray-500">Status</TableHead>
              <TableHead className="text-gray-500" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id} className="border-gray-100 hover:bg-gray-50/60">
                <TableCell>
                  <div className="text-gray-900">{user.name ?? "(no name)"}</div>
                  <div className="text-xs text-gray-500">{user.email}</div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={user.plan === "pro" ? "default" : "outline"}
                    className={user.plan === "pro" ? "bg-purple-100 text-brand-purple hover:bg-purple-100" : ""}
                  >
                    {user.plan === "pro" ? `Pro (${user.subscriptionStatus})` : "Free"}
                  </Badge>
                </TableCell>
                <TableCell className="text-gray-600">{user.resumeCount}</TableCell>
                <TableCell className="text-sm">
                  <CreditsCell user={user} />
                </TableCell>
                <TableCell className="text-gray-500">{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1.5">
                    {user.isBlocked ? (
                      <Badge variant="destructive" title={user.blockedReason ?? undefined}>
                        Blocked
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">
                        Active
                      </Badge>
                    )}
                    <AiAccessBadge user={user} />
                  </div>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={pendingUserId === user.id}
                        className="h-8 w-8 p-0 text-gray-400 hover:text-gray-700"
                        aria-label={`Actions for ${user.email}`}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setGrantCreditsUser(user)} className="cursor-pointer">
                        Grant credits
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        variant={user.aiAccessBlocked ? "default" : "destructive"}
                        onClick={() => toggleAiBlock(user)}
                        className="cursor-pointer"
                      >
                        {user.aiAccessBlocked ? "Unblock AI access" : "Block AI access"}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        variant={user.isBlocked ? "default" : "destructive"}
                        onClick={() => toggleBlock(user)}
                        className="cursor-pointer"
                      >
                        {user.isBlocked ? "Unblock account" : "Block account"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {users.length === 0 && (
              <TableRow className="border-gray-100 hover:bg-transparent">
                <TableCell colSpan={7} className="text-center text-gray-500">
                  No users found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile cards */}
      <div className="space-y-3 md:hidden">
        {users.length === 0 && (
          <div className="rounded-md border border-gray-200 py-10 text-center text-sm text-gray-500">
            No users found.
          </div>
        )}
        {users.map((user) => (
          <div key={user.id} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-medium text-gray-900">{user.name ?? "(no name)"}</p>
                <p className="truncate text-xs text-gray-500">{user.email}</p>
              </div>
              <Badge
                variant={user.plan === "pro" ? "default" : "outline"}
                className={user.plan === "pro" ? "shrink-0 bg-purple-100 text-brand-purple hover:bg-purple-100" : "shrink-0"}
              >
                {user.plan === "pro" ? `Pro (${user.subscriptionStatus})` : "Free"}
              </Badge>
            </div>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              {user.isBlocked ? (
                <Badge variant="destructive" title={user.blockedReason ?? undefined}>
                  Blocked
                </Badge>
              ) : (
                <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">
                  Active
                </Badge>
              )}
              <AiAccessBadge user={user} />
            </div>
            <div className="mb-3 text-xs">
              <CreditsCell user={user} />
            </div>
            <div className="mb-3 flex items-center justify-between border-t border-gray-100 pt-2.5 text-xs text-gray-500">
              <span>{user.resumeCount} resumes</span>
              <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="grid grid-cols-1 gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={pendingUserId === user.id}
                onClick={() => setGrantCreditsUser(user)}
                className="w-full border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                Grant credits
              </Button>
              <Button
                size="sm"
                variant={user.aiAccessBlocked ? "outline" : "destructive"}
                disabled={pendingUserId === user.id}
                onClick={() => toggleAiBlock(user)}
                className={user.aiAccessBlocked ? "w-full border-gray-200 text-gray-700 hover:bg-gray-50" : "w-full"}
              >
                {user.aiAccessBlocked ? "Unblock AI access" : "Block AI access"}
              </Button>
              <Button
                size="sm"
                variant={user.isBlocked ? "outline" : "destructive"}
                disabled={pendingUserId === user.id}
                onClick={() => toggleBlock(user)}
                className={user.isBlocked ? "w-full border-gray-200 text-gray-700 hover:bg-gray-50" : "w-full"}
              >
                {user.isBlocked ? "Unblock account" : "Block account"}
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between">
        <span>
          {total} user{total === 1 ? "" : "s"}
        </span>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={page <= 1 || isPending}
            onClick={() => goToPage(page - 1)}
            className="border-gray-200 text-gray-700 hover:bg-gray-50"
          >
            Previous
          </Button>
          <span className="px-2 py-1">
            Page {page} of {totalPages}
          </span>
          <Button
            size="sm"
            variant="outline"
            disabled={page >= totalPages || isPending}
            onClick={() => goToPage(page + 1)}
            className="border-gray-200 text-gray-700 hover:bg-gray-50"
          >
            Next
          </Button>
        </div>
      </div>

      <GrantCreditsDialog
        user={grantCreditsUser}
        onOpenChange={(open) => !open && setGrantCreditsUser(null)}
        onGranted={handleGranted}
      />
    </div>
  );
}
