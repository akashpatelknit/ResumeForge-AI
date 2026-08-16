"use client";

import { useRef } from "react";
import { useAuth } from "@clerk/nextjs";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { AlertCircle, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { clearPendingParse, loadPendingParse } from "@/lib/pendingResume";
import { useAuthGatedSave } from "@/hooks/useAuthGatedSave";
import { useAuthModalStore } from "@/store/authModalStore";
import type { ResumeUpload } from "@/hooks/useResumeUpload";
import LoadingResume from "./LoadingResume";
import ResumePreviewCard from "./ResumePreviewCard";

interface ResumeDropzoneProps {
  upload: ResumeUpload;
}

// Renders the shared upload state (see hooks/useResumeUpload.ts) as the
// main dropzone card. The hero illustration's upload node drives the same
// shared instance, so a file dropped there shows up here exactly as if it
// had been dropped directly on this card.
export default function ResumeDropzone({ upload }: ResumeDropzoneProps) {
  const {
    status,
    isDragOver,
    resumeData,
    errorMessage,
    remaining,
    handleDrop,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleInputChange,
    reset,
  } = upload;

  const { isSignedIn } = useAuth();
  const openAuthModal = useAuthModalStore((state) => state.open);
  const prefersReducedMotion = useReducedMotion();
  const inputRef = useRef<HTMLInputElement>(null);

  const isGated = status === "gated";
  const isUploading = status === "uploading";
  const isError = status === "error";
  const showActiveDrag = isDragOver && !isUploading && !isGated;
  const isSuccess = status === "success" && !!resumeData;

  const handleBrowseClick = () => {
    if (isGated || isUploading) return;
    inputRef.current?.click();
  };

  const { save, isSaving } = useAuthGatedSave({
    load: loadPendingParse,
    clear: clearPendingParse,
  });

  // The hero illustration's upload icon is the only upload entry point at
  // rest now — this card only appears once there's something to show
  // (progress, a result, an error, or the rate-limit gate).
  if (status === "idle") {
    return null;
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      {isSuccess ? (
        <motion.div
          key="preview"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={prefersReducedMotion ? undefined : { opacity: 0, y: -8 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="flex flex-col items-center gap-4"
        >
          <ResumePreviewCard
            data={resumeData!}
            onSave={save}
            isSaving={isSaving}
            onStartOver={reset}
          />
        </motion.div>
      ) : (
        <motion.div
          key="dropzone"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={prefersReducedMotion ? undefined : { opacity: 0, y: -8 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="mx-auto w-full max-w-160"
        >
          <div
            onDrop={handleDrop}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onClick={!isGated ? handleBrowseClick : undefined}
            role="button"
            tabIndex={isGated ? -1 : 0}
            onKeyDown={(e) => {
              if (!isGated && (e.key === "Enter" || e.key === " ")) handleBrowseClick();
            }}
            className={cn(
              "relative flex min-h-84 flex-col items-center justify-center rounded-[28px] border bg-white px-8 py-12 text-center shadow-[0_10px_40px_rgba(0,0,0,0.03)] transition-colors duration-200",
              !isGated && !isUploading && "cursor-pointer",
              isError
                ? "border-destructive/40"
                : showActiveDrag
                  ? "border-brand-purple bg-brand-upload"
                  : "border-[#E5E5E5]",
            )}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,.docx"
              className="sr-only"
              onChange={handleInputChange}
              disabled={isGated || isUploading}
            />

            {isUploading && <LoadingResume />}

            {isError && (
              <>
                <div className="flex h-15 w-15 items-center justify-center rounded-2xl bg-destructive/10">
                  <AlertCircle className="h-6 w-6 text-destructive" strokeWidth={1.75} />
                </div>

                <h2 className="mt-5 text-lg font-bold text-foreground">Couldn&apos;t read that file</h2>
                <p className="mt-2 text-sm text-muted-foreground">{errorMessage}</p>

                <Button
                  variant="outline"
                  size="sm"
                  className="mt-5 transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
                  onClick={(e) => {
                    e.stopPropagation();
                    reset();
                  }}
                >
                  Try again
                </Button>
              </>
            )}

            {isGated && (
              <>
                <div className="flex h-15 w-15 items-center justify-center rounded-2xl bg-muted">
                  <Lock className="h-6 w-6 text-muted-foreground" strokeWidth={1.75} />
                </div>
                <h2 className="mt-5 text-lg font-bold text-foreground">
                  You&apos;ve used your 5 free resume parses
                </h2>
                <p className="mt-2 max-w-xs text-sm text-muted-foreground">
                  Sign in to keep going — we&apos;ll pick up right where you left off.
                </p>
                <Button
                  size="lg"
                  onClick={(e) => {
                    e.stopPropagation();
                    openAuthModal("sign-in");
                  }}
                  className="mt-5 gap-2 bg-linear-to-r from-brand-purple via-brand-blue to-brand-pink text-white shadow-lg transition-transform duration-200 hover:scale-[1.02] hover:opacity-90 active:scale-[0.98]"
                >
                  Sign In
                </Button>
              </>
            )}
          </div>

          {isError && remaining !== null && !isSignedIn && (
            <p className="mt-3 text-center text-xs text-muted-foreground">
              {remaining > 0 ? `${remaining} free ${remaining === 1 ? "try" : "tries"} left` : ""}
            </p>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
