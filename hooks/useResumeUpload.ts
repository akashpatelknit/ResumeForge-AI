"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { clearPendingParse, loadPendingParse, savePendingParse } from "@/lib/pendingResume";
import { MAX_RESUME_FILE_SIZE_BYTES } from "@/lib/constants";
import type { ResumeData } from "@/types/resume";

export type UploadStatus = "idle" | "uploading" | "success" | "error" | "gated";

interface ParseSuccess {
  resume: ResumeData;
  remaining: number | null;
}

interface ParseErrorBody {
  error?: string;
  message?: string;
}

async function uploadAndParse(file: File): Promise<ParseSuccess> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/api/resume/parse", { method: "POST", body: formData });
  const body = (await res.json()) as ParseSuccess & ParseErrorBody;

  if (!res.ok) {
    const err = new Error(body.message || "Something went wrong reading your resume.") as Error & {
      code?: string;
    };
    err.code = body.error;
    throw err;
  }

  return body;
}

// Matches what app/api/resume/parse/route.ts actually accepts
// (lib/textExtraction/extractResumeText.ts) — kept in sync rather than
// inventing separate client-side limits.
const ACCEPTED_EXTENSIONS = ["pdf", "docx"];

// All the drop/parse/quota/localStorage state and logic behind the resume
// upload experience — pulled out of ResumeDropzone.tsx into a hook so any
// number of UI surfaces (the dropzone itself, the hero illustration's
// upload node, ...) can share one instance and drive the exact same
// behavior instead of each having its own disconnected copy.
export function useResumeUpload() {
  const { isSignedIn } = useAuth();

  const [status, setStatus] = useState<UploadStatus>("idle");
  const [isDragOver, setIsDragOver] = useState(false);
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [remaining, setRemaining] = useState<number | null>(null);

  const pendingFileRef = useRef<File | null>(null);
  const dragCounterRef = useRef(0);

  // Restore a previously parsed-but-unsaved resume so a refresh or a
  // return visit doesn't force a re-drop. Deliberately not a lazy useState
  // initializer: localStorage isn't available during SSR, so reading it
  // synchronously during render would make the client's first render
  // diverge from the server-rendered HTML and trigger a hydration
  // mismatch. Restoring post-mount, in an effect, is the correct escape
  // hatch for external-store data that can't exist at SSR time.
  useEffect(() => {
    const pending = loadPendingParse();
    if (pending) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setResumeData(pending.data);
      setStatus("success");
    }
  }, []);

  // File is parsed immediately on drop/select — no separate confirm step.
  const runParse = useCallback(async (file: File) => {
    setStatus("uploading");
    setErrorMessage("");
    try {
      const { resume, remaining: newRemaining } = await uploadAndParse(file);
      savePendingParse(resume);
      setResumeData(resume);
      setRemaining(newRemaining);
      setStatus("success");
      pendingFileRef.current = null;
    } catch (error) {
      const code = (error as { code?: string }).code;
      if (code === "RATE_LIMITED") {
        setStatus("gated");
        setRemaining(0);
        return;
      }
      setErrorMessage(error instanceof Error ? error.message : "Something went wrong.");
      setStatus("error");
      pendingFileRef.current = null;
    }
  }, []);

  // If the user hits the gate and signs in right there, retry the exact
  // file they dropped — once authenticated, the parse route bypasses the
  // anonymous quota entirely, so this attempt just goes through.
  useEffect(() => {
    if (isSignedIn && status === "gated" && pendingFileRef.current) {
      const file = pendingFileRef.current;
      pendingFileRef.current = null;
      void runParse(file);
    }
  }, [isSignedIn, status, runParse]);

  const handleFile = useCallback(
    (file: File) => {
      if (status === "uploading" || status === "gated") return;

      const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
      if (!ACCEPTED_EXTENSIONS.includes(extension)) {
        setErrorMessage("Only PDF and DOCX files are supported.");
        setStatus("error");
        return;
      }
      if (file.size > MAX_RESUME_FILE_SIZE_BYTES) {
        setErrorMessage("This file is larger than 5MB — try a smaller file.");
        setStatus("error");
        return;
      }
      pendingFileRef.current = file;
      void runParse(file);
    },
    [status, runParse],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLElement>) => {
      e.preventDefault();
      dragCounterRef.current = 0;
      setIsDragOver(false);
      if (status === "uploading" || status === "gated") return;
      const file = e.dataTransfer.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile, status],
  );

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    dragCounterRef.current += 1;
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    dragCounterRef.current -= 1;
    if (dragCounterRef.current <= 0) {
      dragCounterRef.current = 0;
      setIsDragOver(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
      e.target.value = "";
    },
    [handleFile],
  );

  const reset = useCallback(() => {
    setStatus("idle");
    setErrorMessage("");
    setResumeData(null);
    clearPendingParse();
  }, []);

  return {
    status,
    isDragOver,
    resumeData,
    errorMessage,
    remaining,
    handleFile,
    handleDrop,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleInputChange,
    reset,
  };
}

export type ResumeUpload = ReturnType<typeof useResumeUpload>;
