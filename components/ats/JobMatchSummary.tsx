"use client";

import { CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AnalyzeJdResult } from "@/lib/ai/generateAnalyzeJd";

interface JobMatchSummaryProps {
  result: AnalyzeJdResult;
}

// A compact, read-only view of the existing Job Match Score analysis
// (lib/ai/generateAnalyzeJd.ts / app/api/ai/analyze-jd/route.ts) for the
// standalone ATS Checker page — shown alongside the Readiness Score when a
// job description is provided, clearly labeled as a separate number.
// Deliberately NOT components/builder/ai/ATSScoreCard.tsx: that component's
// suggestion "Apply"/"Skip" actions write directly into the resume builder
// store (useResumeStore), which doesn't make sense here — the checker also
// runs against externally uploaded PDFs with no resume record to mutate,
// and even for a saved resume this page isn't the builder's edit surface.
function getBand(score: number) {
  if (score >= 85) return { label: "Excellent Match", className: "bg-green-50 text-green-700 ring-green-600/20" };
  if (score >= 70) return { label: "Good Match", className: "bg-indigo-50 text-indigo-700 ring-indigo-600/20" };
  if (score >= 50) return { label: "Fair Match", className: "bg-amber-50 text-amber-700 ring-amber-600/20" };
  return { label: "Needs Work", className: "bg-rose-50 text-rose-700 ring-rose-600/20" };
}

export default function JobMatchSummary({ result }: JobMatchSummaryProps) {
  const band = getBand(result.score);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Job Match Score</p>
          <p className="mt-0.5 text-xs text-gray-400">
            How well this resume matches the job description you pasted — a separate number from the Readiness
            Score above.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="text-2xl font-bold tabular-nums text-gray-900">{result.score}</span>
          <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset", band.className)}>
            {band.label}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-gray-600">
            <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
            Matched Keywords
          </p>
          <div className="flex flex-wrap gap-1.5">
            {result.matchedKeywords.length === 0 ? (
              <span className="text-xs text-gray-400">None found</span>
            ) : (
              result.matchedKeywords.map((kw) => (
                <span
                  key={kw}
                  className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/10"
                >
                  {kw}
                </span>
              ))
            )}
          </div>
        </div>
        <div>
          <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-gray-600">
            <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
            Missing Keywords
          </p>
          <div className="flex flex-wrap gap-1.5">
            {result.missingKeywords.length === 0 ? (
              <span className="text-xs text-gray-400">None — nice work</span>
            ) : (
              result.missingKeywords.map((kw) => (
                <span
                  key={kw}
                  className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/10"
                >
                  {kw}
                </span>
              ))
            )}
          </div>
        </div>
      </div>

      {result.suggestions.length > 0 && (
        <div className="mt-4 border-t border-gray-100 pt-3">
          <p className="mb-2 text-xs font-semibold text-gray-600">
            Suggestions ({result.suggestions.length}) — open this resume in the builder to apply them
          </p>
          <ul className="space-y-1.5">
            {result.suggestions.map((s) => (
              <li key={s.id} className="flex gap-2 text-xs leading-relaxed text-gray-500">
                <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-gray-300" />
                {s.reason || s.suggestedValue}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
