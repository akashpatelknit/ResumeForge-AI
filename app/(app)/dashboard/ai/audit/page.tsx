"use client";

import { useEffect, useState } from "react";
import {
  Linkedin,
  Sparkles,
  RefreshCw,
  Copy,
  CheckCircle,
  AlertCircle,
  FileText,
  ChevronDown,
  Wand2,
} from "lucide-react";
import { mapResumeFromDB } from "@/mapper/mapResumeFromDB";
import type { AppResume } from "@/types/resume";
import type { LinkedInAuditResult } from "@/lib/ai/generateLinkedInAudit";

function getScoreStyle(score: number) {
  if (score >= 85)
    return { ring: "#22c55e", badge: "bg-green-100 text-green-700", label: "Strong" };
  if (score >= 70)
    return { ring: "#3b82f6", badge: "bg-blue-100 text-blue-700", label: "Good" };
  if (score >= 50)
    return { ring: "#f59e0b", badge: "bg-amber-100 text-amber-700", label: "Fair" };
  return { ring: "#ef4444", badge: "bg-red-100 text-red-700", label: "Needs Work" };
}

function ScoreGauge({ score }: { score: number }) {
  const { ring } = getScoreStyle(score);
  const r = 40;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;

  return (
    <div className="relative flex items-center justify-center shrink-0" style={{ width: 100, height: 100 }}>
      <svg width="100" height="100" className="-rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={r} fill="none" stroke="#e5e7eb" strokeWidth="8" />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke={ring}
          strokeWidth="8"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1s ease" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center leading-none">
        <span className="text-xl font-bold text-gray-900">{score}</span>
        <span className="text-[10px] text-gray-400 font-medium mt-0.5">/ 100</span>
      </div>
    </div>
  );
}

function CopyBlock({ label, text }: { label: string; text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 pt-3 pb-2.5 border-b border-gray-100 bg-gray-50">
        <span className="text-xs font-bold text-gray-600 uppercase tracking-wide">
          {label}
        </span>
        <button
          onClick={handleCopy}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium transition-all cursor-pointer
            ${
              copied
                ? "border-green-200 bg-green-50 text-green-700"
                : "border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:text-gray-700"
            }`}
        >
          {copied ? <CheckCircle className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line p-4">
        {text}
      </p>
    </div>
  );
}

export default function LinkedInAuditPage() {
  const [headline, setHeadline] = useState("");
  const [aboutSection, setAboutSection] = useState("");

  const [useResumeContext, setUseResumeContext] = useState(false);
  const [resumes, setResumes] = useState<AppResume[]>([]);
  const [resumesLoading, setResumesLoading] = useState(true);
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
  const [showResumeDropdown, setShowResumeDropdown] = useState(false);

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [result, setResult] = useState<LinkedInAuditResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/resumes");
        const data = await res.json();
        if (!res.ok || !Array.isArray(data)) {
          throw new Error((data && data.error) || "Failed to load resumes");
        }
        if (cancelled) return;
        const mapped = data.map((r: unknown) =>
          mapResumeFromDB(r as Parameters<typeof mapResumeFromDB>[0]),
        );
        setResumes(mapped);
        setSelectedResumeId(mapped[0]?.id ?? null);
      } catch (err) {
        console.error("Failed to load resumes:", err);
      } finally {
        if (!cancelled) setResumesLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const selectedResume = resumes.find((r) => r.id === selectedResumeId) ?? null;
  const canAudit = (headline.trim() || aboutSection.trim()) && (!useResumeContext || !!selectedResume);
  const isRegenerating = status === "loading" && result !== null;

  const runAudit = async () => {
    if (!canAudit) return;
    setStatus("loading");
    setErrorMessage(null);

    try {
      const res = await fetch("/api/ai/audit-linkedin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          headline,
          aboutSection,
          resumeId: useResumeContext ? selectedResumeId : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Audit failed");

      setResult(data.result);
      setStatus("success");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Audit failed");
      setStatus("error");
    }
  };

  const scoreStyle = result ? getScoreStyle(result.headlineScore) : null;

  return (
    <div className="bg-gray-50 p-0">
      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-5 items-start">
        {/* ── LEFT PANEL ── */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-visible">
          <div className="p-5 border-b border-gray-100">
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Linkedin className="w-4 h-4 text-blue-600" />
              LinkedIn Profile Audit
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Paste your headline and About section for specific, actionable
              improvement suggestions.
            </p>
          </div>

          <div className="p-5 space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">
                Headline
              </label>
              <input
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="e.g. Full Stack Developer | React, Node.js, AWS"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all placeholder:text-gray-400"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">
                About Section
              </label>
              <textarea
                value={aboutSection}
                onChange={(e) => setAboutSection(e.target.value)}
                placeholder="Paste your LinkedIn About section here..."
                className="w-full h-40 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 resize-none outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all leading-relaxed placeholder:text-gray-400"
              />
            </div>

            <div className="border-t border-gray-100 pt-4">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-xs font-semibold text-gray-500">
                  Use my resume for context
                </span>
                <button
                  type="button"
                  onClick={() => setUseResumeContext((v) => !v)}
                  className={`relative w-9 h-5 rounded-full transition-colors cursor-pointer border-none ${
                    useResumeContext ? "bg-purple-600" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                      useResumeContext ? "translate-x-4" : ""
                    }`}
                  />
                </button>
              </label>

              {useResumeContext && (
                <div className="relative mt-3">
                  <button
                    onClick={() => setShowResumeDropdown(!showResumeDropdown)}
                    disabled={resumesLoading}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 flex items-center gap-3 cursor-pointer hover:border-purple-300 transition-colors text-left disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <FileText className="w-4 h-4 text-purple-600 shrink-0" />
                    <span className="flex-1 text-sm text-gray-700 font-medium truncate">
                      {resumesLoading
                        ? "Loading resumes..."
                        : (selectedResume?.title ?? "Select a resume")}
                    </span>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </button>

                  {showResumeDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-20 max-h-56 overflow-y-auto">
                      {resumes.map((r) => (
                        <button
                          key={r.id}
                          onClick={() => {
                            setSelectedResumeId(r.id);
                            setShowResumeDropdown(false);
                          }}
                          className={`w-full px-4 py-2.5 flex items-center gap-3 text-left text-sm cursor-pointer border-none transition-colors
                            ${
                              selectedResumeId === r.id
                                ? "bg-purple-50 text-purple-700"
                                : "bg-white text-gray-700 hover:bg-gray-50"
                            }`}
                        >
                          <FileText className="w-4 h-4 shrink-0" />
                          {r.title}
                        </button>
                      ))}
                    </div>
                  )}
                  {!resumesLoading && resumes.length === 0 && (
                    <p className="text-xs text-amber-600 mt-2">
                      No saved resumes yet — create one to use this.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="px-5 pb-5">
            <button
              onClick={runAudit}
              disabled={!canAudit || status === "loading"}
              className={`w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2.5 transition-all border-none
                ${
                  !canAudit || status === "loading"
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-linear-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-200 hover:shadow-xl hover:shadow-purple-300 hover:-translate-y-0.5 cursor-pointer"
                }`}
            >
              {status === "loading" ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  {isRegenerating ? "Re-auditing..." : "Auditing..."}
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Audit Profile
                </>
              )}
            </button>
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          {status === "error" && !result ? (
            <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center">
                <AlertCircle className="w-7 h-7 text-red-500" />
              </div>
              <p className="text-base font-semibold text-gray-800">Audit failed</p>
              <p className="text-sm text-gray-400 max-w-xs">{errorMessage}</p>
              <button
                onClick={runAudit}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-100 text-gray-700 text-sm font-semibold hover:bg-gray-200 transition-all cursor-pointer border-none"
              >
                <RefreshCw className="w-4 h-4" />
                Retry
              </button>
            </div>
          ) : !result ? (
            <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center">
                <Wand2 className="w-7 h-7 text-purple-500" />
              </div>
              <div>
                <p className="text-base font-semibold text-gray-800 mb-1">
                  Ready to audit your profile
                </p>
                <p className="text-sm text-gray-400 max-w-xs mx-auto leading-relaxed">
                  Paste your headline and/or About section on the left and
                  click Audit Profile.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {status === "error" && (
                <div className="flex items-center gap-2 text-xs text-red-600">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {errorMessage} — showing the last successful result.
                </div>
              )}

              {/* Headline Score */}
              <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                <div className="flex items-center gap-4">
                  <ScoreGauge score={result.headlineScore} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <h3 className="text-base font-bold text-gray-900">Headline Score</h3>
                      {scoreStyle && (
                        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${scoreStyle.badge}`}>
                          {scoreStyle.label}
                        </span>
                      )}
                    </div>
                    <ul className="space-y-1.5">
                      {result.headlineSuggestions.map((s, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                          <span className="text-purple-400 mt-0.5 shrink-0">•</span>
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* About Suggestions */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-4 pt-3 pb-2.5 border-b border-gray-100 bg-gray-50">
                  <span className="text-xs font-bold text-gray-600 uppercase tracking-wide">
                    About Section Suggestions
                  </span>
                </div>
                <ul className="divide-y divide-gray-50">
                  {result.aboutSuggestions.map((s, i) => (
                    <li key={i} className="flex items-start gap-3 px-4 py-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 shrink-0" />
                      <p className="text-sm text-gray-600 flex-1 leading-relaxed">{s}</p>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Missing Keywords */}
              {result.missingKeywords.length > 0 && (
                <div className="bg-white rounded-xl border border-amber-200 shadow-sm overflow-hidden">
                  <div className="px-4 pt-3 pb-2.5 border-b border-amber-100 bg-amber-50">
                    <span className="text-xs font-bold text-amber-700 uppercase tracking-wide">
                      Missing Keywords (from your resume)
                    </span>
                  </div>
                  <div className="p-3 flex flex-wrap gap-1.5">
                    {result.missingKeywords.map((kw) => (
                      <span
                        key={kw}
                        className="text-xs font-medium px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Rewritten examples */}
              {result.rewrittenHeadline && (
                <CopyBlock label="Rewritten Headline" text={result.rewrittenHeadline} />
              )}
              {result.rewrittenAbout && (
                <CopyBlock label="Rewritten About" text={result.rewrittenAbout} />
              )}

              {/* Re-audit */}
              <div className="flex justify-end pt-1">
                <button
                  onClick={runAudit}
                  disabled={status === "loading"}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-gray-200 bg-white text-gray-500 text-xs font-medium hover:border-gray-300 hover:text-gray-700 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${status === "loading" ? "animate-spin" : ""}`} />
                  {status === "loading" ? "Re-auditing..." : "Re-audit"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
