"use client";

import { useEffect, useState, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Search, Bell } from "lucide-react";
import { SignedIn, useUser } from "@clerk/nextjs";
import { mapResumeFromDB } from "@/mapper/mapResumeFromDB";
import ProfileMenu from "@/components/shared/ProfileMenu";
import type { AppResume } from "@/types/resume";

interface HeaderSummary {
  count: number;
  avgScore: number | null;
  lowestId: string | null;
}

// This header is rendered once, in the shared dashboard layout, above every
// /dashboard/* route — not just the main dashboard page. The resume
// count/ATS average line only makes sense on the dashboard home, so it's
// gated on pathname and fetched independently here rather than lifted from
// app/(app)/dashboard/page.tsx's own fetch (that page has no way to pass
// data up into a layout-level sibling). This does mean a second, lightweight
// GET /api/resumes call alongside the page's own — acceptable for one small
// text line, but worth knowing about if this pattern gets reused elsewhere.
export default function DashboardHeader() {
  const { user } = useUser();
  const pathname = usePathname();
  const router = useRouter();
  const isDashboardHome = pathname === "/dashboard";

  const [summary, setSummary] = useState<HeaderSummary | null>(null);

  useEffect(() => {
    if (!isDashboardHome) return;
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch("/api/resumes");
        const data = await res.json();
        if (!res.ok || !Array.isArray(data) || cancelled) return;

        const active = (data as unknown[])
          .map((r) => mapResumeFromDB(r as Parameters<typeof mapResumeFromDB>[0]))
          .filter((r: AppResume) => !r.isArchived);

        const avgScore =
          active.length > 0
            ? Math.round(
                active.reduce((sum, r) => sum + (r.atsScore ?? 0), 0) /
                  active.length,
              )
            : null;

        const lowest =
          active.length > 0
            ? [...active].sort(
                (a, b) => (a.atsScore ?? 0) - (b.atsScore ?? 0),
              )[0]
            : null;

        if (!cancelled) {
          setSummary({
            count: active.length,
            avgScore,
            lowestId: lowest?.id ?? null,
          });
        }
      } catch (error) {
        console.error("Failed to load dashboard header summary:", error);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isDashboardHome]);

  // Bridges this component (rendered in the layout) to the page below it
  // (a route sibling, not a child — there's no direct prop path) via a URL
  // query param. app/(app)/dashboard/page.tsx reads `?highlight=` on mount
  // and strips it back off once handled.
  const handleAtsClick = useCallback(() => {
    if (!summary?.lowestId) return;
    router.replace(`/dashboard?highlight=${summary.lowestId}`, {
      scroll: false,
    });
  }, [router, summary]);

  return (
    <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-gray-200">
      <div className="flex items-center justify-between px-6 lg:px-8 py-4">
        {/* Page Title */}
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900">
            Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Welcome back, {user?.firstName || "User"}
            {isDashboardHome && summary && (
              <>
                <span className="text-gray-300 mx-1.5">·</span>
                <span>
                  {summary.count} {summary.count === 1 ? "resume" : "resumes"}
                </span>
                {summary.avgScore !== null && (
                  <>
                    <span className="text-gray-300 mx-1.5">·</span>
                    <button
                      type="button"
                      onClick={handleAtsClick}
                      disabled={!summary.lowestId}
                      className="text-gray-500 hover:text-gray-800 underline decoration-dotted underline-offset-2 disabled:no-underline disabled:cursor-default cursor-pointer bg-transparent border-none p-0 font-inherit"
                    >
                      ATS avg {summary.avgScore}/100
                    </button>
                  </>
                )}
              </>
            )}
          </p>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          {/* Search Bar - Hidden on mobile */}
          {/* <div className="hidden md:flex items-center gap-2 bg-gray-100 rounded-xl px-4 py-2.5 w-80 hover:bg-gray-150 transition-colors group">
            <Search className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
            <input
              type="text"
              placeholder="Search resumes, templates..."
              className="bg-transparent border-none outline-none text-sm text-gray-700 placeholder-gray-400 w-full"
            />
            <kbd className="hidden lg:block px-2 py-1 text-xs font-semibold text-gray-500 bg-white border border-gray-300 rounded">
              ⌘K
            </kbd>
          </div> */}

          {/* Notifications */}
          <button className="relative p-2.5 rounded-xl hover:bg-gray-100 transition-colors group">
            <Bell className="w-5 h-5 text-gray-600 group-hover:text-gray-900 transition-colors" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
          </button>

          {/* User Avatar Dropdown */}
          <SignedIn>
            <ProfileMenu />
          </SignedIn>
        </div>
      </div>
    </header>
  );
}
