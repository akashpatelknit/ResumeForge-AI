"use client";

import React, { useState } from "react";
import { ArrowUpRight, Plus, Target, FileText, Github } from "lucide-react";
import { useRouter } from "next/navigation";
import TemplateSelectionModal from "../modal/TemplateSelectionModal";
import ResumePickerDialog from "./ResumePickerDialog";
import { useResumeStore } from "@/store/resumeStore";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// "Import from GitHub" now has a real feature behind it (see
// components/builder/github/GitHubImportModal.tsx) — it's back as a tile,
// this time wired to the actual flow instead of a no-op.
const actions = [
  {
    id: "ats",
    title: "Check ATS Score",
    description: "See how your resume scores against a job",
    icon: Target,
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
    href: "/dashboard/jobs/analyzer",
  },
  {
    id: "create",
    title: "Create New Resume",
    description: "Start from scratch or use AI",
    icon: Plus,
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
    href: null, // opens the template modal instead of navigating
  },
  {
    id: "cover-letter",
    title: "Generate Cover Letter",
    description: "AI-powered in seconds",
    icon: FileText,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    // The Cover Letter tab lives inside the AI Outreach page (one of 5
    // tabs sharing that page's resume/JD panel) — there's no per-tab deep
    // link, so this lands on the page and the tab is one click away.
    href: "/dashboard/ai/outreach",
  },
  {
    id: "github",
    title: "Import from GitHub",
    description: "Turn your repos into project entries",
    icon: Github,
    // GitHub's own brand mark is black — a light pastel badge here would
    // read as low-contrast/washed-out next to the other 3 tinted badges,
    // so this one is dark-on-light instead of light-on-dark like the rest.
    iconBg: "bg-gray-900",
    iconColor: "text-white",
    href: null, // opens the resume picker instead of navigating
  },
] as const;

export default function QuickActions() {
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showResumePicker, setShowResumePicker] = useState(false);
  // True when "Create New Resume" was reached via the GitHub tile's picker
  // rather than the plain "Create New Resume" tile — tells
  // handleCreateResume to land on the Projects tab with the import modal
  // open instead of the default builder URL.
  const [pendingGithubImport, setPendingGithubImport] = useState(false);
  const { createNewResume } = useResumeStore();
  const router = useRouter();
  const { user } = useUser();

  const handleClick = (id: string, href: string | null) => {
    if (id === "github") {
      setShowResumePicker(true);
      return;
    }
    if (href) {
      router.push(href);
    } else {
      setPendingGithubImport(false);
      setShowTemplateModal(true);
    }
  };

  const handleCreateResume = async (templateId: string) => {
    try {
      const newResume = await createNewResume(templateId, user?.id || "");
      if (pendingGithubImport) {
        setPendingGithubImport(false);
        router.push(`/builder/${newResume.id}?tab=projects&importGithub=1`);
      } else {
        router.push(`/builder/${newResume.id}`);
      }
    } catch (error) {
      console.error("Failed to create resume from template:", error);
      toast.error("Failed to create resume. Please try again.");
      throw error; // let TemplateSelectionModal know creation failed
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.title}
              className="group relative rounded-2xl border border-gray-200 bg-white p-6 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
              onClick={() => handleClick(action.id, action.href)}
            >
              <div className="flex items-start justify-between">
                <div className={cn("flex h-12 w-12 items-center justify-center rounded-full", action.iconBg)}>
                  <Icon className={cn("h-6 w-6", action.iconColor)} />
                </div>
                <ArrowUpRight className="h-5 w-5 text-gray-300 transition-colors duration-200 group-hover:text-gray-500" />
              </div>

              <h3 className="mt-4 text-base font-bold text-gray-900">{action.title}</h3>
              <p className="mt-1 text-sm text-gray-500">{action.description}</p>
            </button>
          );
        })}
      </div>

      <TemplateSelectionModal
        open={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        onSelect={handleCreateResume}
      />

      <ResumePickerDialog
        open={showResumePicker}
        onOpenChange={setShowResumePicker}
        title="Import from GitHub"
        description="Choose which resume to add GitHub projects to."
        onSelectResume={(id) => {
          setShowResumePicker(false);
          router.push(`/builder/${id}?tab=projects&importGithub=1`);
        }}
        onCreateNew={() => {
          setShowResumePicker(false);
          setPendingGithubImport(true);
          setShowTemplateModal(true);
        }}
      />
    </div>
  );
}
