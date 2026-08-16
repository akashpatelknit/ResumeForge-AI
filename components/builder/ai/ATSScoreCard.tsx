"use client";

import { useId, useState } from "react";
import { toast } from "sonner";
import {
  Sparkles,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  AlertCircle,
  Plus,
  Check,
  Wand2,
  PenLine,
  FilePlus2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AnalyzeJdResult, AtsSuggestion } from "@/lib/ai/generateAnalyzeJd";
import type { ApplySuggestionResult } from "@/lib/ats/applySuggestion";

interface ATSScoreCardProps {
  result: AnalyzeJdResult;
  previousScore?: number | null;
  onRegenerate: () => void;
  isRegenerating?: boolean;
  // Performs the actual resume mutation (via the Zustand store, see
  // JobDescriptionAnalyzer.tsx) and reports back whether it succeeded —
  // this component only owns which suggestions are shown as
  // applied/dismissed, never the write itself.
  onApplySuggestion: (suggestion: AtsSuggestion) => ApplySuggestionResult;
}

// Every band gets its own two-stop gradient rather than one flat hex —
// "Good Match" (the most common outcome) leans directly on the brand
// purple→blue pair, and "Needs Work" closes on brand pink, so the gauge
// reads as this product's even when the score is bad. The red/amber/green
// *meaning* is untouched — only how each band is rendered changed.
const SCORE_BANDS = [
  {
    min: 85,
    label: "Excellent Match",
    from: "#22c55e",
    to: "#10b981",
    badge: "bg-green-50 text-green-700 ring-green-600/20",
  },
  {
    min: 70,
    label: "Good Match",
    from: "#4f46e5",
    to: "#7c3aed",
    badge: "bg-indigo-50 text-indigo-700 ring-indigo-600/20",
  },
  {
    min: 50,
    label: "Fair Match",
    from: "#f59e0b",
    to: "#f97316",
    badge: "bg-amber-50 text-amber-700 ring-amber-600/20",
  },
  {
    min: 0,
    label: "Needs Work",
    from: "#ef4444",
    to: "#ec4899",
    badge: "bg-rose-50 text-rose-700 ring-rose-600/20",
  },
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

function SectionEyebrow({ icon: Icon, tone, children }: { icon: LucideIcon; tone: string; children: React.ReactNode }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <div className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-lg", tone)}>
        <Icon className="h-3.5 w-3.5" />
      </div>
      <h3 className="text-sm font-bold text-gray-800">{children}</h3>
    </div>
  );
}

const SUGGESTION_META: Record<AtsSuggestion["type"], { label: string; icon: LucideIcon; tone: string }> = {
  add_skill: { label: "Add skill", icon: Wand2, tone: "bg-purple-50 text-purple-600 ring-purple-600/15" },
  rewrite_bullet: { label: "Rewrite bullet", icon: PenLine, tone: "bg-blue-50 text-blue-600 ring-blue-600/15" },
  add_bullet: { label: "Add bullet", icon: FilePlus2, tone: "bg-pink-50 text-pink-600 ring-pink-600/15" },
};

function SuggestionCard({
  suggestion,
  isApplied,
  onApply,
  onSkip,
}: {
  suggestion: AtsSuggestion;
  isApplied: boolean;
  onApply: () => void;
  onSkip: () => void;
}) {
  const meta = SUGGESTION_META[suggestion.type];
  const Icon = meta.icon;

  return (
    <div
      className={cn(
        "rounded-2xl border p-4 transition-all",
        isApplied ? "border-green-200 bg-green-50/40" : "border-gray-200 bg-white shadow-sm hover:border-gray-300 hover:shadow-md",
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ring-1 ring-inset", meta.tone)}>
          <Icon className="h-4 w-4" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wide text-gray-400">{meta.label}</span>
            {isApplied && (
              <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-green-600">
                <Check className="h-3.5 w-3.5" />
                Applied
              </span>
            )}
          </div>

          <p className="mt-0.5 text-sm leading-relaxed text-gray-600">{suggestion.reason}</p>

          {suggestion.type === "add_skill" && (
            <div className="mt-2.5 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-purple-50 px-2.5 py-1 text-xs font-semibold text-purple-700 ring-1 ring-inset ring-purple-600/15">
                {suggestion.suggestedValue}
              </span>
              {suggestion.targetCategory && (
                <span className="text-xs text-gray-400">→ {suggestion.targetCategory}</span>
              )}
            </div>
          )}

          {suggestion.type === "rewrite_bullet" && (
            <div className="mt-2.5 space-y-1.5 rounded-xl bg-gray-50 p-3 text-xs leading-relaxed">
              {suggestion.currentValue && (
                <p className="flex gap-1.5 text-gray-400">
                  <span className="shrink-0 font-semibold">−</span>
                  <span className="line-through decoration-gray-300">{suggestion.currentValue}</span>
                </p>
              )}
              <p className="flex gap-1.5 text-gray-800">
                <span className="shrink-0 font-semibold text-green-600">+</span>
                <span className="font-medium">{suggestion.suggestedValue}</span>
              </p>
            </div>
          )}

          {suggestion.type === "add_bullet" && (
            <div className="mt-2.5 rounded-xl bg-gray-50 p-3 text-xs leading-relaxed">
              <p className="flex gap-1.5 text-gray-800">
                <span className="shrink-0 font-semibold text-green-600">+</span>
                <span className="font-medium">{suggestion.suggestedValue}</span>
              </p>
            </div>
          )}

          {!isApplied && (
            <div className="mt-3">
              {suggestion.type === "add_skill" ? (
                <button
                  onClick={onApply}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-linear-to-r from-purple-600 to-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm shadow-purple-900/10 transition-all hover:from-purple-700 hover:to-blue-700 hover:shadow-md cursor-pointer border-none"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add{suggestion.targetCategory ? ` to ${suggestion.targetCategory}` : ""}
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={onSkip}
                    className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-50 cursor-pointer"
                  >
                    Skip
                  </button>
                  <button
                    onClick={onApply}
                    className="flex-1 rounded-lg bg-linear-to-r from-purple-600 to-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm shadow-purple-900/10 transition-all hover:from-purple-700 hover:to-blue-700 hover:shadow-md cursor-pointer border-none"
                  >
                    Apply
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ATSScoreCard({
  result,
  previousScore,
  onRegenerate,
  isRegenerating = false,
  onApplySuggestion,
}: ATSScoreCardProps) {
  const band = getScoreBand(result.score);
  const delta =
    typeof previousScore === "number" ? result.score - previousScore : null;

  // Local, and deliberately not reset explicitly on re-analysis: a fresh
  // `result` carries fresh suggestion ids (see generateAnalyzeJd.ts), so
  // old applied/dismissed ids simply never match anything in the new list.
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  const handleApply = (suggestion: AtsSuggestion) => {
    const outcome = onApplySuggestion(suggestion);
    if (outcome.ok) {
      setAppliedIds((prev) => new Set(prev).add(suggestion.id));
    } else {
      toast.error(outcome.message);
    }
  };

  const handleSkip = (id: string) => {
    setDismissedIds((prev) => new Set(prev).add(id));
  };

  const visibleSuggestions = result.suggestions.filter((s) => !dismissedIds.has(s.id));
  const hasAppliedThisSession = appliedIds.size > 0;

  return (
    <div className="flex flex-col gap-6">
      {hasAppliedThisSession && (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-purple-100 bg-linear-to-r from-purple-50 via-blue-50 to-pink-50 px-4 py-3">
          <p className="text-sm font-medium text-gray-700">
            You&apos;ve applied {appliedIds.size} suggestion{appliedIds.size === 1 ? "" : "s"} — re-analyze to
            see your updated score.
          </p>
          <button
            onClick={onRegenerate}
            disabled={isRegenerating}
            className="flex shrink-0 items-center gap-2 rounded-lg bg-linear-to-r from-purple-600 to-blue-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm shadow-purple-900/10 transition-all hover:from-purple-700 hover:to-blue-700 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer border-none"
          >
            <RefreshCw className={cn("h-4 w-4", isRegenerating && "animate-spin")} />
            {isRegenerating ? "Re-analyzing..." : "Re-analyze"}
          </button>
        </div>
      )}

      {/* Score */}
      <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div
          className="pointer-events-none absolute -top-12 -right-12 h-44 w-44 rounded-full opacity-[0.07] blur-2xl"
          style={{ background: `linear-gradient(135deg, ${band.from}, ${band.to})` }}
        />
        <div className="relative flex items-center gap-5">
          <ScoreGauge score={result.score} />
          <div className="min-w-0 flex-1">
            <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-gray-400">Match Score</p>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset", band.badge)}>
                {band.label}
              </span>
              {delta !== null && delta !== 0 && (
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
                    delta > 0 ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700",
                  )}
                >
                  {delta > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {delta > 0 ? "+" : ""}
                  {delta} since last check
                </span>
              )}
            </div>
            <p className="mb-3 text-sm text-gray-500">
              {result.missingKeywords.length > 0
                ? "Close the keyword gap below to improve your score."
                : "Your resume covers the keywords this job description asks for."}
            </p>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{ width: `${result.score}%`, background: `linear-gradient(90deg, ${band.from}, ${band.to})` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Keywords */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <SectionEyebrow icon={CheckCircle2} tone="bg-green-50 text-green-600">
            Matched Keywords
          </SectionEyebrow>
          <div className="flex flex-wrap gap-1.5">
            {result.matchedKeywords.length === 0 ? (
              <span className="px-1 py-1 text-xs text-gray-400">None found</span>
            ) : (
              result.matchedKeywords.map((kw) => (
                <span
                  key={kw}
                  className="whitespace-nowrap rounded-full bg-linear-to-b from-green-50 to-emerald-100/60 px-2.5 py-1 text-xs font-medium text-green-700 shadow-xs ring-1 ring-inset ring-green-600/10"
                >
                  {kw}
                </span>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <SectionEyebrow icon={AlertCircle} tone="bg-amber-50 text-amber-600">
            Missing Keywords
          </SectionEyebrow>
          <div className="flex flex-wrap items-center gap-1.5">
            {result.missingKeywords.length === 0 ? (
              <span className="px-1 py-1 text-xs text-gray-400">None — nice work</span>
            ) : (
              // The prompt orders these most-important-first (see
              // buildAnalyzeJdPrompt.ts) — that order is the only signal of
              // relevance the data carries, so the first few get a bolder,
              // larger treatment to visually rank them above the rest.
              result.missingKeywords.map((kw, i) => {
                const isPriority = i < Math.min(3, result.missingKeywords.length);
                return (
                  <span
                    key={kw}
                    className={cn(
                      "whitespace-nowrap rounded-full font-medium shadow-xs ring-1 ring-inset",
                      isPriority
                        ? "bg-linear-to-b from-amber-50 to-orange-100/70 px-3 py-1.5 text-sm text-amber-800 ring-amber-600/15"
                        : "bg-amber-50/70 px-2.5 py-1 text-xs text-amber-700 ring-amber-600/10",
                    )}
                  >
                    {kw}
                  </span>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Suggestions */}
      <div>
        <SectionEyebrow icon={Sparkles} tone="bg-linear-to-br from-blue-600 to-purple-600 text-white">
          Suggestions
        </SectionEyebrow>

        {visibleSuggestions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 px-4 py-6 text-center">
            <p className="text-sm text-gray-400">
              {result.suggestions.length === 0
                ? "No specific suggestions — this resume already covers the job description well."
                : "No suggestions left — you've applied or skipped them all."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {visibleSuggestions.map((suggestion) => (
              <SuggestionCard
                key={suggestion.id}
                suggestion={suggestion}
                isApplied={appliedIds.has(suggestion.id)}
                onApply={() => handleApply(suggestion)}
                onSkip={() => handleSkip(suggestion.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Regenerate */}
      <div className="flex justify-end pb-1">
        <button
          onClick={onRegenerate}
          disabled={isRegenerating}
          className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-600 transition-all hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={cn("h-4 w-4", isRegenerating && "animate-spin")} />
          {isRegenerating ? "Re-analyzing..." : "Re-analyze"}
        </button>
      </div>
    </div>
  );
}
