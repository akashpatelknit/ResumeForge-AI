"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Calendar,
  ChevronDown,
  Loader2,
  Mail,
  MoreVertical,
  Search,
  Settings,
  Sparkles,
  SlidersHorizontal,
  ArrowUpDown,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NumberedPagination } from "@/components/admin/NumberedPagination";
import { CompanyLogo, OUTREACH_TYPE_STYLES, OutreachTypeBadge, StatusBadge } from "@/components/outreach/OutreachBadges";
import {
  OUTREACH_TYPE_LABELS,
  STATUS_LABELS,
  type OutreachEntry,
  type OutreachStatus,
  type OutreachType,
} from "@/components/outreach/outreachData";
import { GenerateEmailPanel } from "@/components/outreach/GenerateEmailPanel";
import { QuickApplyModal } from "@/components/outreach/QuickApplyModal";

const OUTREACH_TYPES: OutreachType[] = ["cold", "general", "referral", "quickApply"];
const STATUSES: OutreachStatus[] = ["approved", "generated", "scheduled", "sent", "replied", "bounced", "draft"];
const PAGE_SIZE_OPTIONS = [10, 25, 50];
const DATE_FILTER_OPTIONS = [
  { value: "0", label: "Any Time" },
  { value: "1", label: "Today" },
  { value: "7", label: "This Week" },
  { value: "30", label: "This Month" },
];

const notWiredYet = () => toast.info("Not wired up yet — coming in a follow-up pass.");

function formatDateTime(iso: string | null): string | null {
  if (!iso) return null;
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function StatCardOutreach({
  label,
  value,
  footer,
}: {
  label: string;
  value: string;
  footer: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
      {footer}
    </div>
  );
}

interface QueueStats {
  sentToday: number;
  repliesThisWeek: number;
  bounceRate: number;
  scheduledCount: number;
}

export default function ColdOutreachPage() {
  const [entries, setEntries] = useState<OutreachEntry[]>([]);
  const [stats, setStats] = useState<QueueStats | null>(null);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<OutreachStatus | "all">("all");
  const [companyFilter, setCompanyFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<OutreachType | "all">("all");
  const [dateFilter, setDateFilter] = useState("0");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [panelOpen, setPanelOpen] = useState(false);
  const [panelEntry, setPanelEntry] = useState<OutreachEntry | null>(null);
  const [quickApplyOpen, setQuickApplyOpen] = useState(false);
  const [quickApplyKey, setQuickApplyKey] = useState(0);

  // The Dashboard's only data source is a user's own queued SavedJob rows
  // (GET /api/outreach/queue) — never raw Job Discovery listings, since
  // this is where real outreach emails get generated/scheduled from. A
  // user's own queue is expected to be small (dozens, not thousands), so
  // it's fetched whole and filtered/paginated client-side below, same as
  // this page already did against mock data.
  const fetchQueue = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/outreach/queue");
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Failed to load your outreach queue.");
        return;
      }
      setEntries(data.entries);
      setStats(data.stats);
    } catch (error) {
      console.error("Failed to load outreach queue:", error);
      toast.error("Network error loading your outreach queue.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchQueue();
  }, [fetchQueue]);

  const companies = useMemo(
    () => Array.from(new Set(entries.map((e) => e.company))).sort(),
    [entries],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const dateWithinDays = Number(dateFilter) || 0;
    const cutoff = dateWithinDays > 0 ? Date.now() - dateWithinDays * 24 * 60 * 60 * 1000 : 0;

    return entries.filter((e) => {
      if (statusFilter !== "all" && e.status !== statusFilter) return false;
      if (companyFilter !== "all" && e.company !== companyFilter) return false;
      if (typeFilter !== "all" && e.outreachType !== typeFilter) return false;
      if (dateWithinDays > 0) {
        if (!e.lastActivity || new Date(e.lastActivity).getTime() < cutoff) return false;
      }
      if (!q) return true;
      return (
        e.company.toLowerCase().includes(q) ||
        e.role.toLowerCase().includes(q) ||
        e.emails.some((email) => email.toLowerCase().includes(q))
      );
    });
  }, [entries, search, statusFilter, companyFilter, typeFilter, dateFilter]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);
  const rangeStart = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const rangeEnd = Math.min(currentPage * pageSize, total);
  const pageRows = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const allPageSelected = pageRows.length > 0 && pageRows.every((r) => selected.has(r.id));

  function toggleRow(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAllOnPage() {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allPageSelected) {
        pageRows.forEach((r) => next.delete(r.id));
      } else {
        pageRows.forEach((r) => next.add(r.id));
      }
      return next;
    });
  }

  function openPanelFor(entry: OutreachEntry) {
    setPanelEntry(entry);
    setPanelOpen(true);
  }

  function openQuickApply() {
    setQuickApplyKey((k) => k + 1);
    setQuickApplyOpen(true);
  }

  function openPanelForNew() {
    setPanelEntry({
      id: "draft-new",
      company: "New Company",
      role: "Add role title",
      outreachType: "cold",
      jobId: null,
      emails: [],
      status: "draft",
      scheduledSendTime: null,
      lastActivity: null,
    });
    setPanelOpen(true);
  }

  async function removeFromQueue(entry: OutreachEntry) {
    try {
      const res = await fetch("/api/jobs/unsave", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ savedJobId: entry.id, action: "queue" }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Failed to remove this job from your queue.");
        return;
      }
      toast.success("Removed from queue.");
      setSelected((prev) => {
        if (!prev.has(entry.id)) return prev;
        const next = new Set(prev);
        next.delete(entry.id);
        return next;
      });
      await fetchQueue();
    } catch (error) {
      console.error("Failed to remove from queue:", error);
      toast.error("Network error — please try again.");
    }
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50">
            <Mail className="h-5 w-5 text-brand-purple" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Cold Outreach</h1>
            <p className="text-sm text-gray-500">AI-powered outreach to recruiters for your tracked jobs.</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/dashboard/outreach/settings"
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Settings className="h-4 w-4" />
            Settings
          </Link>

          <div className="inline-flex overflow-hidden rounded-xl shadow-md shadow-purple-200">
            <button
              type="button"
              onClick={openPanelForNew}
              className="inline-flex h-10 cursor-pointer items-center gap-2 border-none bg-brand-purple px-4 text-sm font-semibold text-white hover:bg-brand-purple/90"
            >
              <Plus className="h-4 w-4" />
              New Outreach
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="inline-flex h-10 cursor-pointer items-center border-none border-l border-white/20 bg-brand-purple px-2.5 text-white hover:bg-brand-purple/90"
                  aria-label="More new outreach options"
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="cursor-pointer" onClick={openPanelForNew}>
                  Single Outreach
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" onClick={openQuickApply}>
                  Quick Apply
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" onClick={notWiredYet}>
                  Bulk from Job Tracker
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" onClick={notWiredYet}>
                  Import from CSV
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Stats strip — real counts from the same queued rows above, not
          mock numbers. The "/ 15" daily cap and its progress bar stay a
          static placeholder: the actual cap lives in Send Scheduler
          settings, which is explicitly still mock (out of scope here).
          "vs last week" trend arrows from the original mock are dropped
          entirely rather than faked — there's no historical snapshot to
          compute a real delta from yet. */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCardOutreach
          label="Sent Today"
          value={`${stats?.sentToday ?? 0} / 15`}
          footer={
            <div className="mt-3">
              <p className="mb-1.5 text-xs text-gray-400">Daily cap</p>
              <Progress value={Math.min(100, ((stats?.sentToday ?? 0) / 15) * 100)} className="h-1.5" />
            </div>
          }
        />
        <StatCardOutreach
          label="Replies This Week"
          value={String(stats?.repliesThisWeek ?? 0)}
          footer={<p className="mt-2 text-xs text-gray-400">Last 7 days</p>}
        />
        <StatCardOutreach
          label="Bounce Rate"
          value={`${stats?.bounceRate ?? 0}%`}
          footer={<p className="mt-2 text-xs text-gray-400">Of sent + replied + bounced</p>}
        />
        <StatCardOutreach
          label="Scheduled"
          value={String(stats?.scheduledCount ?? 0)}
          footer={<p className="mt-2 text-xs text-gray-400">Queued to send</p>}
        />
      </div>

      {/* Filter bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Status
                {statusFilter !== "all" && (
                  <span className="rounded-full bg-purple-100 px-1.5 py-0.5 text-[10px] font-semibold text-brand-purple">1</span>
                )}
                <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuRadioGroup value={statusFilter} onValueChange={(v) => setStatusFilter(v as OutreachStatus | "all")}>
                <DropdownMenuRadioItem className="cursor-pointer" value="all">
                  All statuses
                </DropdownMenuRadioItem>
                {STATUSES.map((s) => (
                  <DropdownMenuRadioItem key={s} className="cursor-pointer" value={s}>
                    {STATUS_LABELS[s]}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Company
                {companyFilter !== "all" && (
                  <span className="rounded-full bg-purple-100 px-1.5 py-0.5 text-[10px] font-semibold text-brand-purple">1</span>
                )}
                <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="max-h-72 w-48 overflow-y-auto">
              <DropdownMenuRadioGroup value={companyFilter} onValueChange={setCompanyFilter}>
                <DropdownMenuRadioItem className="cursor-pointer" value="all">
                  All companies
                </DropdownMenuRadioItem>
                {companies.map((c) => (
                  <DropdownMenuRadioItem key={c} className="cursor-pointer" value={c}>
                    {c}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <Calendar className="h-3.5 w-3.5 text-gray-400" />
                Date
                {dateFilter !== "0" && (
                  <span className="rounded-full bg-purple-100 px-1.5 py-0.5 text-[10px] font-semibold text-brand-purple">1</span>
                )}
                <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-44">
              <DropdownMenuRadioGroup value={dateFilter} onValueChange={setDateFilter}>
                {DATE_FILTER_OPTIONS.map((opt) => (
                  <DropdownMenuRadioItem key={opt.value} className="cursor-pointer" value={opt.value}>
                    {opt.label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Outreach Type
                {typeFilter !== "all" && (
                  <span className="rounded-full bg-purple-100 px-1.5 py-0.5 text-[10px] font-semibold text-brand-purple">1</span>
                )}
                <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuRadioGroup value={typeFilter} onValueChange={(v) => setTypeFilter(v as OutreachType | "all")}>
                <DropdownMenuRadioItem className="cursor-pointer" value="all">
                  All types
                </DropdownMenuRadioItem>
                {OUTREACH_TYPES.map((t) => (
                  <DropdownMenuRadioItem key={t} className="cursor-pointer" value={t}>
                    {OUTREACH_TYPE_LABELS[t]}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search company, role, email..."
            className="h-9 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-sm text-gray-700 outline-none placeholder:text-gray-400 focus:border-purple-300 focus:ring-2 focus:ring-purple-100"
          />
        </div>
      </div>

      {/* Bulk selection bar */}
      {selected.size > 0 && (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-purple-100 bg-purple-50 px-4 py-3">
          <span className="text-sm font-semibold text-brand-purple">{selected.size} selected</span>
          <button
            type="button"
            onClick={notWiredYet}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-brand-purple px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-brand-purple/90"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Generate Emails
          </button>
          <button
            type="button"
            onClick={notWiredYet}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-brand-purple px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-brand-purple/90"
          >
            <Calendar className="h-3.5 w-3.5" />
            Approve &amp; Schedule
          </button>
          <button
            type="button"
            onClick={() => setSelected(new Set())}
            className="cursor-pointer border-none bg-transparent text-xs font-medium text-brand-purple underline-offset-2 hover:underline"
          >
            Clear Selection
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white py-20 text-sm text-gray-400 shadow-sm">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading your outreach queue...
        </div>
      ) : total === 0 ? (
        <EmptyState onNew={openPanelForNew} />
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm lg:block">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-xs font-medium text-gray-500">
                    <th className="w-10 px-4 py-3">
                      <Checkbox checked={allPageSelected} onCheckedChange={toggleAllOnPage} aria-label="Select all rows" />
                    </th>
                    <th className="px-4 py-3 font-medium">Company</th>
                    <th className="px-4 py-3 font-medium">Role</th>
                    <th className="px-4 py-3 font-medium">Outreach Type</th>
                    <th className="px-4 py-3 font-medium">Job ID</th>
                    <th className="px-4 py-3 font-medium">Recruiter / Contact Email(s)</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Scheduled Send Time</th>
                    <th className="px-4 py-3 font-medium">Last Activity</th>
                    <th className="w-10 px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {pageRows.map((entry) => (
                    <tr key={entry.id} className="hover:bg-gray-50/60">
                      <td className="px-4 py-3.5">
                        <Checkbox
                          checked={selected.has(entry.id)}
                          onCheckedChange={() => toggleRow(entry.id)}
                          aria-label={`Select ${entry.company}`}
                        />
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <CompanyLogo company={entry.company} />
                          <span className="font-medium text-gray-900">{entry.company}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-gray-600">{entry.role}</td>
                      <td className="px-4 py-3.5">
                        <OutreachTypeBadge type={entry.outreachType} />
                      </td>
                      <td className="px-4 py-3.5 text-gray-500">{entry.jobId ?? "—"}</td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-gray-600">{entry.emails[0]}</span>
                          {entry.emails.length > 1 && (
                            <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] font-semibold text-gray-500">
                              +{entry.emails.length - 1}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusBadge status={entry.status} />
                      </td>
                      <td className="px-4 py-3.5 text-gray-500">{formatDateTime(entry.scheduledSendTime) ?? "—"}</td>
                      <td className="px-4 py-3.5 text-gray-500">{formatDateTime(entry.lastActivity) ?? "—"}</td>
                      <td className="px-4 py-3.5 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              type="button"
                              className="cursor-pointer rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                              aria-label={`Actions for ${entry.company}`}
                            >
                              <MoreVertical className="h-4 w-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem className="cursor-pointer" onClick={() => openPanelFor(entry)}>
                              Review &amp; Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer" onClick={notWiredYet}>
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer text-red-600" onClick={() => removeFromQueue(entry)}>
                              Remove from Queue
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-4 border-t border-gray-100 px-4 py-3">
              {OUTREACH_TYPES.map((t) => (
                <span key={t} className="inline-flex items-center gap-1.5 text-xs text-gray-500">
                  <span className={cn("h-2 w-2 rounded-full", OUTREACH_TYPE_STYLES[t].dot)} />
                  {OUTREACH_TYPE_LABELS[t]}
                </span>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex flex-col gap-3 border-t border-gray-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-gray-500">
                Showing {rangeStart} to {rangeEnd} of {total} outreach entries
              </p>
              <div className="flex items-center gap-3">
                <NumberedPagination page={currentPage} totalPages={totalPages} onPageChange={setPage} />
                <Select
                  value={String(pageSize)}
                  onValueChange={(v) => {
                    setPageSize(Number(v));
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="h-9 w-28 border-gray-200 bg-white text-sm text-gray-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAGE_SIZE_OPTIONS.map((size) => (
                      <SelectItem key={size} value={String(size)}>
                        {size} / page
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Mobile view */}
          <div className="space-y-3 lg:hidden">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={notWiredYet}
                className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                Filters
              </button>
              <button
                type="button"
                onClick={notWiredYet}
                className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <ArrowUpDown className="h-3.5 w-3.5" />
                Sort
              </button>
            </div>

            {pageRows.map((entry) => (
              <button
                key={entry.id}
                type="button"
                onClick={() => openPanelFor(entry)}
                className="w-full cursor-pointer rounded-2xl border border-gray-200 bg-white p-4 text-left shadow-sm"
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <CompanyLogo company={entry.company} />
                    <div>
                      <p className="font-semibold text-gray-900">{entry.company}</p>
                      <p className="text-xs text-gray-500">{entry.role}</p>
                    </div>
                  </div>
                  <Checkbox
                    checked={selected.has(entry.id)}
                    onCheckedChange={() => toggleRow(entry.id)}
                    onClick={(e) => e.stopPropagation()}
                    aria-label={`Select ${entry.company}`}
                  />
                </div>
                <div className="mb-3 flex items-center gap-2">
                  <OutreachTypeBadge type={entry.outreachType} />
                  <StatusBadge status={entry.status} />
                </div>
                <div className="space-y-1 border-t border-gray-100 pt-2.5 text-xs text-gray-500">
                  <p className="truncate">{entry.emails[0]}</p>
                  <div className="flex items-center justify-between">
                    <span>Scheduled: {formatDateTime(entry.scheduledSendTime) ?? "—"}</span>
                    <span>Last activity: {formatDateTime(entry.lastActivity) ?? "—"}</span>
                  </div>
                </div>
              </button>
            ))}

            <div className="flex flex-col items-center gap-3 pt-2">
              <p className="text-sm text-gray-500">
                Showing {rangeStart} to {rangeEnd} of {total} outreach entries
              </p>
              <NumberedPagination page={currentPage} totalPages={totalPages} onPageChange={setPage} />
            </div>
          </div>
        </>
      )}

      <GenerateEmailPanel
        key={panelEntry?.id ?? "empty"}
        open={panelOpen}
        onOpenChange={setPanelOpen}
        entry={panelEntry}
      />
      <QuickApplyModal key={quickApplyKey} open={quickApplyOpen} onOpenChange={setQuickApplyOpen} />
    </div>
  );
}

function EmptyState({ onNew }: { onNew: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-gray-200 bg-white py-20 text-center shadow-sm">
      <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-50">
        <Mail className="h-7 w-7 text-brand-purple" />
        <Sparkles className="absolute -right-1 -top-1 h-4 w-4 text-purple-400" />
      </div>
      <div>
        <p className="mb-1 text-base font-semibold text-gray-800">No outreach entries yet</p>
        <p className="mx-auto max-w-xs text-sm text-gray-400 leading-relaxed">
          Start your first outreach and let AI help you connect with recruiters.
        </p>
      </div>
      <button
        type="button"
        onClick={onNew}
        className="mt-1 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-brand-purple px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-200 hover:bg-brand-purple/90"
      >
        <Plus className="h-4 w-4" />
        New Outreach
      </button>
    </div>
  );
}
