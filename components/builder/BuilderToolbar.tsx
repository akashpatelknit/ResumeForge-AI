"use client";

import { ReactNode, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save, Download, Eye, ChevronLeft } from "lucide-react";
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
}

export default function BuilderToolbar({
  centerSlot,
  endSlot,
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
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-3">
          {/* Left Section */}
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
            </Link>

            <Input
              value={currentResume?.title ?? ""}
              onChange={(e) => updateTitle(e.target.value)}
              className="w-64 font-semibold"
              placeholder="Resume Title"
            />
          </div>

          {/* Middle */}
          {centerSlot && (
            <div className="hidden md:flex items-center gap-3">{centerSlot}</div>
          )}

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {endSlot}

            <Button
              variant="outline"
              size="sm"
              onClick={handleSave}
              disabled={isSaving}
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Saving..." : "Save"}
            </Button>

            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>

            <Button size="sm" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
