"use client";

import { useState, type MouseEvent } from "react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { Gauge, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import type { AppResume, ReadinessScoreDetails } from "@/types/resume";

export const getScoreColor = (score: number) => {
  if (score >= 85) return "text-green-600 bg-green-100";
  if (score >= 70) return "text-blue-600 bg-blue-100";
  return "text-yellow-600 bg-yellow-100";
};

export const getScoreLabel = (score: number) => {
  if (score >= 85) return "Excellent";
  if (score >= 70) return "Good";
  return "Fair";
};

// ATS Readiness Score cell — distinct from the JD Match Score, this column
// reads directly off Resume.readinessScore (see prisma/schema.prisma). null
// means "never checked" and renders as a muted "N/A" plus an inline action
// to check it right from the table, per an explicit "no batch scoring"
// requirement — every check is a deliberate, single-resume action.
//
// Shared between the Dashboard's Recent Resumes table
// (components/dashboard/RecentResumes.tsx) and the full My Resumes list
// (components/dashboard/ResumeList.tsx) — extracted here rather than
// duplicated so both surfaces can never drift on how this column behaves.
export function AtsScoreCell({
  resume,
  onChecked,
  compact,
}: {
  resume: AppResume;
  onChecked?: (resumeId: string, result: ReadinessScoreDetails) => void;
  compact?: boolean;
}) {
  const [isChecking, setIsChecking] = useState(false);
  const score = resume.readinessScore;
  const details = resume.readinessScoreDetails;

  const handleCheck = async (e: MouseEvent) => {
    e.stopPropagation();
    if (isChecking) return;
    setIsChecking(true);
    try {
      const res = await fetch("/api/ats/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeId: resume.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Failed to check ATS score.");
        return;
      }
      onChecked?.(resume.id, data.result as ReadinessScoreDetails);
    } catch (error) {
      console.error("Failed to check ATS readiness score:", error);
      toast.error("Network error — please try again.");
    } finally {
      setIsChecking(false);
    }
  };

  if (score === null || score === undefined) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-400">N/A</span>
        <button
          type="button"
          onClick={handleCheck}
          disabled={isChecking}
          title="Check ATS Score"
          aria-label="Check ATS Score"
          className="flex shrink-0 cursor-pointer items-center gap-1 rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs font-medium text-gray-600 transition-colors hover:border-purple-200 hover:bg-purple-50 hover:text-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isChecking ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Gauge className="h-3.5 w-3.5" />}
          {!compact && (isChecking ? "Checking..." : "Check")}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-gray-900">{score}/100</span>
        <Badge className={`text-xs px-2 py-0 ${getScoreColor(score)}`}>{getScoreLabel(score)}</Badge>
      </div>
      <Progress value={score} className="h-1.5" />
      {details?.analyzedAt && (
        <p className="text-xs text-gray-400">
          Checked {formatDistanceToNow(new Date(details.analyzedAt), { addSuffix: true })}
        </p>
      )}
    </div>
  );
}
