"use client";

import React, { useState } from "react";
import { Plus, Target, FileText, Github } from "lucide-react";
import { useRouter } from "next/navigation";
import TemplateSelectionModal from "../modal/TemplateSelectionModal";
import ResumePickerDialog from "./ResumePickerDialog";
import { useResumeStore } from "@/store/resumeStore";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";

// "Import from GitHub" now has a real feature behind it (see
// components/builder/github/GitHubImportModal.tsx) — it's back as a tile,
// this time wired to the actual flow instead of a no-op.
const actions = [
  {
    id: "ats",
    title: "Check ATS Score",
    description: "See how your resume scores against a job",
    icon: Target,
    gradient: "from-green-600 to-emerald-600",
    hoverGradient: "from-green-700 to-emerald-700",
    href: "/dashboard/jobs/analyzer",
  },
  {
    id: "create",
    title: "Create New Resume",
    description: "Start from scratch or use AI",
    icon: Plus,
    gradient: "from-purple-600 to-blue-600",
    hoverGradient: "from-purple-700 to-blue-700",
    href: null, // opens the template modal instead of navigating
  },
  {
    id: "cover-letter",
    title: "Generate Cover Letter",
    description: "AI-powered in seconds",
    icon: FileText,
    gradient: "from-purple-600 to-pink-600",
    hoverGradient: "from-purple-700 to-pink-700",
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
    gradient: "from-slate-700 to-slate-900",
    hoverGradient: "from-slate-800 to-black",
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
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <button
              key={action.title}
              className="group relative overflow-hidden rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              style={{ animationDelay: `${index * 100}ms` }}
              onClick={() => handleClick(action.id, action.href)}
            >
              <div
                className={`
                  bg-linear-to-br ${action.gradient} p-6 text-white text-left
                  group-hover:bg-linear-to-br group-hover:${action.hoverGradient}
                  transition-all duration-300
                `}
              >
                {/* Pattern overlay */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')]"></div>
                </div>

                <div className="relative">
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl group-hover:bg-white/30 transition-colors duration-300">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:rotate-90 transition-transform duration-300">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>

                  <h3 className="font-bold text-lg mb-1">{action.title}</h3>
                  <p className="text-sm text-white/80">{action.description}</p>
                </div>
              </div>
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
