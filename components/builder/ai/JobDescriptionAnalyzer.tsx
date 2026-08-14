"use client";

import { useState } from "react";
import { Sparkles, BarChart2, AlertCircle, RefreshCw } from "lucide-react";
import ATSScoreCard from "./ATSScoreCard";
import type { AnalyzeJdResult } from "@/lib/ai/generateAnalyzeJd";

interface JobDescriptionAnalyzerProps {
  // The resume to analyze against — the real currently-selected/open resume,
  // never sample data. `null` means no resume is available yet (still
  // loading, or the user has none) — the Analyze button stays disabled.
  resumeId: string | null;
  // "split": JD input and results side-by-side (dashboard page).
  // "stack": input above results, single column (builder side panel).
  layout?: "split" | "stack";
}

const CHAR_LIMIT = 5000;

export default function JobDescriptionAnalyzer({
  resumeId,
  layout = "split",
}: JobDescriptionAnalyzerProps) {
  const [jobDescription, setJobDescription] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [result, setResult] = useState<AnalyzeJdResult | null>(null);
  const [previousScore, setPreviousScore] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canAnalyze = !!resumeId && jobDescription.trim().length > 0;
  const isRegenerating = status === "loading" && result !== null;

  const runAnalysis = async () => {
    if (!resumeId || !jobDescription.trim()) return;

    setStatus("loading");
    setError(null);

    try {
      const res = await fetch("/api/ai/analyze-jd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeId, jobDescription }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Analysis failed");
      }

      setResult(data.result);
      setPreviousScore(data.previousScore ?? null);
      setStatus("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
      setStatus("error");
    }
  };

  const inputPanel = (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-col flex-1">
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
          Job Description
        </label>
        <span
          className={`text-xs font-mono ${
            jobDescription.length > CHAR_LIMIT * 0.9
              ? "text-red-400"
              : "text-gray-400"
          }`}
        >
          {jobDescription.length.toLocaleString()} / {CHAR_LIMIT.toLocaleString()}
        </span>
      </div>

      <textarea
        value={jobDescription}
        onChange={(e) => setJobDescription(e.target.value.slice(0, CHAR_LIMIT))}
        placeholder={
          "Paste the job description here...\n\ne.g. We are looking for a Senior Software Engineer with 5+ years of experience in React, TypeScript, and Node.js..."
        }
        className="flex-1 min-h-[220px] resize-none bg-gray-50 rounded-lg border border-gray-200 p-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent leading-relaxed"
      />

      {!resumeId && (
        <p className="mt-2 text-xs text-amber-600 flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          Select a resume to analyze.
        </p>
      )}

      <button
        onClick={runAnalysis}
        disabled={!canAnalyze || status === "loading"}
        className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-linear-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold shadow-md shadow-blue-200 hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-md cursor-pointer border-none"
      >
        {status === "loading" ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin" />
            {isRegenerating ? "Re-analyzing..." : "Analyzing..."}
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            Analyze Job
          </>
        )}
      </button>
    </div>
  );

  const resultsPanel = (() => {
    if (status === "error" && !result) {
      return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm h-full flex flex-col items-center justify-center text-center px-8 py-16 gap-3">
          <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-red-500" />
          </div>
          <p className="text-sm font-semibold text-gray-800">
            Analysis failed
          </p>
          <p className="text-xs text-gray-500 max-w-xs">{error}</p>
          <button
            onClick={runAnalysis}
            className="mt-1 flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm font-semibold hover:bg-gray-200 transition-all cursor-pointer border-none"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      );
    }

    if (!result) {
      return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm h-full flex flex-col items-center justify-center text-center px-8 py-16 gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center">
              <BarChart2 className="w-7 h-7 text-blue-400" />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-linear-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-md shadow-blue-200">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-1">
              Ready to Analyze
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed max-w-xs">
              Paste a job description and click{" "}
              <span className="font-semibold text-blue-600">Analyze Job</span>{" "}
              to get your match report.
            </p>
          </div>
        </div>
      );
    }

    return (
      <>
        {status === "error" && (
          <div className="mb-3 flex items-center gap-2 text-xs text-red-600">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            {error} — showing the last successful result.
          </div>
        )}
        <ATSScoreCard
          result={result}
          previousScore={previousScore}
          onRegenerate={runAnalysis}
          isRegenerating={isRegenerating}
        />
      </>
    );
  })();

  if (layout === "stack") {
    return (
      <div className="flex flex-col gap-4">
        {inputPanel}
        {resultsPanel}
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:grid lg:grid-cols-2 gap-4 lg:gap-6 lg:items-start">
      <div className="flex flex-col lg:sticky lg:top-4">{inputPanel}</div>
      <div>{resultsPanel}</div>
    </div>
  );
}
