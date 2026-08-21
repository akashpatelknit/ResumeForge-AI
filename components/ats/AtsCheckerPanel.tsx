"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  FileText,
  Gauge,
  Loader2,
  RefreshCw,
  Sparkles,
  Upload,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { mapResumeFromDB } from "@/mapper/mapResumeFromDB";
import type { AppResume, ReadinessScoreDetails } from "@/types/resume";
import type { AnalyzeJdResult } from "@/lib/ai/generateAnalyzeJd";
import { MAX_RESUME_FILE_SIZE_BYTES } from "@/lib/constants";
import { resolveAiRejection } from "@/lib/subscription/upgradeToast";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import ReadinessScoreCard from "./ReadinessScoreCard";
import JobMatchSummary from "./JobMatchSummary";

type SourceMode = "upload" | "existing";
type CheckStatus = "idle" | "loading" | "success" | "error";

const JD_CHAR_LIMIT = 5000;

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// The full checker flow: pick a source (upload a PDF, or an existing
// ResumeForge resume), an optional job description, then score it. No
// batch/automatic scoring anywhere here — every score is the direct result
// of this component's own "Check ATS Score" click.
export default function AtsCheckerPanel() {
  const [sourceMode, setSourceMode] = useState<SourceMode>("upload");

  const [file, setFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounterRef = useRef(0);

  const [resumes, setResumes] = useState<AppResume[]>([]);
  const [resumesLoading, setResumesLoading] = useState(true);
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);

  const [jobDescription, setJobDescription] = useState("");

  const [status, setStatus] = useState<CheckStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ReadinessScoreDetails | null>(null);
  const [jdResult, setJdResult] = useState<AnalyzeJdResult | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/resumes");
        const data = await res.json();
        if (cancelled || !res.ok || !Array.isArray(data)) return;
        const mapped = data.map((r: unknown) => mapResumeFromDB(r as Parameters<typeof mapResumeFromDB>[0]));
        setResumes(mapped);
        setSelectedResumeId((prev) => prev ?? mapped[0]?.id ?? null);
      } catch (err) {
        console.error("Failed to load resumes for the ATS checker:", err);
      } finally {
        if (!cancelled) setResumesLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const validateAndSetFile = useCallback((candidate: File) => {
    const extension = candidate.name.split(".").pop()?.toLowerCase();
    if (extension !== "pdf") {
      setError("Only PDF files are supported here.");
      setStatus("error");
      return;
    }
    if (candidate.size > MAX_RESUME_FILE_SIZE_BYTES) {
      setError(`This file is larger than ${MAX_RESUME_FILE_SIZE_BYTES / (1024 * 1024)}MB — try a smaller file.`);
      setStatus("error");
      return;
    }
    setError(null);
    setStatus("idle");
    setFile(candidate);
  }, []);

  const handleDrop = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    dragCounterRef.current = 0;
    setIsDragOver(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) validateAndSetFile(dropped);
  };

  const handleDragEnter = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    dragCounterRef.current += 1;
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    dragCounterRef.current -= 1;
    if (dragCounterRef.current <= 0) {
      dragCounterRef.current = 0;
      setIsDragOver(false);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLElement>) => e.preventDefault();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0];
    e.target.value = "";
    if (picked) validateAndSetFile(picked);
  };

  const canCheck =
    status !== "loading" && (sourceMode === "upload" ? !!file : !!selectedResumeId);

  async function handleCheck() {
    if (!canCheck) return;
    setStatus("loading");
    setError(null);
    setResult(null);
    setJdResult(null);

    const trimmedJd = jobDescription.trim();

    try {
      if (sourceMode === "upload") {
        if (!file) return;
        const formData = new FormData();
        formData.append("file", file);
        if (trimmedJd) formData.append("jobDescription", trimmedJd);

        const res = await fetch("/api/ats/check-external", { method: "POST", body: formData });
        const data = await res.json();
        if (!res.ok) throw new Error(resolveAiRejection(data, "Failed to check this resume."));
        setResult(data.result);
      } else {
        if (!selectedResumeId) return;

        const [readinessRes, jdRes] = await Promise.all([
          fetch("/api/ats/check", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ resumeId: selectedResumeId, jobDescription: trimmedJd || undefined }),
          }),
          trimmedJd
            ? fetch("/api/ai/analyze-jd", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ resumeId: selectedResumeId, jobDescription: trimmedJd }),
              })
            : Promise.resolve(null),
        ]);

        const readinessData = await readinessRes.json();
        if (!readinessRes.ok) throw new Error(resolveAiRejection(readinessData, "Failed to check this resume."));
        setResult(readinessData.result);

        if (jdRes) {
          const jdData = await jdRes.json();
          // A failed Job Match Score call shouldn't hide the Readiness
          // Score that already succeeded — just skip showing that section.
          if (jdRes.ok) setJdResult(jdData.result);
        }
      }
      setStatus("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("error");
    }
  }

  const showActiveDrag = isDragOver;

  return (
    <div className="flex flex-col gap-6 lg:grid lg:grid-cols-2 lg:items-start lg:gap-6">
      {/* Input panel */}
      <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm lg:sticky lg:top-4">
        <div>
          <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-500">Resume Source</label>
          <Tabs value={sourceMode} onValueChange={(v) => setSourceMode(v as SourceMode)}>
            <TabsList className="w-full">
              <TabsTrigger value="upload">Upload PDF</TabsTrigger>
              <TabsTrigger value="existing">My Resumes</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {sourceMode === "upload" ? (
          <div
            onDrop={handleDrop}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click();
            }}
            className={cn(
              "relative flex min-h-40 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border px-6 py-8 text-center transition-all duration-200",
              showActiveDrag
                ? "scale-[1.005] border-brand-purple bg-brand-upload"
                : "border-dashed border-gray-300 hover:border-brand-purple/40 hover:bg-purple-50/30",
            )}
          >
            <input ref={fileInputRef} type="file" accept=".pdf" className="sr-only" onChange={handleInputChange} />

            {file ? (
              <div className="flex w-full max-w-xs items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-left shadow-sm">
                <FileText className="h-4 w-4 shrink-0 text-purple-500" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-800">{file.name}</p>
                  <p className="text-xs text-gray-400">{formatFileSize(file.size)}</p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                    setStatus("idle");
                  }}
                  aria-label="Remove file"
                  className="shrink-0 cursor-pointer rounded-md border-none bg-transparent p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <>
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-brand-purple to-brand-blue">
                  <Upload className="h-5 w-5 text-white" strokeWidth={2} />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800">Drop your resume PDF here</p>
                  <p className="mt-0.5 text-xs text-gray-400">
                    or <span className="font-medium text-gray-700 underline underline-offset-2">click to browse</span>
                  </p>
                </div>
              </>
            )}
          </div>
        ) : (
          <div>
            {!resumesLoading && resumes.length === 0 ? (
              <p className="rounded-lg bg-gray-50 px-3 py-2.5 text-xs text-gray-500">
                You don&apos;t have any saved resumes yet — create one first, or check a PDF instead.
              </p>
            ) : (
              <Select
                value={selectedResumeId ?? undefined}
                onValueChange={(v) => setSelectedResumeId(v)}
                disabled={resumesLoading}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={resumesLoading ? "Loading resumes..." : "Select a resume"} />
                </SelectTrigger>
                <SelectContent>
                  {resumes.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        )}

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Paste job description <span className="font-medium normal-case text-gray-400">(optional)</span>
            </label>
            <span
              className={cn(
                "font-mono text-xs",
                jobDescription.length > JD_CHAR_LIMIT * 0.9 ? "text-red-400" : "text-gray-400",
              )}
            >
              {jobDescription.length.toLocaleString()} / {JD_CHAR_LIMIT.toLocaleString()}
            </span>
          </div>
          <Textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value.slice(0, JD_CHAR_LIMIT))}
            placeholder="Adding a job description also shows your Job Match Score for it — leave this blank to just check general ATS readiness."
            className="min-h-28 resize-none"
          />
        </div>

        {status === "error" && error && (
          <p className="flex items-center gap-1.5 text-xs text-red-600">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            {error}
          </p>
        )}

        <button
          onClick={handleCheck}
          disabled={!canCheck}
          className="flex w-full items-center justify-center gap-2 rounded-lg border-none bg-linear-to-r from-blue-600 to-purple-600 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-200 transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-md"
        >
          {status === "loading" ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              Checking...
            </>
          ) : (
            <>
              <Gauge className="h-4 w-4" />
              Check ATS Score
            </>
          )}
        </button>
      </div>

      {/* Results panel */}
      <div>
        {status === "loading" && !result ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white px-8 py-16 text-center shadow-sm">
            <Loader2 className="h-6 w-6 animate-spin text-purple-500" />
            <p className="text-sm text-gray-500">Analyzing your resume...</p>
          </div>
        ) : result ? (
          <div className="flex flex-col gap-6">
            <ReadinessScoreCard result={result} />
            {jdResult && <JobMatchSummary result={jdResult} />}
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-4 rounded-xl border border-gray-200 bg-white px-8 py-16 text-center shadow-sm">
            <div className="relative">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-purple-100 bg-purple-50">
                <Gauge className="h-7 w-7 text-purple-400" />
              </div>
              <div className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-linear-to-br from-blue-600 to-purple-600 shadow-md shadow-blue-200">
                <Sparkles className="h-3 w-3 text-white" />
              </div>
            </div>
            <div>
              <h3 className="mb-1 text-sm font-bold text-gray-900">Ready to Check</h3>
              <p className="max-w-xs text-xs leading-relaxed text-gray-500">
                Upload a PDF or pick a saved resume, then click{" "}
                <span className="font-semibold text-blue-600">Check ATS Score</span> — no job description required.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
