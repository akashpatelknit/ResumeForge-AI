"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ExternalLink, ListChecks, Search } from "lucide-react";
import { NumberedPagination } from "@/components/admin/NumberedPagination";
import type { ApplicationRecord } from "@/components/dashboard/AddApplicationModal";

const PAGE_SIZE = 10;

const STATUS_STYLES: Record<string, { dot: string; text: string; label: string }> = {
  wishlist: { dot: "bg-gray-400", text: "text-gray-600", label: "Wishlist" },
  applied: { dot: "bg-blue-500", text: "text-blue-600", label: "Applied" },
  interview: { dot: "bg-amber-500", text: "text-amber-600", label: "Interview" },
  offer: { dot: "bg-emerald-500", text: "text-emerald-600", label: "Offer" },
  rejected: { dot: "bg-red-500", text: "text-red-600", label: "Rejected" },
};

function formatDate(date: string | null) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
}

// A flat, non-Kanban view over the same /api/applications data the tracker
// board uses — for scanning/searching the full list rather than working a
// pipeline. Companion to "Kanban Board" under the Job Tracker nav group.
export default function AllJobsPage() {
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/applications");
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Failed to load applications");
        if (!cancelled) setApplications(data as ApplicationRecord[]);
      } catch (err) {
        if (!cancelled) setLoadError(err instanceof Error ? err.message : "Failed to load applications");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return applications;
    return applications.filter(
      (a) => a.company.toLowerCase().includes(q) || a.role.toLowerCase().includes(q),
    );
  }, [applications, search]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const rangeStart = total === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(currentPage * PAGE_SIZE, total);
  const pageRows = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50">
            <ListChecks className="h-5 w-5 text-brand-purple" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">All Jobs</h1>
            <p className="text-sm text-gray-500">Every tracked application in one flat, searchable list.</p>
          </div>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search company, role..."
            className="h-9 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-sm text-gray-700 outline-none placeholder:text-gray-400 focus:border-purple-300 focus:ring-2 focus:ring-purple-100"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-xs font-medium text-gray-500">
                <th className="px-6 py-3 font-medium">Company</th>
                <th className="px-6 py-3 font-medium">Role</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Location</th>
                <th className="px-6 py-3 font-medium">Applied</th>
                <th className="px-6 py-3 font-medium">Updated</th>
                <th className="w-10 px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-sm text-gray-400">
                    Loading applications…
                  </td>
                </tr>
              ) : loadError ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-sm text-red-500">
                    {loadError}
                  </td>
                </tr>
              ) : pageRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-sm text-gray-500">
                    No applications yet.{" "}
                    <Link href="/dashboard/jobs/tracker" className="text-brand-purple underline underline-offset-2">
                      Add one from the Kanban Board
                    </Link>
                    .
                  </td>
                </tr>
              ) : (
                pageRows.map((app) => {
                  const style = STATUS_STYLES[app.status] ?? STATUS_STYLES.wishlist;
                  return (
                    <tr key={app.id} className="hover:bg-gray-50/60">
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 text-sm font-bold text-white">
                            {app.company.charAt(0).toUpperCase()}
                          </span>
                          <span className="font-medium text-gray-900">{app.company}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3.5 text-gray-600">{app.role}</td>
                      <td className="px-6 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${style.text}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                          {style.label}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-gray-500">{app.location ?? "—"}</td>
                      <td className="px-6 py-3.5 text-gray-500">{formatDate(app.appliedDate)}</td>
                      <td className="px-6 py-3.5 text-gray-500">{formatDate(app.updatedAt)}</td>
                      <td className="px-6 py-3.5 text-right">
                        {app.url && (
                          <a
                            href={app.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                            aria-label={`Open ${app.company} listing`}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {!isLoading && !loadError && total > 0 && (
          <div className="flex flex-col gap-3 border-t border-gray-100 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-gray-500">
              Showing {rangeStart} to {rangeEnd} of {total} jobs
            </p>
            <NumberedPagination page={currentPage} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </div>
    </div>
  );
}
