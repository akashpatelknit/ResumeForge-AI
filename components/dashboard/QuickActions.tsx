"use client";

import React, { act, useState } from "react";
import { Plus, Github, FileText } from "lucide-react";
import TemplateSelectionModal from "../modal/TemplateSelectionModal";
import { useRouter } from "next/navigation";
import { useResumeStore } from "@/store/resumeStore";
import { useUser } from "@clerk/nextjs";

const actions = [
  {
    title: "Create New Resume",
    description: "Start from scratch or use AI",
    icon: Plus,
    gradient: "from-purple-600 to-blue-600",
    hoverGradient: "from-purple-700 to-blue-700",
    action: "create",
  },
  {
    title: "Import from GitHub",
    description: "Auto-fill from your profile",
    icon: Github,
    gradient: "from-blue-600 to-cyan-600",
    hoverGradient: "from-blue-700 to-cyan-700",
    action: "import",
  },
  {
    title: "Generate Cover Letter",
    description: "AI-powered in seconds",
    icon: FileText,
    gradient: "from-purple-600 to-pink-600",
    hoverGradient: "from-purple-700 to-pink-700",
    action: "letter",
  },
];

export default function QuickActions() {
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const { createNewResume } = useResumeStore();
  const router = useRouter();
  const { user, isLoaded, isSignedIn } = useUser();
  const handleAction = (action: string) => {
    switch (action) {
      case "create":
        setShowTemplateModal(true);
        break;
      case "import":
        break;
      case "letter":
        break;
      default:
        break;
    }
  };

  const handleCreateResume = async (templateId: string) => {
    const newResume = await createNewResume(templateId, user?.id || "");
    router.push(`/builder/${newResume?.id}`);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <button
              key={action.title}
              className="group relative overflow-hidden rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              style={{ animationDelay: `${index * 100}ms` }}
              onClick={() => handleAction(action.action)}
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
    </div>
  );
}
