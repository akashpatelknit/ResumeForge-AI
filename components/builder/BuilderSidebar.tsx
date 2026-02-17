"use client";

import { Github, Sparkles, FileText, Star, LayoutTemplate } from "lucide-react";

const items = [
  { icon: Github, label: "Import from GitHub" },
  { icon: Sparkles, label: "AI Improve Resume" },
  { icon: FileText, label: "ATS Score" },
  { icon: Star, label: "Skill Suggestions" },
  { icon: LayoutTemplate, label: "Templates" },
];

export default function BuilderSidebar() {
  return (
    <div className="h-screen w-14 bg-white border-r shadow-sm flex flex-col items-center py-4 gap-4 z-50">
      {items.map((item, i) => (
        <button
          key={i}
          className="p-3 rounded-xl hover:bg-gray-100 transition group relative"
        >
          <item.icon size={20} />

          {/* Tooltip */}
          <span className="absolute left-14 whitespace-nowrap bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition">
            {item.label}
          </span>
        </button>
      ))}
    </div>
  );
}
