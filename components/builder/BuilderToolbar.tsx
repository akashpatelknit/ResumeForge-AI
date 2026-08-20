"use client";

import { ReactNode, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save, Download, Eye, Pencil, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { useResumeStore } from "@/store/resumeStore";
import Link from "next/link";

interface BuilderToolbarProps {
  // Rendered in the middle of the toolbar, replacing the old placeholder
  // icon row — used by the builder page for its Form/LaTeX mode toggle so
  // there's one header bar instead of two stacked ones.
  centerSlot?: ReactNode;
  // Rendered in the right-hand action group, before Save/Preview/Download —
  // used for LaTeX-mode-only controls (Templates, Recompile, save status).
  endSlot?: ReactNode;
  // Below lg, the builder page shows the form or the preview but not both
  // — these drive that toggle from the Preview button. Undefined outside
  // the plain form+preview builder page (e.g. if this toolbar is ever
  // reused for a mode with no mobile toggle), in which case the button
  // just doesn't render.
  mobilePreviewActive?: boolean;
  onTogglePreview?: () => void;
}

export default function BuilderToolbar({
  centerSlot,
  endSlot,
  mobilePreviewActive,
  onTogglePreview,
}: BuilderToolbarProps) {
  const { currentResume, updateTitle } = useResumeStore();
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 1000);
  };

  const handleDownload = () => {
    console.log("Download PDF");
  };

  return (
    <div className="sticky top-0 z-50 border-b bg-white shadow-sm">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="flex items-center justify-between gap-2 py-3">
          {/* Left Section */}
          <div className="flex min-w-0 items-center gap-2 sm:gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="shrink-0 px-2 sm:px-3">
                <ChevronLeft className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline">Back</span>
              </Button>
            </Link>

            <Input
              value={currentResume?.title ?? ""}
              onChange={(e) => updateTitle(e.target.value)}
              className="w-28 min-w-0 font-semibold sm:w-64"
              placeholder="Resume Title"
            />
          </div>

          {/* Middle */}
          {centerSlot && (
            <div className="hidden md:flex items-center gap-3">{centerSlot}</div>
          )}

          {/* Right Actions */}
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            {endSlot}

            <Button
              variant="outline"
              size="sm"
              onClick={handleSave}
              disabled={isSaving}
              className="px-2 sm:px-3"
            >
              <Save className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">{isSaving ? "Saving..." : "Save"}</span>
            </Button>

            {onTogglePreview && (
              <Button
                variant={mobilePreviewActive ? "default" : "outline"}
                size="sm"
                onClick={onTogglePreview}
                className={cn("px-2 lg:hidden", mobilePreviewActive && "sm:px-3")}
              >
                {mobilePreviewActive ? (
                  <>
                    <Pencil className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Edit</span>
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Preview</span>
                  </>
                )}
              </Button>
            )}

            <Button size="sm" onClick={handleDownload} className="px-2 sm:px-3">
              <Download className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Download PDF</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
