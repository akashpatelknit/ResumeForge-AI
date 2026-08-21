"use client";

import { useId } from "react";
import { formatDistanceToNow } from "date-fns";
import { Layers, PenTool, ListChecks, KeyRound, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReadinessScoreDetails } from "@/types/resume";

interface ReadinessScoreCardProps {
  result: ReadinessScoreDetails;
}

// Same band/gradient system as components/builder/ai/ATSScoreCard.tsx's
// ScoreGauge, duplicated rather than shared — that component's bands are
// keyed to "Match" language (Job Match Score semantics) which doesn't fit
// a JD-independent readiness score, and neither file imports from the
// other's private internals today.
const SCORE_BANDS = [
  { min: 85, label: "ATS Ready", from: "#22c55e", to: "#10b981", badge: "bg-green-50 text-green-700 ring-green-600/20" },
  { min: 70, label: "Mostly Ready", from: "#4f46e5", to: "#7c3aed", badge: "bg-indigo-50 text-indigo-700 ring-indigo-600/20" },
  { min: 50, label: "Needs Improvement", from: "#f59e0b", to: "#f97316", badge: "bg-amber-50 text-amber-700 ring-amber-600/20" },
  { min: 0, label: "Not ATS Ready", from: "#ef4444", to: "#ec4899", badge: "bg-rose-50 text-rose-700 ring-rose-600/20" },
] as const;

function getScoreBand(score: number) {
  return SCORE_BANDS.find((band) => score >= band.min) ?? SCORE_BANDS[SCORE_BANDS.length - 1];
}

function ScoreGauge({ score }: { score: number }) {
  const gradientId = useId();
  const band = getScoreBand(score);
  const size = 136;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative flex shrink-0 items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={band.from} />
            <stop offset="100%" stopColor={band.to} />
          </linearGradient>
        </defs>
        <circle cx={center} cy={center} r={radius} fill="none" stroke="#eef0f4" strokeWidth={strokeWidth} />
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1s cubic-bezier(0.34, 1.56, 0.64, 1)" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center leading-none">
        <span className="text-4xl font-bold tracking-tight text-gray-900 tabular-nums">{score}</span>
        <span className="mt-1 text-[11px] font-medium text-gray-400">out of 100</span>
      </div>
    </div>
  );
}

const BREAKDOWN_META: { key: keyof ReadinessScoreDetails["breakdown"]; label: string; icon: LucideIcon }[] = [
  { key: "structure", label: "Structure", icon: Layers },
  { key: "formatting", label: "Formatting", icon: PenTool },
  { key: "completeness", label: "Completeness", icon: ListChecks },
  { key: "keywordStrength", label: "Keyword Strength", icon: KeyRound },
];

function breakdownColor(score: number): string {
  if (score >= 85) return "#10b981";
  if (score >= 70) return "#4f46e5";
  if (score >= 50) return "#f59e0b";
  return "#ef4444";
}

export default function ReadinessScoreCard({ result }: ReadinessScoreCardProps) {
  const band = getScoreBand(result.score);

  return (
    <div className="flex flex-col gap-6">
      {/* Score */}
      <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div
          className="pointer-events-none absolute -top-12 -right-12 h-44 w-44 rounded-full opacity-[0.07] blur-2xl"
          style={{ background: `linear-gradient(135deg, ${band.from}, ${band.to})` }}
        />
        <div className="relative flex items-center gap-5">
          <ScoreGauge score={result.score} />
          <div className="min-w-0 flex-1">
            <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-gray-400">
              ATS Readiness Score
            </p>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset", band.badge)}>
                {band.label}
              </span>
            </div>
            <p className="mb-3 text-sm text-gray-500">
              How reliably an Applicant Tracking System can parse this resume — structure, formatting, and
              completeness, independent of any specific job posting.
            </p>
            {result.analyzedAt && (
              <p className="text-xs text-gray-400">
                Checked {formatDistanceToNow(new Date(result.analyzedAt), { addSuffix: true })}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Breakdown */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <p className="mb-3 text-sm font-bold text-gray-800">Category Breakdown</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {BREAKDOWN_META.map(({ key, label, icon: Icon }) => {
            const value = result.breakdown[key];
            const color = breakdownColor(value);
            return (
              <div key={key} className="rounded-xl bg-gray-50 p-3">
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-600">
                    <Icon className="h-3.5 w-3.5" style={{ color }} />
                    {label}
                  </span>
                  <span className="text-xs font-bold tabular-nums text-gray-800">{value}</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{ width: `${value}%`, backgroundColor: color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Suggestions */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-blue-600 to-purple-600 text-white">
            <Sparkles className="h-3.5 w-3.5" />
          </div>
          <h3 className="text-sm font-bold text-gray-800">Suggestions</h3>
        </div>
        {result.suggestions.length === 0 ? (
          <p className="text-sm text-gray-400">No specific suggestions — this resume is in good shape.</p>
        ) : (
          <ul className="space-y-2">
            {result.suggestions.map((suggestion, i) => (
              <li key={i} className="flex gap-2 text-sm leading-relaxed text-gray-600">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-gray-300" />
                {suggestion}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
