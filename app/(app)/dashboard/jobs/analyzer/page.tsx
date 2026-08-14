"use client";

import { useEffect, useState } from "react";
import { FileText, ChevronDown, Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { mapResumeFromDB } from "@/mapper/mapResumeFromDB";
import type { AppResume } from "@/types/resume";
import JobDescriptionAnalyzer from "@/components/builder/ai/JobDescriptionAnalyzer";

export default function JobAnalyzerPage() {
  const [resumes, setResumes] = useState<AppResume[]>([]);
  const [resumesLoading, setResumesLoading] = useState(true);
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(
    null,
  );

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
      } finally {
        if (!cancelled) setResumesLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!resumesLoading && resumes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center gap-4 bg-white rounded-2xl border border-gray-200 shadow-sm">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center">
          <Search className="w-7 h-7 text-blue-500" />
        </div>
        <div>
          <p className="text-base font-semibold text-gray-800 mb-1">
            Create a resume first
          </p>
          <p className="text-sm text-gray-400 max-w-xs mx-auto leading-relaxed">
            The Job Analyzer checks a saved resume against a job description
            — add a resume to get started.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Resume Selector */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-4">
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
          Select Resume
        </label>
        <div className="relative w-full max-w-sm">
          <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />

          <Select
            value={selectedResumeId ?? undefined}
            onValueChange={(value) => setSelectedResumeId(value)}
            disabled={resumesLoading}
          >
            <SelectTrigger className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-9 py-2.5 text-sm font-medium text-gray-700 focus:ring-2 focus:ring-blue-400">
              <SelectValue
                placeholder={
                  resumesLoading ? "Loading resumes..." : "Select Resume"
                }
              />
            </SelectTrigger>

            <SelectContent>
              {resumes.map((r) => (
                <SelectItem key={r.id} value={r.id}>
                  {r.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      <JobDescriptionAnalyzer resumeId={selectedResumeId} layout="split" />
    </div>
  );
}
