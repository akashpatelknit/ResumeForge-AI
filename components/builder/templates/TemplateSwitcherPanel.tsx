"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { sampleTemplates } from "@/config/templates";
import type { Template } from "@/types/template";
import { useResumeStore } from "@/store/resumeStore";
import TemplateGridCard from "@/components/builder/templates/TemplateGridCard";

// Same derivation as components/marketing/TemplatesPageClient.tsx: filter
// pills come from whichever category values actually appear in the catalog,
// in catalog order, so a "Two column" or "ATS" pill only ever exists once a
// real template is tagged that way — no dead filters for content that
// doesn't exist yet.
const CATEGORY_ORDER = Array.from(new Set(sampleTemplates.map((t) => t.category)));
const CATEGORIES: { id: Template["category"] | "all"; label: string }[] = [
  { id: "all", label: "All" },
  ...CATEGORY_ORDER.map((c) => ({ id: c, label: c.charAt(0).toUpperCase() + c.slice(1) })),
];

// The first non-comingSoon template in the catalog is the one new resumes
// are seeded with (see lib/seedResumeData.ts / config/templates.ts) —
// treated as "Default" in the grid, same meaning as the reference gallery's
// badge.
const DEFAULT_TEMPLATE_ID = sampleTemplates.find((t) => !t.comingSoon)?.id;

export default function TemplateSwitcherPanel() {
  const { currentResume, updateTemplateId } = useResumeStore();
  const [category, setCategory] = useState<Template["category"] | "all">("all");

  if (!currentResume) return null;

  const filtered =
    category === "all" ? sampleTemplates : sampleTemplates.filter((t) => t.category === category);

  return (
    <div className="space-y-4 p-1">
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setCategory(c.id)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition",
              category === c.id
                ? "border-blue-600 bg-blue-600 text-white"
                : "border-gray-200 bg-white text-gray-600 hover:border-gray-300",
            )}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {filtered.map((template) => (
          <TemplateGridCard
            key={template.id}
            template={template}
            resume={currentResume}
            isSelected={currentResume.templateId === template.id}
            isDefault={template.id === DEFAULT_TEMPLATE_ID}
            onSelect={() => updateTemplateId(template.id)}
          />
        ))}
      </div>
    </div>
  );
}
