"use client";

import {
  Sparkles,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import type { AnalyzeJdResult } from "@/lib/ai/generateAnalyzeJd";

interface ATSScoreCardProps {
  result: AnalyzeJdResult;
  previousScore?: number | null;
  onRegenerate: () => void;
  isRegenerating?: boolean;
}

function getScoreStyle(score: number) {
  if (score >= 85)
    return { ring: "#22c55e", badge: "bg-green-100 text-green-700", label: "Excellent Match" };
  if (score >= 70)
    return { ring: "#3b82f6", badge: "bg-blue-100 text-blue-700", label: "Good Match" };
  if (score >= 50)
    return { ring: "#f59e0b", badge: "bg-amber-100 text-amber-700", label: "Fair Match" };
  return { ring: "#ef4444", badge: "bg-red-100 text-red-700", label: "Needs Work" };
}

function ScoreGauge({ score }: { score: number }) {
  const { ring } = getScoreStyle(score);
  const r = 48;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;

  return (
    <div className="relative flex items-center justify-center shrink-0" style={{ width: 120, height: 120 }}>
      <svg width="120" height="120" className="-rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={r} fill="none" stroke="#e5e7eb" strokeWidth="9" />
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke={ring}
          strokeWidth="9"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1s ease" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center leading-none">
        <span className="text-2xl font-bold text-gray-900">{score}</span>
        <span className="text-[11px] text-gray-400 font-medium mt-0.5">/ 100</span>
      </div>
    </div>
  );
}

export default function ATSScoreCard({
  result,
  previousScore,
  onRegenerate,
  isRegenerating = false,
}: ATSScoreCardProps) {
  const scoreStyle = getScoreStyle(result.score);
  const delta =
    typeof previousScore === "number" ? result.score - previousScore : null;

  return (
    <div className="flex flex-col gap-4">
      {/* Score */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <div className="flex items-center gap-4">
          <ScoreGauge score={result.score} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h3 className="text-base font-bold text-gray-900">Match Score</h3>
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${scoreStyle.badge}`}>
                {scoreStyle.label}
              </span>
              {delta !== null && delta !== 0 && (
                <span
                  className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                    delta > 0
                      ? "bg-green-50 text-green-700"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  {delta > 0 ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {delta > 0 ? "+" : ""}
                  {delta} since last check
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mb-3">
              {result.missingKeywords.length > 0
                ? "Close the keyword gap below to improve your score."
                : "Your resume covers the keywords this job description asks for."}
            </p>
            <div className="w-full bg-gray-100 rounded-full h-1.5">
              <div
                className="h-1.5 rounded-full transition-all duration-1000"
                style={{ width: `${result.score}%`, backgroundColor: scoreStyle.ring }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Keywords */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="bg-white rounded-xl border border-green-200 shadow-sm overflow-hidden">
          <div className="px-4 pt-3 pb-2.5 border-b border-green-100 bg-green-50">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
              <span className="text-xs font-bold text-green-700 uppercase tracking-wide">
                Matched Keywords
              </span>
            </div>
          </div>
          <div className="p-3 flex flex-wrap gap-1.5">
            {result.matchedKeywords.length === 0 ? (
              <span className="text-xs text-gray-400 px-1 py-1">None found</span>
            ) : (
              result.matchedKeywords.map((kw) => (
                <span
                  key={kw}
                  className="text-xs font-medium px-2.5 py-1 rounded-full bg-green-50 text-green-700 border border-green-200"
                >
                  {kw}
                </span>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-amber-200 shadow-sm overflow-hidden">
          <div className="px-4 pt-3 pb-2.5 border-b border-amber-100 bg-amber-50">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
              <span className="text-xs font-bold text-amber-700 uppercase tracking-wide">
                Missing Keywords
              </span>
            </div>
          </div>
          <div className="p-3 flex flex-wrap gap-1.5">
            {result.missingKeywords.length === 0 ? (
              <span className="text-xs text-gray-400 px-1 py-1">None — nice work</span>
            ) : (
              result.missingKeywords.map((kw) => (
                <span
                  key={kw}
                  className="text-xs font-medium px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200"
                >
                  {kw}
                </span>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Suggestions */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-4 pt-4 pb-3 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-linear-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-sm shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          <h3 className="text-sm font-bold text-gray-800">Suggestions</h3>
        </div>
        {result.suggestions.length === 0 ? (
          <p className="text-sm text-gray-400 px-4 py-4">
            No specific suggestions — this resume already covers the job description well.
          </p>
        ) : (
          <ul className="divide-y divide-gray-50">
            {result.suggestions.map((s, i) => (
              <li key={i} className="flex items-start gap-3 px-4 py-3">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 shrink-0" />
                <p className="text-sm text-gray-600 flex-1 leading-relaxed">{s}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Regenerate */}
      <div className="flex justify-end pb-1">
        <button
          onClick={onRegenerate}
          disabled={isRegenerating}
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-gray-200 bg-white text-gray-600 text-sm font-medium hover:border-gray-300 hover:bg-gray-50 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`w-4 h-4 ${isRegenerating ? "animate-spin" : ""}`} />
          {isRegenerating ? "Re-analyzing..." : "Re-analyze"}
        </button>
      </div>
    </div>
  );
}
