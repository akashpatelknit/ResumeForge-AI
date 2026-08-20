"use client";

import { useState, useTransition, type FormEvent } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { AdminUserRow } from "@/lib/admin/clerkUsers";

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

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="flex gap-2">
        <Input
          placeholder="Search by email or name…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="max-w-xs border-slate-700 bg-slate-950 text-slate-100"
        />
        <Button type="submit" variant="outline" disabled={isPending} className="border-slate-700 bg-transparent text-slate-300">
          Search
        </Button>
      </form>

      {/* Desktop table */}
      <div className="hidden rounded-md border border-slate-800 md:block">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-800 hover:bg-transparent">
              <TableHead className="text-slate-400">User</TableHead>
              <TableHead className="text-slate-400">Plan</TableHead>
              <TableHead className="text-slate-400">Resumes</TableHead>
              <TableHead className="text-slate-400">Signed up</TableHead>
              <TableHead className="text-slate-400">Status</TableHead>
              <TableHead className="text-slate-400" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id} className="border-slate-800 hover:bg-slate-900/50">
                <TableCell>
                  <div className="text-slate-200">{user.name ?? "(no name)"}</div>
                  <div className="text-xs text-slate-500">{user.email}</div>
                </TableCell>
                <TableCell>
                  <Badge variant={user.plan === "pro" ? "default" : "outline"}>
                    {user.plan === "pro" ? `Pro (${user.subscriptionStatus})` : "Free"}
                  </Badge>
                </TableCell>
                <TableCell className="text-slate-300">{user.resumeCount}</TableCell>
                <TableCell className="text-slate-400">{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  {user.isBlocked ? (
                    <Badge variant="destructive" title={user.blockedReason ?? undefined}>
                      Blocked
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="border-emerald-800 text-emerald-400">
                      Active
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    variant={user.isBlocked ? "outline" : "destructive"}
                    disabled={pendingUserId === user.id}
                    onClick={() => toggleBlock(user)}
                    className={user.isBlocked ? "border-slate-700 bg-transparent text-slate-300" : ""}
                  >
                    {user.isBlocked ? "Unblock" : "Block"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {users.length === 0 && (
              <TableRow className="border-slate-800 hover:bg-transparent">
                <TableCell colSpan={6} className="text-center text-slate-500">
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
          <div className="rounded-md border border-slate-800 py-10 text-center text-sm text-slate-500">
            No users found.
          </div>
        )}
        {users.map((user) => (
          <div key={user.id} className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-medium text-slate-200">{user.name ?? "(no name)"}</p>
                <p className="truncate text-xs text-slate-500">{user.email}</p>
              </div>
              <Badge variant={user.plan === "pro" ? "default" : "outline"} className="shrink-0">
                {user.plan === "pro" ? `Pro (${user.subscriptionStatus})` : "Free"}
              </Badge>
            </div>
            <div className="mb-3 flex items-center gap-2">
              {user.isBlocked ? (
                <Badge variant="destructive" title={user.blockedReason ?? undefined}>
                  Blocked
                </Badge>
              ) : (
                <Badge variant="outline" className="border-emerald-800 text-emerald-400">
                  Active
                </Badge>
              )}
            </div>
            <div className="mb-3 flex items-center justify-between border-t border-slate-800 pt-2.5 text-xs text-slate-400">
              <span>{user.resumeCount} resumes</span>
              <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
            </div>
            <Button
              size="sm"
              variant={user.isBlocked ? "outline" : "destructive"}
              disabled={pendingUserId === user.id}
              onClick={() => toggleBlock(user)}
              className={user.isBlocked ? "w-full border-slate-700 bg-transparent text-slate-300" : "w-full"}
            >
              {user.isBlocked ? "Unblock" : "Block"}
            </Button>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
        <span>
          {total} user{total === 1 ? "" : "s"}
        </span>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={page <= 1 || isPending}
            onClick={() => goToPage(page - 1)}
            className="border-slate-700 bg-transparent text-slate-300"
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
            className="border-slate-700 bg-transparent text-slate-300"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
