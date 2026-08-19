"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Loader2, Send } from "lucide-react";
import { Card } from "@/components/ui/card";

// Not a persisted per-user setting — Send Scheduler
// (app/(app)/dashboard/outreach/settings/page.tsx) only holds this as local
// UI state, no DB table/API backs it yet. Matches the same hardcoded value
// already shown on the Cold Outreach queue page (app/(app)/dashboard/
// outreach/page.tsx) for consistency, rather than inventing a different
// number here.
const DAILY_SEND_CAP = 15;

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

interface QueueEntry {
  status: string;
  lastActivity: string | null;
}

interface QueueResponse {
  entries: QueueEntry[];
  stats: {
    sentToday: number;
    repliesThisWeek: number;
  };
}

interface OutreachStats {
  sentToday: number;
  repliesThisWeek: number;
  inQueue: number;
  // null = no sent/replied/bounced activity in the last 30 days to compute
  // a rate from — rendered as "—" rather than a misleading 0%.
  bounceRate: number | null;
}

// GET /api/outreach/queue already scopes `entries` to this user's
// isQueued=true SavedJob rows (see its WHERE clause) — so entries.length
// *is* "In Queue" as specified, no separate query needed. bounceRate is
// recomputed here over a 30-day window from the same entries, since the
// route's own bounceRate is all-time.
function computeBounceRate30d(entries: QueueEntry[]): number | null {
  const cutoff = Date.now() - THIRTY_DAYS_MS;
  const recent = entries.filter((e) => e.lastActivity && new Date(e.lastActivity).getTime() >= cutoff);
  const relevant = recent.filter((e) => e.status === "sent" || e.status === "replied" || e.status === "bounced");
  if (relevant.length === 0) return null;
  const bounced = relevant.filter((e) => e.status === "bounced").length;
  return Math.round((bounced / relevant.length) * 1000) / 10;
}

export default function OutreachActivity() {
  const [stats, setStats] = useState<OutreachStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch("/api/outreach/queue");
        const data: QueueResponse = await res.json();
        if (!res.ok || cancelled) return;

        setStats({
          sentToday: data.stats?.sentToday ?? 0,
          repliesThisWeek: data.stats?.repliesThisWeek ?? 0,
          inQueue: Array.isArray(data.entries) ? data.entries.length : 0,
          bounceRate: computeBounceRate30d(data.entries ?? []),
        });
      } catch (error) {
        console.error("Failed to load outreach activity:", error);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const tiles = [
    { label: "Sent Today", value: stats ? `${stats.sentToday}/${DAILY_SEND_CAP}` : "—" },
    { label: "Replies This Week", value: stats ? String(stats.repliesThisWeek) : "—" },
    { label: "In Queue", value: stats ? `${stats.inQueue} jobs` : "—" },
    { label: "Bounce Rate", value: stats?.bounceRate != null ? `${stats.bounceRate}%` : "—" },
  ];

  return (
    <Card className="overflow-hidden border shadow-sm p-0">
      <div className="border-b border-gray-100 bg-linear-to-r from-gray-50 to-transparent p-6">
        <div className="mb-0.5 flex items-center gap-2">
          <Send className="h-5 w-5 text-purple-600" />
          <h2 className="text-lg font-bold text-gray-900">Outreach Activity</h2>
        </div>
        <p className="text-sm text-gray-500">Your recruiter outreach at a glance</p>
      </div>

      <div className="p-6">
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-8 text-sm text-gray-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading...
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {tiles.map((tile) => (
              <div key={tile.label} className="rounded-xl bg-gray-50 p-4">
                <p className="text-xs text-gray-500">{tile.label}</p>
                <p className="mt-1 text-xl font-bold text-gray-900">{tile.value}</p>
              </div>
            ))}
          </div>
        )}

        <Link
          href="/dashboard/outreach"
          className="group mt-4 inline-flex items-center gap-2 text-sm font-medium text-purple-600 transition-colors hover:text-purple-700"
        >
          View Outreach Dashboard
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </Card>
  );
}
