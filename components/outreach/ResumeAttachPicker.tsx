"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ChevronDown, FileText, Loader2, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { mapResumeFromDB } from "@/mapper/mapResumeFromDB";
import type { AppResume } from "@/types/resume";
import { MAX_UPLOADED_RESUMES_PER_USER } from "@/lib/constants";

export type ResumeAttachValue =
  | { resumeSourceType: "builder"; resumeId: string }
  | { resumeSourceType: "uploaded"; uploadedResumeId: string };

interface UploadedResumeDTO {
  id: string;
  fileName: string;
  fileSizeBytes: number;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Shared "Resume to Attach" picker for QuickApplyModal and GenerateEmailPanel
// — two grouped sections ("My Rezlo Resumes" from the Resume model,
// "Uploaded PDFs" from UploadedResume) plus an inline upload action. Owns
// its own data fetching (both lists) so neither caller has to duplicate it;
// callers only hold the current selection (builder resumeId vs. uploaded
// uploadedResumeId) and pass it down as `value`.
export function ResumeAttachPicker({
  value,
  onChange,
  disabled,
}: {
  value: ResumeAttachValue | null;
  onChange: (value: ResumeAttachValue) => void;
  disabled?: boolean;
}) {
  const [resumes, setResumes] = useState<AppResume[]>([]);
  const [uploads, setUploads] = useState<UploadedResumeDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // onChange is expected to be a fresh closure on every parent render (both
  // callers pass an inline setState-derived function) — read through a ref
  // in the auto-select effect below so it doesn't need to be a dependency.
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const [resumesRes, uploadsRes] = await Promise.all([fetch("/api/resumes"), fetch("/api/resumes/upload")]);
        const [resumesData, uploadsData] = await Promise.all([resumesRes.json(), uploadsRes.json()]);
        if (cancelled) return;

        const mappedResumes = resumesRes.ok && Array.isArray(resumesData)
          ? resumesData.map((r: unknown) => mapResumeFromDB(r as Parameters<typeof mapResumeFromDB>[0]))
          : [];
        const mappedUploads: UploadedResumeDTO[] = uploadsRes.ok && Array.isArray(uploadsData) ? uploadsData : [];

        setResumes(mappedResumes);
        setUploads(mappedUploads);

        if (!value && mappedResumes[0]) {
          onChangeRef.current({ resumeSourceType: "builder", resumeId: mappedResumes[0].id });
        }
      } catch (error) {
        console.error("Failed to load resumes for the attach picker:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // Intentionally empty — this fetch only ever runs once per mount; `value`
    // is read for the auto-select check above but shouldn't re-trigger a refetch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file later
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/resumes/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Failed to upload this file.");
        return;
      }
      setUploads((prev) => [{ id: data.id, fileName: data.fileName, fileSizeBytes: data.fileSizeBytes }, ...prev]);
      onChange({ resumeSourceType: "uploaded", uploadedResumeId: data.id });
      setOpen(false);
      toast.success("Resume uploaded.");
    } catch (error) {
      console.error("Resume upload failed:", error);
      toast.error("Network error — please try again.");
    } finally {
      setIsUploading(false);
    }
  }

  const selectedResume = value?.resumeSourceType === "builder" ? resumes.find((r) => r.id === value.resumeId) : undefined;
  const selectedUpload = value?.resumeSourceType === "uploaded" ? uploads.find((u) => u.id === value.uploadedResumeId) : undefined;

  const triggerLabel = loading
    ? "Loading resumes..."
    : selectedResume
      ? selectedResume.title
      : selectedUpload
        ? selectedUpload.fileName
        : "No resumes yet";

  const uploadLimitReached = uploads.length >= MAX_UPLOADED_RESUMES_PER_USER;
  const nothingToPick = !loading && resumes.length === 0 && uploads.length === 0;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={disabled || loading || (nothingToPick && !open)}
        className="flex w-full cursor-pointer items-center gap-2.5 rounded-xl border border-gray-200 bg-white px-3.5 py-3 text-left hover:border-purple-200 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <FileText className="h-4 w-4 shrink-0 text-gray-400" />
        <span className="flex-1 truncate text-sm font-medium text-gray-800">{triggerLabel}</span>
        {selectedUpload && (
          <span className="shrink-0 text-xs text-gray-400">{formatFileSize(selectedUpload.fileSizeBytes)}</span>
        )}
        <ChevronDown className={cn("h-4 w-4 shrink-0 text-gray-400 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full z-10 mt-1.5 max-h-80 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-lg">
          <p className="px-3.5 pt-2.5 pb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
            My Rezlo Resumes
          </p>
          {resumes.length === 0 ? (
            <p className="px-3.5 py-2 text-xs text-gray-400">No saved resumes yet</p>
          ) : (
            resumes.map((resume) => (
              <button
                key={resume.id}
                type="button"
                onClick={() => {
                  onChange({ resumeSourceType: "builder", resumeId: resume.id });
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full cursor-pointer items-center gap-2 border-none px-3.5 py-2.5 text-left text-sm transition-colors",
                  value?.resumeSourceType === "builder" && value.resumeId === resume.id
                    ? "bg-purple-50 text-brand-purple"
                    : "bg-white text-gray-700 hover:bg-gray-50",
                )}
              >
                <FileText className="h-3.5 w-3.5 shrink-0" />
                <span className="flex-1 truncate">{resume.title}</span>
              </button>
            ))
          )}

          <p className="border-t border-gray-100 px-3.5 pt-2.5 pb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
            Uploaded PDFs
          </p>
          {uploads.length === 0 ? (
            <p className="px-3.5 py-2 text-xs text-gray-400">No uploaded PDFs yet</p>
          ) : (
            uploads.map((upload) => (
              <button
                key={upload.id}
                type="button"
                onClick={() => {
                  onChange({ resumeSourceType: "uploaded", uploadedResumeId: upload.id });
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full cursor-pointer items-center gap-2 border-none px-3.5 py-2.5 text-left text-sm transition-colors",
                  value?.resumeSourceType === "uploaded" && value.uploadedResumeId === upload.id
                    ? "bg-purple-50 text-brand-purple"
                    : "bg-white text-gray-700 hover:bg-gray-50",
                )}
              >
                <FileText className="h-3.5 w-3.5 shrink-0" />
                <span className="flex-1 truncate">{upload.fileName}</span>
                <span className="shrink-0 text-[11px] text-gray-400">{formatFileSize(upload.fileSizeBytes)}</span>
              </button>
            ))
          )}

          <div className="border-t border-gray-100 p-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading || uploadLimitReached}
              className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-dashed border-gray-300 px-3 py-2 text-xs font-medium text-gray-600 hover:border-purple-300 hover:bg-purple-50/50 hover:text-brand-purple disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isUploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
              {isUploading
                ? "Uploading..."
                : uploadLimitReached
                  ? `Upload limit reached (${MAX_UPLOADED_RESUMES_PER_USER})`
                  : "Upload a resume"}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </div>
      )}
    </div>
  );
}
