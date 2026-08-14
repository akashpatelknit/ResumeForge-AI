"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText, Loader2, Plus } from "lucide-react";
import { mapResumeFromDB } from "@/mapper/mapResumeFromDB";
import type { AppResume } from "@/types/resume";

interface ResumePickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectResume: (id: string) => void;
  onCreateNew: () => void;
  title?: string;
  description?: string;
}

// Generic "pick one of your real saved resumes, or create a new one"
// dialog — used by the dashboard's "Import from GitHub" quick action,
// since that flow needs a concrete resumeId before it can navigate to the
// builder. Fetches fresh each time it opens rather than caching, since the
// dashboard page doesn't keep a resumes list in scope for this to reuse.
export default function ResumePickerDialog({
  open,
  onOpenChange,
  onSelectResume,
  onCreateNew,
  title = "Select a resume",
  description = "Choose which resume to use.",
}: ResumePickerDialogProps) {
  const [resumes, setResumes] = useState<AppResume[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setIsLoading(true);

    (async () => {
      try {
        const res = await fetch("/api/resumes");
        const data = await res.json();
        if (!res.ok || !Array.isArray(data) || cancelled) return;
        setResumes(
          data
            .map((r: unknown) =>
              mapResumeFromDB(r as Parameters<typeof mapResumeFromDB>[0]),
            )
            .filter((r: AppResume) => !r.isArchived),
        );
      } catch (error) {
        console.error("Failed to load resumes:", error);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
          </div>
        ) : (
          <>
            {resumes.length > 0 && (
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {resumes.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => onSelectResume(r.id)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-colors text-left cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-purple-600 shrink-0" />
                    <span className="text-sm font-medium text-gray-900 truncate">
                      {r.title}
                    </span>
                  </button>
                ))}
              </div>
            )}
            {resumes.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">
                No resumes yet — create one to get started.
              </p>
            )}
          </>
        )}

        <Button variant="outline" onClick={onCreateNew} className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          Create New Resume
        </Button>
      </DialogContent>
    </Dialog>
  );
}
