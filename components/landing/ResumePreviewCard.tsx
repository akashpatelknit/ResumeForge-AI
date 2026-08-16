"use client";

import { ArrowRight, Briefcase, CheckCircle2, Loader2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ResumeData } from "@/types/resume";

interface ResumePreviewCardProps {
  data: ResumeData;
  onSave: () => void;
  isSaving: boolean;
  onStartOver: () => void;
}

export default function ResumePreviewCard({
  data,
  onSave,
  isSaving,
  onStartOver,
}: ResumePreviewCardProps) {
  const { personalInfo, summary, experience } = data;
  const topExperience = experience.slice(0, 2);

  return (
    <div className="mx-auto w-full max-w-160">
      <div className="rounded-[28px] border border-[#E5E5E5] bg-white p-8 shadow-[0_10px_40px_rgba(0,0,0,0.03)] sm:p-10">
        <div className="mb-6 flex items-center gap-2 text-sm font-medium text-emerald-600">
          <CheckCircle2 className="h-4 w-4" />
          Resume parsed
        </div>

        <h3 className="text-2xl font-bold tracking-tight text-foreground">
          {personalInfo.fullName || "Your Resume"}
        </h3>
        {summary && (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {summary}
          </p>
        )}

        {topExperience.length > 0 && (
          <div className="mt-6 space-y-3 border-t border-border pt-6">
            {topExperience.map((exp) => (
              <div key={exp.id} className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-upload">
                  <Briefcase className="h-4 w-4 text-brand-purple" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {exp.position || "Role"}
                    {exp.company && (
                      <span className="font-normal text-muted-foreground"> · {exp.company}</span>
                    )}
                  </p>
                  {exp.startDate && (
                    <p className="text-xs text-muted-foreground">
                      {exp.startDate} — {exp.endDate || "Present"}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 flex flex-col-reverse items-center gap-3 sm:flex-row sm:justify-between">
          <button
            type="button"
            onClick={onStartOver}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Start over
          </button>

          <Button
            size="lg"
            onClick={onSave}
            disabled={isSaving}
            className="w-full gap-2 bg-linear-to-r from-brand-purple via-brand-blue to-brand-pink text-white shadow-lg transition-transform duration-200 hover:scale-[1.02] hover:opacity-90 active:scale-[0.98] sm:w-auto"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                Save my resume
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
