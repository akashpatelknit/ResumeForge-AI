"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Calendar,
  Check,
  ChevronDown,
  ChevronRight,
  Clock,
  Download,
  Loader2,
  MessageCircle,
  Minus,
  Reply,
  Search,
  Send,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NumberedPagination } from "@/components/admin/NumberedPagination";
import { CompanyLogo, OutreachTypeBadge } from "@/components/outreach/OutreachBadges";
import { HISTORY_STATUS_LABELS, type HistoryEntry, type HistoryStatus } from "@/components/outreach/outreachHistoryData";
import { OUTREACH_TYPE_LABELS, type OutreachType } from "@/components/outreach/outreachData";

const notWiredYet = () => toast.info("Not wired up yet — coming in a follow-up pass.");

const STATUS_FILTERS: (HistoryStatus | "all")[] = ["all", "sent", "replied", "bounced", "failed"];
const TYPE_FILTERS: (OutreachType | "all")[] = ["all", "cold", "general", "referral", "quickApply"];
const DATE_RANGE_FILTERS = ["All time", "This week", "Last 7 days", "Last 30 days", "This month"];
const PAGE_SIZE = 10;

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function dateRangeCutoff(range: string): number {
  const now = new Date();
  switch (range) {
    case "This week": {
      const d = new Date(now);
      const day = d.getDay();
      const diffToMonday = day === 0 ? 6 : day - 1;
      d.setDate(d.getDate() - diffToMonday);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    }
    case "Last 7 days":
      return now.getTime() - 7 * 24 * 60 * 60 * 1000;
    case "Last 30 days":
      return now.getTime() - 30 * 24 * 60 * 60 * 1000;
    case "This month": {
      const d = new Date(now.getFullYear(), now.getMonth(), 1);
      return d.getTime();
    }
    default:
      return 0;
  }
}

const STATUS_ICON_STYLES: Record<HistoryStatus, { bg: string; icon: typeof Check }> = {
  sent: { bg: "bg-emerald-500", icon: Check },
  replied: { bg: "bg-blue-500", icon: Reply },
  bounced: { bg: "bg-red-500", icon: X },
  failed: { bg: "bg-gray-400", icon: Minus },
};

const STATUS_LABEL_COLOR: Record<HistoryStatus, string> = {
  sent: "text-gray-900",
  replied: "text-blue-700",
  bounced: "text-red-600",
  failed: "text-gray-500",
};

function StatCard({
  icon: Icon,
  iconBg,
  iconColor,
  label,
  value,
  trend,
  trendDirection,
  footnote,
}: {
  icon: typeof Send;
  iconBg: string;
  iconColor: string;
  label: string;
  value: string;
  trend?: string;
  trendDirection?: "up" | "down";
  footnote?: string;
}) {
  const TrendIcon = trendDirection === "up" ? ArrowUp : ArrowDown;
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className={cn("mb-3 flex h-9 w-9 items-center justify-center rounded-full", iconBg)}>
        <Icon className={cn("h-4.5 w-4.5", iconColor)} />
      </div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
      {trend && trendDirection ? (
        <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-emerald-600">
          <TrendIcon className="h-3 w-3" />
          {trend}
        </p>
      ) : footnote ? (
        <p className="mt-1.5 text-xs text-gray-400">{footnote}</p>
      ) : null}
    </div>
  );
}

function FilterButton({
  label,
  value,
  children,
}: {
  label: string;
  value: string;
  children: React.ReactNode;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex cursor-pointer flex-col items-start gap-0.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-left hover:bg-gray-50"
        >
          <span className="text-[11px] font-medium text-gray-400">{label}</span>
          <span className="flex items-center gap-1 text-sm font-semibold text-gray-700">
            {value}
            <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface HistoryStats {
  totalSent: number;
  replyRate: number;
  bounceRate: number;
}

export default function OutreachHistoryPage() {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [stats, setStats] = useState<HistoryStats | null>(null);
  const [loading, setLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState<HistoryStatus | "all">("all");
  const [companyFilter, setCompanyFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState<OutreachType | "all">("all");
  const [dateRangeFilter, setDateRangeFilter] = useState("All time");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  // Same "fetch a user's own history whole, filter/paginate client-side"
  // pattern as the Cold Outreach Dashboard (GET /api/outreach/queue) — a
  // user's own outreach history is dozens to low hundreds of rows, not the
  // volume that would need a paginated API contract.
  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/outreach/history");
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Failed to load your outreach history.");
        return;
      }
      setEntries(data.entries);
      setStats(data.stats);
    } catch (error) {
      console.error("Failed to load outreach history:", error);
      toast.error("Network error loading your outreach history.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchHistory();
  }, [fetchHistory]);

  const companies = useMemo(() => Array.from(new Set(entries.map((e) => e.company))).sort(), [entries]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const cutoff = dateRangeCutoff(dateRangeFilter);

    return entries.filter((e) => {
      if (statusFilter !== "all" && e.status !== statusFilter) return false;
      if (companyFilter !== "all" && e.company !== companyFilter) return false;
      if (typeFilter !== "all" && e.outreachType !== typeFilter) return false;
      if (cutoff > 0 && new Date(e.timestamp).getTime() < cutoff) return false;
      if (!q) return true;
      return (
        e.company.toLowerCase().includes(q) ||
        e.role.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q)
      );
    });
  }, [entries, search, statusFilter, companyFilter, typeFilter, dateRangeFilter]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const rangeStart = total === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(currentPage * PAGE_SIZE, total);
  const pageRows = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function toggleExpanded(id: string) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50">
            <Send className="h-5 w-5 text-brand-purple" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Outreach History</h1>
            <p className="text-sm text-gray-500">Track every email you&apos;ve sent and its outcome.</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={notWiredYet}
            className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Calendar className="h-4 w-4 text-gray-400" />
            May 14 – May 21, 2025
          </button>
          <button
            type="button"
            onClick={notWiredYet}
            aria-label="Export outreach history"
            className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
          >
            <Download className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Stats strip — real counts from the same rows below. No trend
          deltas (no historical snapshot to compare against) and no reply
          rate/response time data yet: GmailAccount only ever requests the
          gmail.send scope, never gmail.readonly, so there's no inbox to
          detect a reply or bounce from — replyRate/bounceRate will
          correctly read 0% until that's built, not faked as non-zero. */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Send}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
          label="Total Sent"
          value={String(stats?.totalSent ?? 0)}
        />
        <StatCard
          icon={MessageCircle}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
          label="Reply Rate"
          value={`${stats?.replyRate ?? 0}%`}
          footnote="Reply tracking not available yet"
        />
        <StatCard
          icon={AlertTriangle}
          iconBg="bg-red-50"
          iconColor="text-red-600"
          label="Bounce Rate"
          value={`${stats?.bounceRate ?? 0}%`}
          footnote="Bounce tracking not available yet"
        />
        <StatCard
          icon={Clock}
          iconBg="bg-purple-50"
          iconColor="text-brand-purple"
          label="Avg. Response Time"
          value="—"
          footnote="Requires reply tracking"
        />
      </div>

      {/* Filter bar */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <FilterButton label="Status" value={statusFilter === "all" ? "All Statuses" : HISTORY_STATUS_LABELS[statusFilter]}>
            <DropdownMenuRadioGroup value={statusFilter} onValueChange={(v) => setStatusFilter(v as HistoryStatus | "all")}>
              {STATUS_FILTERS.map((s) => (
                <DropdownMenuRadioItem key={s} className="cursor-pointer" value={s}>
                  {s === "all" ? "All Statuses" : HISTORY_STATUS_LABELS[s]}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </FilterButton>

          <FilterButton label="Company" value={companyFilter === "all" ? "All Companies" : companyFilter}>
            <DropdownMenuRadioGroup
              value={companyFilter}
              onValueChange={(v) => {
                setCompanyFilter(v);
                setPage(1);
              }}
            >
              <DropdownMenuRadioItem className="cursor-pointer" value="all">
                All Companies
              </DropdownMenuRadioItem>
              {companies.map((c) => (
                <DropdownMenuRadioItem key={c} className="cursor-pointer" value={c}>
                  {c}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </FilterButton>

          <FilterButton label="Outreach Type" value={typeFilter === "all" ? "All Types" : OUTREACH_TYPE_LABELS[typeFilter]}>
            <DropdownMenuRadioGroup value={typeFilter} onValueChange={(v) => setTypeFilter(v as OutreachType | "all")}>
              {TYPE_FILTERS.map((t) => (
                <DropdownMenuRadioItem key={t} className="cursor-pointer" value={t}>
                  {t === "all" ? "All Types" : OUTREACH_TYPE_LABELS[t]}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </FilterButton>

          <FilterButton label="Date Range" value={dateRangeFilter}>
            <DropdownMenuRadioGroup value={dateRangeFilter} onValueChange={setDateRangeFilter}>
              {DATE_RANGE_FILTERS.map((d) => (
                <DropdownMenuRadioItem key={d} className="cursor-pointer" value={d}>
                  {d}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </FilterButton>
        </div>

        <div className="relative w-full lg:w-80">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by company, role, or email..."
            className="h-10 w-full rounded-xl border border-gray-200 bg-white pl-9 pr-3 text-sm text-gray-700 outline-none placeholder:text-gray-400 focus:border-purple-300 focus:ring-2 focus:ring-purple-100"
          />
        </div>
      </div>

      {/* Activity feed */}
      {loading ? (
        <div className="flex items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white py-20 text-sm text-gray-400 shadow-sm">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading your outreach history...
        </div>
      ) : total === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white py-20 text-center shadow-sm">
          <Send className="h-7 w-7 text-gray-300" />
          <p className="text-sm font-semibold text-gray-700">No outreach history yet</p>
          <p className="max-w-xs text-sm text-gray-400">
            Emails you schedule and send from the Cold Outreach dashboard will show up here.
          </p>
        </div>
      ) : (
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        {/* Desktop/tablet row layout */}
        <div className="relative hidden md:block">
          <div className="absolute top-0 bottom-0 left-[38px] w-px bg-gray-200" aria-hidden />

          <div className="divide-y divide-gray-100">
            {pageRows.map((entry) => {
              const { bg, icon: StatusIcon } = STATUS_ICON_STYLES[entry.status];
              const isExpanded = expandedId === entry.id;
              const isReplied = entry.status === "replied";
              const hasReason = entry.status === "bounced" || entry.status === "failed";

              return (
                <div key={entry.id}>
                  <div className="flex flex-wrap items-center gap-4 px-5 py-4 hover:bg-gray-50/60 sm:flex-nowrap">
                    {/* Status icon */}
                    <span
                      className={cn(
                        "relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ring-4 ring-white",
                        bg,
                      )}
                    >
                      <StatusIcon className="h-4 w-4 text-white" />
                    </span>

                    {/* Company */}
                    <div className="flex min-w-[190px] flex-1 items-center gap-2.5 sm:flex-none sm:basis-56">
                      <CompanyLogo company={entry.company} />
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-gray-900">{entry.company}</p>
                        <p className="truncate text-xs text-gray-500">{entry.role}</p>
                      </div>
                    </div>

                    {/* Type badge */}
                    <div className="shrink-0 sm:basis-28">
                      <OutreachTypeBadge type={entry.outreachType} />
                    </div>

                    {/* Email */}
                    <p className="min-w-[160px] flex-1 truncate text-sm text-gray-600 sm:flex-none sm:basis-56">
                      {entry.email}
                    </p>

                    {/* Status + timestamp */}
                    <div className="shrink-0 sm:basis-32">
                      <p className={cn("text-sm font-semibold", STATUS_LABEL_COLOR[entry.status])}>
                        {HISTORY_STATUS_LABELS[entry.status]}
                      </p>
                      <p className="text-xs text-gray-400">{formatTimestamp(entry.timestamp)}</p>
                    </div>

                    {/* Action area + chevron */}
                    <div className="ml-auto flex shrink-0 items-center gap-3">
                      {hasReason && <span className="text-xs font-medium text-red-500">{entry.reason}</span>}

                      {isReplied ? (
                        <button
                          type="button"
                          onClick={() => toggleExpanded(entry.id)}
                          className="inline-flex cursor-pointer items-center gap-1 rounded-lg bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-700 hover:bg-teal-100"
                        >
                          Preview
                          <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", isExpanded && "rotate-180")} />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => toggleExpanded(entry.id)}
                          aria-label={`Toggle details for ${entry.company}`}
                          className="cursor-pointer rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                        >
                          <ChevronRight className={cn("h-4 w-4 transition-transform", isExpanded && "rotate-90")} />
                        </button>
                      )}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="ml-[62px] mr-5 mb-4 rounded-xl border border-gray-100 bg-gray-50/60 px-4 py-3 text-sm">
                      <p className="font-medium text-gray-800">{entry.subject}</p>
                      <p className="mt-1 text-xs leading-relaxed text-gray-500">{entry.snippet}</p>
                      {entry.replySnippet && (
                        <div className="mt-3 rounded-lg border border-teal-100 bg-teal-50/60 px-3 py-2.5">
                          <p className="mb-1 text-[11px] font-semibold tracking-wide text-teal-700 uppercase">Reply</p>
                          <p className="text-xs leading-relaxed text-gray-600">{entry.replySnippet}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Mobile cards */}
        <div className="space-y-3 p-4 md:hidden">
          {pageRows.map((entry) => {
            const { bg, icon: StatusIcon } = STATUS_ICON_STYLES[entry.status];
            const isExpanded = expandedId === entry.id;
            const isReplied = entry.status === "replied";
            const hasReason = entry.status === "bounced" || entry.status === "failed";

            return (
              <div key={entry.id} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full", bg)}>
                      <StatusIcon className="h-4 w-4 text-white" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-gray-900">{entry.company}</p>
                      <p className="truncate text-xs text-gray-500">{entry.role}</p>
                    </div>
                  </div>

                  {isReplied ? (
                    <button
                      type="button"
                      onClick={() => toggleExpanded(entry.id)}
                      className="inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-lg bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-700 hover:bg-teal-100"
                    >
                      Preview
                      <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", isExpanded && "rotate-180")} />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => toggleExpanded(entry.id)}
                      aria-label={`Toggle details for ${entry.company}`}
                      className="shrink-0 cursor-pointer rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                    >
                      <ChevronRight className={cn("h-4 w-4 transition-transform", isExpanded && "rotate-90")} />
                    </button>
                  )}
                </div>

                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <OutreachTypeBadge type={entry.outreachType} />
                  <span className={cn("text-xs font-semibold", STATUS_LABEL_COLOR[entry.status])}>
                    {HISTORY_STATUS_LABELS[entry.status]}
                  </span>
                </div>

                <div className="space-y-1.5 border-t border-gray-100 pt-2.5 text-xs text-gray-500">
                  <p className="truncate">{entry.email}</p>
                  <div className="flex items-center justify-between">
                    <span>{formatTimestamp(entry.timestamp)}</span>
                    {hasReason && <span className="font-medium text-red-500">{entry.reason}</span>}
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-3 rounded-xl border border-gray-100 bg-gray-50/60 px-4 py-3 text-sm">
                    <p className="font-medium text-gray-800">{entry.subject}</p>
                    <p className="mt-1 text-xs leading-relaxed text-gray-500">{entry.snippet}</p>
                    {entry.replySnippet && (
                      <div className="mt-3 rounded-lg border border-teal-100 bg-teal-50/60 px-3 py-2.5">
                        <p className="mb-1 text-[11px] font-semibold tracking-wide text-teal-700 uppercase">Reply</p>
                        <p className="text-xs leading-relaxed text-gray-600">{entry.replySnippet}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex flex-col gap-4 border-t border-gray-100 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <p className="text-sm text-gray-500">
            Showing {rangeStart} to {rangeEnd} of {total} outreach events
          </p>
          <NumberedPagination page={currentPage} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </div>
      )}
    </div>
  );
}
