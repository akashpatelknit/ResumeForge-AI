"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Sparkles,
  Loader2,
  AlertCircle,
  ArrowLeft,
  Save,
  Wand2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { mapResumeFromDB } from "@/mapper/mapResumeFromDB";
import type { AppResume } from "@/types/resume";
import type { TailoredResumeResult } from "@/lib/ai/generateTailorResume";
import { useTrackerPromptStore } from "@/store/trackerPromptStore";

interface TailorResumeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resumeId: string;
  resumeTitle: string;
}

type Phase = "input" | "loading" | "review" | "error";

// Generic original-vs-tailored diff row, reused for the summary, each
// experience entry, each skill group, and each project. Mirrors the
// accept/discard button-pair language already used by GenerateWithAI
// (components/builder/ai/GenerateWithAI.tsx), just applied per section
// instead of to one popover's whole result.
function DiffSection({
  title,
  subtitle,
  original,
  tailored,
  useTailored,
  onToggle,
}: {
  title: string;
  subtitle?: string;
  original: string[];
  tailored: string[];
  useTailored: boolean;
  onToggle: (next: boolean) => void;
}) {
  const changed = JSON.stringify(original) !== JSON.stringify(tailored);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-3 py-2 bg-gray-50 border-b border-gray-200">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-800 truncate">
            {title}
          </p>
          {subtitle && (
            <p className="text-xs text-gray-400 truncate">{subtitle}</p>
          )}
        </div>
        {changed ? (
          <div className="inline-flex rounded-md border border-gray-200 p-0.5 shrink-0 bg-white">
            <button
              onClick={() => onToggle(false)}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer border-none ${
                !useTailored
                  ? "bg-gray-900 text-white"
                  : "bg-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Keep Original
            </button>
            <button
              onClick={() => onToggle(true)}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer border-none ${
                useTailored
                  ? "bg-purple-600 text-white"
                  : "bg-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Use Tailored
            </button>
          </div>
        ) : (
          <span className="text-xs text-gray-400 shrink-0">No changes suggested</span>
        )}
      </div>
      <div className="grid grid-cols-2 divide-x divide-gray-100">
        <div className="p-3 space-y-1.5 bg-white">
          {original.map((line, i) => (
            <p
              key={i}
              className={`text-xs leading-relaxed ${
                changed && useTailored
                  ? "text-gray-400 line-through decoration-gray-300"
                  : "text-gray-700"
              }`}
            >
              {line}
            </p>
          ))}
        </div>
        <div className="p-3 space-y-1.5 bg-purple-50/30">
          {tailored.map((line, i) => (
            <p
              key={i}
              className={`text-xs leading-relaxed ${
                changed && useTailored
                  ? "text-gray-800 font-medium"
                  : "text-gray-400"
              }`}
            >
              {line}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function TailorResumeModal({
  open,
  onOpenChange,
  resumeId,
  resumeTitle,
}: TailorResumeModalProps) {
  const router = useRouter();
  const suggestTrackerEntry = useTrackerPromptStore((s) => s.suggest);

  const [phase, setPhase] = useState<Phase>("input");
  const [jobDescription, setJobDescription] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [original, setOriginal] = useState<AppResume | null>(null);
  const [originalError, setOriginalError] = useState<string | null>(null);

  const [tailored, setTailored] = useState<TailoredResumeResult | null>(null);
  const [useSummary, setUseSummary] = useState(true);
  const [useExperience, setUseExperience] = useState<Record<string, boolean>>(
    {},
  );
  const [useSkills, setUseSkills] = useState<Record<string, boolean>>({});
  const [useProjects, setUseProjects] = useState<Record<string, boolean>>({});

  const [newTitle, setNewTitle] = useState(`${resumeTitle} (Tailored)`);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch the real original resume (for the diff view + as the base to
  // clone from on save) once, whenever the modal opens.
  useEffect(() => {
    if (!open) return;

    setPhase("input");
    setJobDescription("");
    setErrorMessage(null);
    setTailored(null);
    setNewTitle(`${resumeTitle} (Tailored)`);
    setOriginal(null);
    setOriginalError(null);

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/resumes/${resumeId}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Failed to load resume");
        if (!cancelled) setOriginal(mapResumeFromDB(data));
      } catch (err) {
        if (!cancelled) {
          setOriginalError(
            err instanceof Error ? err.message : "Failed to load resume",
          );
        }
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, resumeId]);

  const handleTailor = async () => {
    if (!jobDescription.trim() || !original) return;

    setPhase("loading");
    setErrorMessage(null);

    try {
      const res = await fetch("/api/ai/tailor-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeId, jobDescription }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to tailor resume");

      const result = data.result as TailoredResumeResult;
      setTailored(result);
      setUseSummary(true);
      setUseExperience(
        Object.fromEntries(result.experience.map((e) => [e.id, true])),
      );
      setUseSkills(
        Object.fromEntries(result.skills.map((s) => [s.id, true])),
      );
      setUseProjects(
        Object.fromEntries(result.projects.map((p) => [p.id, true])),
      );
      setPhase("review");
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to tailor resume",
      );
      setPhase("error");
      // jobDescription is intentionally left in place so retrying doesn't
      // require re-pasting it.
    }
  };

  const handleSave = async () => {
    if (!original || !tailored || isSaving) return;
    setIsSaving(true);

    try {
      const experience = original.experience.map((exp) => {
        const t = tailored.experience.find((e) => e.id === exp.id);
        return useExperience[exp.id] && t
          ? { ...exp, achievements: t.achievements }
          : exp;
      });

      const skills = original.skills.map((skill) => {
        const t = tailored.skills.find((s) => s.id === skill.id);
        return useSkills[skill.id] && t ? { ...skill, items: t.items } : skill;
      });

      const projects = original.projects.map((proj) => {
        const t = tailored.projects.find((p) => p.id === proj.id);
        return useProjects[proj.id] && t
          ? { ...proj, highlights: t.highlights }
          : proj;
      });

      const res = await fetch("/api/resumes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle.trim() || `${resumeTitle} (Tailored)`,
          templateId: original.templateId,
          data: {
            personalInfo: original.personalInfo,
            summary: useSummary ? tailored.summary : original.summary,
            experience,
            education: original.education,
            skills,
            projects,
            achievements: original.achievements,
            certifications: original.certifications,
            languages: original.languages,
            customSections: original.customSections,
            isFavorite: false,
            thumbnail: original.thumbnail,
            atsScore: original.atsScore,
          },
        }),
      });

      const newResume = await res.json();
      if (!res.ok) {
        throw new Error(newResume?.error || "Failed to save tailored resume");
      }

      toast.success("Tailored resume saved as a new resume.");
      suggestTrackerEntry({
        companyName: tailored.companyName,
        roleTitle: tailored.roleTitle,
        jobDescription,
      });
      onOpenChange(false);
      router.push(`/builder/${newResume.id}`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to save tailored resume",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="h-4 w-4 text-purple-600" />
            Tailor Resume to a Job
          </DialogTitle>
          <DialogDescription>
            Reword and reorder “{resumeTitle}” to match a job description —
            nothing is invented, and nothing is saved until you accept it.
          </DialogDescription>
        </DialogHeader>

        {originalError ? (
          <div className="flex items-center gap-2 text-sm text-red-600 py-6">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {originalError}
          </div>
        ) : (phase === "input" || phase === "error") ? (
          <div className="space-y-3">
            <Textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description here..."
              rows={10}
              className="resize-none text-sm"
            />

            {phase === "error" && errorMessage && (
              <div className="flex items-start gap-1.5 text-xs text-red-600">
                <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <Button
              onClick={handleTailor}
              disabled={!jobDescription.trim() || !original}
              className="w-full"
            >
              {!original ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Loading resume...
                </>
              ) : phase === "error" ? (
                "Retry"
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Tailor Resume
                </>
              )}
            </Button>
          </div>
        ) : phase === "loading" ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16">
            <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
            <p className="text-sm text-gray-500">
              Tailoring your resume to this job description...
            </p>
          </div>
        ) : (
          phase === "review" &&
          tailored &&
          original && (
            <div className="space-y-4">
              <button
                onClick={() => setPhase("input")}
                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 cursor-pointer border-none bg-transparent p-0"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Try a different job description
              </button>

              <DiffSection
                title="Professional Summary"
                original={[original.summary || "(empty)"]}
                tailored={[tailored.summary]}
                useTailored={useSummary}
                onToggle={setUseSummary}
              />

              {original.experience.map((exp) => {
                const t = tailored.experience.find((e) => e.id === exp.id);
                if (!t) return null;
                return (
                  <DiffSection
                    key={exp.id}
                    title={`Experience — ${exp.position || exp.company}`}
                    subtitle={exp.company}
                    original={exp.achievements}
                    tailored={t.achievements}
                    useTailored={useExperience[exp.id] ?? true}
                    onToggle={(v) =>
                      setUseExperience((prev) => ({ ...prev, [exp.id]: v }))
                    }
                  />
                );
              })}

              {original.skills.map((skill) => {
                const t = tailored.skills.find((s) => s.id === skill.id);
                if (!t) return null;
                return (
                  <DiffSection
                    key={skill.id}
                    title={`Skills — ${skill.category}`}
                    original={[skill.items.join(", ") || "(empty)"]}
                    tailored={[t.items.join(", ") || "(empty)"]}
                    useTailored={useSkills[skill.id] ?? true}
                    onToggle={(v) =>
                      setUseSkills((prev) => ({ ...prev, [skill.id]: v }))
                    }
                  />
                );
              })}

              {original.projects.map((proj) => {
                const t = tailored.projects.find((p) => p.id === proj.id);
                if (!t) return null;
                return (
                  <DiffSection
                    key={proj.id}
                    title={`Project — ${proj.name}`}
                    original={proj.highlights}
                    tailored={t.highlights}
                    useTailored={useProjects[proj.id] ?? true}
                    onToggle={(v) =>
                      setUseProjects((prev) => ({ ...prev, [proj.id]: v }))
                    }
                  />
                );
              })}

              <div className="pt-2 border-t border-gray-100 space-y-2">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  New resume title
                </label>
                <Input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Full Stack Developer — Acme Corp"
                />
                <p className="text-xs text-gray-400">
                  This is saved as a brand-new resume — “{resumeTitle}” is
                  never overwritten.
                </p>
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="w-full"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Tailored Version
                    </>
                  )}
                </Button>
              </div>
            </div>
          )
        )}
      </DialogContent>
    </Dialog>
  );
}
