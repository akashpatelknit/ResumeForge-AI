"use client";

import { useEffect, useRef, useState } from "react";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Bookmark,
  Check,
  Loader2,
  MapPin,
  Plus,
  RotateCcw,
  Search,
  Settings2,
  SlidersHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NumberedPagination } from "@/components/admin/NumberedPagination";
import { CompanyLogo } from "@/components/outreach/OutreachBadges";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AddJobManuallyModal } from "@/components/jobs/AddJobManuallyModal";
import { QueueEmailPromptModal } from "@/components/jobs/QueueEmailPromptModal";
import type { NormalizedJob } from "@/lib/jobs/types";

const PAGE_SIZE = 15;

// Job Discovery is scoped to technical roles only (see
// lib/jobs/isTechnicalRole.ts — applied server-side, not a UI toggle), and
// defaults to India-based listings since that's this deployment's primary
// audience — changeable any time via the Location dropdown, and savable
// via the Preferences menu so it doesn't need re-picking every visit.
const DEFAULT_LOCATION = "India";

const POSTED_OPTIONS = [
  { value: "0", label: "Any Time" },
  { value: "1", label: "Today" },
  { value: "7", label: "This Week" },
  { value: "30", label: "This Month" },
];

const SOURCE_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  greenhouse: { bg: "bg-emerald-50", text: "text-emerald-700", label: "Greenhouse" },
  manual: { bg: "bg-gray-100", text: "text-gray-600", label: "Manual" },
};

function sourceStyle(source: string) {
  return SOURCE_STYLES[source] ?? { bg: "bg-gray-100", text: "text-gray-600", label: source };
}

function formatRelative(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days <= 0) return "Today";
  if (days === 1) return "1 day ago";
  if (days < 7) return `${days} days ago`;
  const weeks = Math.floor(days / 7);
  if (weeks === 1) return "1 week ago";
  if (weeks < 5) return `${weeks} weeks ago`;
  const months = Math.floor(days / 30);
  return months <= 1 ? "1 month ago" : `${months} months ago`;
}

async function postJson(url: string, body: unknown) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? "Request failed");
  return data;
}

interface JobDiscoveryFilters {
  company: string;
  location: string;
  source: string;
  roleType: string;
  experienceLevel: string;
  postedWithinDays: string;
}

const DEFAULT_FILTERS: JobDiscoveryFilters = {
  company: "all",
  location: DEFAULT_LOCATION,
  source: "all",
  roleType: "all",
  experienceLevel: "all",
  postedWithinDays: "0",
};

interface DiscoverResponse {
  jobs: NormalizedJob[];
  total: number;
  totalPages: number;
  filterOptions: { companies: string[]; locations: string[]; roleTypes: string[]; experienceLevels: string[] };
}

export default function JobDiscoveryPage() {
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState<JobDiscoveryFilters>(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [addManuallyOpen, setAddManuallyOpen] = useState(false);
  const [queuePromptJob, setQueuePromptJob] = useState<NormalizedJob | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  // Applies a saved preference exactly once, the first time it loads —
  // after that, the user's own in-session filter changes always win, even
  // if this query happens to refetch/revalidate in the background.
  const appliedSavedPreference = useRef(false);

  const preferencesQuery = useQuery({
    queryKey: ["job-discovery-preferences"],
    queryFn: async () => {
      const res = await fetch("/api/jobs/preferences");
      if (!res.ok) throw new Error("Failed to load saved preferences");
      return (await res.json()) as { filters: JobDiscoveryFilters | null };
    },
    staleTime: Infinity,
  });

  useEffect(() => {
    if (appliedSavedPreference.current) return;
    if (!preferencesQuery.data) return;
    appliedSavedPreference.current = true;
    if (preferencesQuery.data.filters) {
      setFilters(preferencesQuery.data.filters);
    }
  }, [preferencesQuery.data]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchInput.trim()), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [filters, debouncedSearch]);

  const jobsQuery = useQuery({
    queryKey: ["jobs-discover", filters, debouncedSearch, page],
    queryFn: async () => {
      const params = new URLSearchParams({
        ...filters,
        search: debouncedSearch,
        page: String(page),
        pageSize: String(PAGE_SIZE),
      });
      const res = await fetch(`/api/jobs/discover?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load jobs.");
      return data as DiscoverResponse;
    },
    // Keeps the previous page's rows on screen while a filter/page change
    // is in flight, instead of blanking the table on every change — the
    // live Greenhouse fetch can take seconds until Redis caching is set up.
    placeholderData: keepPreviousData,
  });

  const jobs = jobsQuery.data?.jobs ?? [];
  const total = jobsQuery.data?.total ?? 0;
  const totalPages = jobsQuery.data?.totalPages ?? 1;
  const filterOptions = jobsQuery.data?.filterOptions ?? { companies: [], locations: [], roleTypes: [], experienceLevels: [] };
  const loading = jobsQuery.isLoading;
  const isRefetching = jobsQuery.isFetching && !jobsQuery.isLoading;

  function invalidateJobs() {
    void queryClient.invalidateQueries({ queryKey: ["jobs-discover"] });
  }

  const savePreferencesMutation = useMutation({
    mutationFn: () => postJson("/api/jobs/preferences", { filters }).then(() => {}),
    onSuccess: () => {
      toast.success("Saved — these filters will load automatically next time.");
      void queryClient.invalidateQueries({ queryKey: ["job-discovery-preferences"] });
    },
    onError: () => toast.error("Failed to save preferences."),
  });

  const clearPreferencesMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/jobs/preferences", { method: "DELETE" });
      if (!res.ok) throw new Error();
    },
    onSuccess: () => {
      toast.success("Saved preferences cleared.");
      void queryClient.invalidateQueries({ queryKey: ["job-discovery-preferences"] });
    },
    onError: () => toast.error("Failed to clear preferences."),
  });

  function updateFilter<K extends keyof JobDiscoveryFilters>(key: K, value: JobDiscoveryFilters[K]) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  function clearFilters() {
    setFilters(DEFAULT_FILTERS);
    setSearchInput("");
  }

  async function toggleBookmark(job: NormalizedJob) {
    setPendingId(job.id);
    try {
      if (job.isBookmarked && job.savedJobId) {
        await postJson("/api/jobs/unsave", { savedJobId: job.savedJobId, action: "bookmark" });
      } else {
        await postJson("/api/jobs/save", {
          source: job.source,
          externalJobId: job.externalJobId,
          company: job.company,
          jobTitle: job.jobTitle,
          jobDescription: job.jobDescriptionPlain,
          location: job.location,
          requisitionId: job.requisitionId,
          action: "bookmark",
        });
      }
      invalidateJobs();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update bookmark.");
    } finally {
      setPendingId(null);
    }
  }

  async function queueJob(job: NormalizedJob, emails: string[]) {
    setPendingId(job.id);
    try {
      await postJson("/api/jobs/save", {
        source: job.source,
        externalJobId: job.externalJobId,
        company: job.company,
        jobTitle: job.jobTitle,
        jobDescription: job.jobDescriptionPlain,
        location: job.location,
        requisitionId: job.requisitionId,
        action: "queue",
        contactEmails: emails,
      });
      toast.success("Added to queue.");
      setQueuePromptJob(null);
      invalidateJobs();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to add to queue.");
    } finally {
      setPendingId(null);
    }
  }

  async function toggleQueue(job: NormalizedJob) {
    if (job.isQueued) {
      if (!job.savedJobId) return;
      setPendingId(job.id);
      try {
        await postJson("/api/jobs/unsave", { savedJobId: job.savedJobId, action: "queue" });
        invalidateJobs();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to remove from queue.");
      } finally {
        setPendingId(null);
      }
      return;
    }

    if (job.contactEmails.length > 0) {
      await queueJob(job, job.contactEmails);
      return;
    }

    setQueuePromptJob(job);
  }

  const rangeStart = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, total);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Job Discovery</h1>
          <p className="text-sm text-gray-500">Technical jobs sourced automatically from top companies.</p>
        </div>
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={() => setAddManuallyOpen(true)}
            className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl border border-brand-purple bg-white px-4 text-sm font-semibold text-brand-purple hover:bg-purple-50"
          >
            <Plus className="h-4 w-4" />
            Add Job Manually
          </button>
          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by role, company, or keyword..."
              className="h-10 w-full rounded-xl border border-gray-200 bg-white pl-9 pr-3 text-sm text-gray-700 outline-none placeholder:text-gray-400 focus:border-purple-300 focus:ring-2 focus:ring-purple-100"
            />
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <FilterSelect
          label="Company"
          value={filters.company}
          onChange={(v) => updateFilter("company", v)}
          options={filterOptions.companies}
          allLabel="All Companies"
        />
        <FilterSelect
          label="Location"
          value={filters.location}
          onChange={(v) => updateFilter("location", v)}
          options={filterOptions.locations}
          allLabel="All Locations"
          extraOptions={[DEFAULT_LOCATION]}
        />
        <FilterSelect
          label="Source / Portal"
          value={filters.source}
          onChange={(v) => updateFilter("source", v)}
          options={["greenhouse", "manual"]}
          optionLabel={(v) => sourceStyle(v).label}
          allLabel="All Sources"
        />
        <div className="min-w-36">
          <label className="mb-1.5 block text-xs font-semibold text-gray-500">Posted Date</label>
          <Select value={filters.postedWithinDays} onValueChange={(v) => updateFilter("postedWithinDays", v)}>
            <SelectTrigger className="h-9 w-full border-gray-200 bg-white text-sm text-gray-700">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {POSTED_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <FilterSelect
          label="Role Type"
          value={filters.roleType}
          onChange={(v) => updateFilter("roleType", v)}
          options={filterOptions.roleTypes}
          allLabel="All Role Types"
        />
        <FilterSelect
          label="Experience"
          value={filters.experienceLevel}
          onChange={(v) => updateFilter("experienceLevel", v)}
          options={filterOptions.experienceLevels}
          allLabel="All Experience Levels"
        />

        <div className="ml-auto flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <Settings2 className="h-3.5 w-3.5" />
                Preferences
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuItem
                className="cursor-pointer"
                disabled={savePreferencesMutation.isPending}
                onClick={() => savePreferencesMutation.mutate()}
              >
                Save current filters as my preferences
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer text-red-600"
                disabled={!preferencesQuery.data?.filters || clearPreferencesMutation.isPending}
                onClick={() => clearPreferencesMutation.mutate()}
              >
                Clear saved preferences
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <button
            type="button"
            onClick={() => toast.info("Additional filters aren't wired up yet — the dropdowns above cover the real filtering.")}
            className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Filters
          </button>
          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Clear
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        {/* Thin indeterminate bar — visible for both the first load and
            every subsequent filter-change refetch, not just the first. */}
        {(loading || isRefetching) && (
          <div className="absolute inset-x-0 top-0 z-10 h-0.5 overflow-hidden bg-purple-100">
            <div className="h-full w-1/3 animate-[loading-bar_1.1s_ease-in-out_infinite] bg-brand-purple" />
          </div>
        )}

        {/* Dims the existing rows and shows a centered spinner while a
            filter/page change is refetching — the rows themselves stay on
            screen underneath (via placeholderData: keepPreviousData) so
            this reads as "updating", not "reset to empty". */}
        {isRefetching && (
          <div className="absolute inset-0 z-10 flex items-start justify-center bg-white/60 pt-24">
            <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm text-gray-600 shadow-sm">
              <Loader2 className="h-4 w-4 animate-spin text-brand-purple" />
              Updating results...
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-xs font-medium text-gray-500">
                <th className="px-4 py-3 font-medium">Company</th>
                <th className="px-4 py-3 font-medium">Job Title</th>
                <th className="px-4 py-3 font-medium">Location</th>
                <th className="px-4 py-3 font-medium">Experience</th>
                <th className="px-4 py-3 font-medium">Source</th>
                <th className="px-4 py-3 font-medium">Posted</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="w-10 px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-16 text-center text-sm text-gray-400">
                    <Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin" />
                    Loading jobs...
                  </td>
                </tr>
              ) : jobsQuery.isError ? (
                <tr>
                  <td colSpan={8} className="px-4 py-16 text-center text-sm text-red-500">
                    {jobsQuery.error instanceof Error ? jobsQuery.error.message : "Failed to load jobs."}
                  </td>
                </tr>
              ) : jobs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-16 text-center text-sm text-gray-500">
                    No jobs match these filters.
                  </td>
                </tr>
              ) : (
                jobs.map((job) => {
                  const style = sourceStyle(job.source);
                  const isPending = pendingId === job.id;
                  return (
                    <tr key={job.id} className="hover:bg-gray-50/60">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <CompanyLogo company={job.company} />
                          <span className="font-medium text-gray-900">{job.company}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="font-medium text-brand-purple">{job.jobTitle}</span>
                      </td>
                      <td className="px-4 py-3.5 text-gray-600">
                        {job.location ? (
                          <span className="inline-flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                            {job.location}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-gray-600">{job.experienceLevel || "Not specified"}</td>
                      <td className="px-4 py-3.5">
                        <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium", style.bg, style.text)}>
                          {style.label}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-gray-500">{formatRelative(job.postedDate)}</td>
                      <td className="px-4 py-3.5">
                        <button
                          type="button"
                          onClick={() => toggleQueue(job)}
                          disabled={isPending}
                          className={cn(
                            "inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60",
                            job.isQueued
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                              : "border-brand-purple bg-white text-brand-purple hover:bg-purple-50",
                          )}
                        >
                          {isPending ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : job.isQueued ? (
                            <Check className="h-3.5 w-3.5" />
                          ) : (
                            <Plus className="h-3.5 w-3.5" />
                          )}
                          {job.isQueued ? "In Queue" : "Add to Queue"}
                        </button>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => toggleBookmark(job)}
                          disabled={isPending}
                          className="cursor-pointer rounded-md border-none bg-transparent p-1.5 text-gray-400 hover:bg-gray-100 hover:text-brand-purple disabled:cursor-not-allowed disabled:opacity-60"
                          aria-label={job.isBookmarked ? "Remove bookmark" : "Bookmark this job"}
                        >
                          <Bookmark className={cn("h-4 w-4", job.isBookmarked && "fill-brand-purple text-brand-purple")} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {!loading && total > 0 && (
          <div className="flex flex-col gap-3 border-t border-gray-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-gray-500">
              Showing {rangeStart}-{rangeEnd} of {total} jobs
            </p>
            <NumberedPagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </div>

      <AddJobManuallyModal open={addManuallyOpen} onOpenChange={setAddManuallyOpen} onCreated={invalidateJobs} />
      <QueueEmailPromptModal
        job={queuePromptJob}
        onOpenChange={(open) => !open && setQueuePromptJob(null)}
        onConfirm={(emails) => queueJob(queuePromptJob!, emails)}
      />

      <style>{`
        @keyframes loading-bar {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
      `}</style>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
  allLabel,
  optionLabel,
  extraOptions = [],
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  allLabel: string;
  optionLabel?: (v: string) => string;
  // Values always offered even if they're not (yet) present in `options` —
  // used for Location's "India" default, which is a substring-match filter
  // value, not necessarily a literal city string in the current result set.
  extraOptions?: string[];
}) {
  const allOptions = Array.from(new Set([...extraOptions, ...options]));

  return (
    <div className="min-w-36">
      <label className="mb-1.5 block text-xs font-semibold text-gray-500">{label}</label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-9 w-full border-gray-200 bg-white text-sm text-gray-700">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="max-h-72">
          <SelectItem value="all">{allLabel}</SelectItem>
          {allOptions.map((opt) => (
            <SelectItem key={opt} value={opt}>
              {optionLabel ? optionLabel(opt) : opt}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
