"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import QuickActions from "@/components/dashboard/QuickActions";
import RecentResumes from "@/components/dashboard/RecentResumes";
import AIInsights from "@/components/dashboard/AIInsights";
import OutreachActivity from "@/components/dashboard/OutreachActivity";
import { mapResumeFromDB } from "@/mapper/mapResumeFromDB";
import type { AppResume, ReadinessScoreDetails } from "@/types/resume";

// Bridges the ATS-avg click in components/shared/DashboardHeader.tsx (a
// layout-level sibling of this page, not a parent/child — no direct prop
// path exists) to this page's scroll+highlight behavior via a `?highlight=`
// query param. Reading useSearchParams() requires a Suspense boundary.
function HighlightFromQueryParam({
  resumes,
  isLoading,
  onHighlight,
}: {
  resumes: AppResume[];
  isLoading: boolean;
  onHighlight: (id: string) => void;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    // Wait for resumes to finish loading before deciding anything — acting
    // while `resumes` is still [] would strip the param before it could
    // ever match.
    if (isLoading) return;

    const highlight = searchParams.get("highlight");
    if (!highlight) return;

    if (resumes.some((r) => r.id === highlight)) {
      onHighlight(highlight);
    }
    router.replace("/dashboard", { scroll: false });
  }, [searchParams, resumes, isLoading, router, onHighlight]);

  return null;
}

export default function DashboardPage() {
  const [resumes, setResumes] = useState<AppResume[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [highlightResumeId, setHighlightResumeId] = useState<string | null>(null);

  const loadResumes = useCallback(async () => {
    try {
      const res = await fetch("/api/resumes");
      const data = await res.json();
      if (!res.ok || !Array.isArray(data)) {
        throw new Error((data && data.error) || "Failed to load resumes");
      }
      setResumes(
        data.map((r: unknown) =>
          mapResumeFromDB(r as Parameters<typeof mapResumeFromDB>[0]),
        ),
      );
    } catch (error) {
      console.error("Failed to load resumes:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadResumes();
  }, [loadResumes]);

  // Archived resumes are hidden from the resumes list by default elsewhere
  // in the app (see app/(app)/dashboard/resumes/page.tsx) — the dashboard's
  // recommendations follow the same rule so they don't get skewed by
  // resumes the user has already set aside.
  const active = resumes.filter((r) => !r.isArchived);

  // Updates a single resume's readiness score in place after a per-row
  // "Check ATS Score" action in RecentResumes succeeds — avoids a full
  // refetch just to reflect the N/A -> checked-value transition.
  const handleReadinessScoreChecked = useCallback((resumeId: string, result: ReadinessScoreDetails) => {
    setResumes((prev) =>
      prev.map((r) =>
        r.id === resumeId ? { ...r, readinessScore: result.score, readinessScoreDetails: result } : r,
      ),
    );
  }, []);

  const handleHighlight = useCallback((id: string) => {
    setHighlightResumeId(id);
    document
      .getElementById(`resume-row-${id}`)
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
    // Clear after a moment so the highlight reads as a pointer, not a
    // permanent state.
    setTimeout(() => setHighlightResumeId(null), 2500);
  }, []);

  return (
    <>
      <Suspense fallback={null}>
        <HighlightFromQueryParam
          resumes={active}
          isLoading={isLoading}
          onHighlight={handleHighlight}
        />
      </Suspense>

      {/* The 4 stat cards (Total Resumes, Total Downloads, ATS Score
          Average, AI Optimizations) were removed — resume count and ATS
          average now live as a compact inline line in the header itself
          (components/shared/DashboardHeader.tsx), and Total
          Downloads/AI Optimizations were dropped entirely (they were
          hardcoded vanity numbers with no real data source). Quick Actions
          now sits first since there's no card grid above it anymore. */}
      <div className="mb-4">
        <QuickActions />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-8">
          <RecentResumes
            resumes={active}
            isLoading={isLoading}
            highlightResumeId={highlightResumeId}
            onRefresh={loadResumes}
            onReadinessScoreChecked={handleReadinessScoreChecked}
          />
        </div>

        <div className="space-y-4">
          <OutreachActivity />
          <AIInsights resumes={active} isLoading={isLoading} />
        </div>
      </div>
    </>
  );
}
