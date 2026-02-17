"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Save,
  Download,
  Eye,
  ChevronLeft,
  Github,
  Sparkles,
  FileText,
  Star,
  LayoutTemplate,
} from "lucide-react";
import { useResumeStore } from "@/store/resumeStore";
import { useState } from "react";
import Link from "next/link";

const sidebarItems = [
  { icon: Github, label: "Import from GitHub" },
  { icon: Sparkles, label: "AI Improve Resume" },
  { icon: FileText, label: "ATS Score" },
  { icon: Star, label: "Skill Suggestions" },
  { icon: LayoutTemplate, label: "Templates" },
];

export default function BuilderToolbar() {
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
              value={currentResume?.title}
              onChange={(e) => updateTitle(e.target.value)}
              className="w-64 font-semibold"
              placeholder="Resume Title"
            />
          </div>

          {/* Middle Tools (from sidebar) */}
          <div className="hidden md:flex items-center gap-1">
            {sidebarItems.map((item, i) => (
              <button
                key={i}
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition group relative"
              >
                <item.icon size={18} />

                <span className="absolute top-10 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition">
                  {item.label}
                </span>
              </button>
            ))}
          </div>

          {/* Right Actions */}
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
