"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save, Download, Eye, ChevronLeft } from "lucide-react";
import { useResumeStore } from "@/store/resumeStore";
import { useState } from "react";
import Link from "next/link";

export default function BuilderToolbar() {
  const { currentResume } = useResumeStore();
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    // TODO: Save to database
    setTimeout(() => setIsSaving(false), 1000);
  };

  const handleDownload = () => {
    // TODO: Generate and download PDF
    console.log("Download PDF");
  };

  return (
    <div className="sticky top-0 z-50 border-b bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-3">
          {/* Left: Back button and title */}
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
            </Link>
            <Input
              value={currentResume?.title || "Untitled Resume"}
              onChange={(e) => {
                // Update resume title
              }}
              className="w-64 font-semibold"
              placeholder="Resume Title"
            />
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
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
