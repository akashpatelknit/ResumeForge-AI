"use client";

import { useMemo } from "react";
import { Check, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Template } from "@/types/template";
import type { AppResume } from "@/types/resume";
import PdfCanvasThumbnail from "@/components/pdf/PdfCanvasThumbnail";

interface TemplateGridCardProps {
  template: Template;
  resume: AppResume;
  isSelected: boolean;
  isDefault: boolean;
  onSelect: () => void;
}

// One card in the builder's Templates tab grid — distinct from
// components/builder/TemplateCard.tsx, which is the "start a new resume"
// picker at /builder/new. This one switches the *current* resume's
// templateId in place, so it needs a selected-state ring instead of a
// "Select" button, matching the reference gallery.
export default function TemplateGridCard({
  template,
  resume,
  isSelected,
  isDefault,
  onSelect,
}: TemplateGridCardProps) {
  // The actual resume, rendered through this card's template — not the
  // currently-selected one — so every card previews what switching to it
  // would really produce. Memoized so PdfCanvasThumbnail's effect only
  // re-fires when resume content or this card's templateId actually change,
  // not on every parent re-render.
  const previewResume = useMemo(
    () => ({ ...resume, templateId: template.id }),
    [resume, template.id],
  );

  if (template.comingSoon) {
    return (
      <div className="flex flex-col gap-2 rounded-lg border border-dashed border-gray-200 p-3 opacity-60">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-500">{template.name}</span>
          <Lock className="size-3.5 text-gray-400" />
        </div>
        <p className="text-xs text-gray-400">{template.description}</p>
        <div className="flex aspect-[3/4] items-center justify-center rounded-md bg-gray-50 text-xs text-gray-400">
          Coming soon
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex flex-col gap-2 rounded-lg border p-3 text-left transition",
        isSelected
          ? "border-blue-600 ring-1 ring-blue-600"
          : "border-gray-200 hover:border-gray-300",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-semibold text-gray-900">{template.name}</span>
          {isDefault && (
            <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-500">
              Default
            </span>
          )}
        </div>
        {isSelected && (
          <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-blue-600">
            <Check className="size-2.5 text-white" />
          </span>
        )}
      </div>
      <p className="text-xs text-gray-500">{template.description}</p>
      <div className="aspect-[3/4] w-full overflow-hidden rounded-md border border-gray-100 bg-gray-50">
        <PdfCanvasThumbnail resume={previewResume} />
      </div>
      <span className="text-[11px] text-gray-400">Default font: Helvetica, sans-serif</span>
    </button>
  );
}
