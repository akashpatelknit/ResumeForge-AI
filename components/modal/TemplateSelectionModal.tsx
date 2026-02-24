"use client";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { sampleTemplates as templates } from "@/config/templates";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function TemplateSelectionModal({
  open,
  onClose,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (templateId: string) => void;
}) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
 
  const handleSelect = (templateId: string) => {
    onSelect(templateId);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="min-w-7xl w-full max-h-[95vh] overflow-hidden bg-white rounded-2xl shadow-2xl border-0 p-0">
        {/* Header */}
        <div className="px-8 pt-8 pb-4 border-b border-gray-100">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900 tracking-tight">
              Choose a Template
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500 mt-1">
              Pick a professionally designed template to jumpstart your project
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Template Grid */}
        <div className="px-8 py-6 overflow-y-auto max-h-[55vh] grid grid-cols-4 gap-5 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
          {templates.map((template) => {
            const isHovered = hoveredId === template.id;
            const isSelected = selectedId === template.id;

            return (
              <div
                key={template.id}
                className={cn(
                  "group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300",
                  "border-2 shadow-sm isolate",
                  isSelected
                    ? "border-violet-500 shadow-violet-100 shadow-lg"
                    : "border-gray-200 hover:border-violet-400 hover:shadow-md",
                )}
                style={{ isolation: "isolate" }}
                onMouseEnter={() => setHoveredId(template.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => setSelectedId(template.id)}
              >
                {/* Thumbnail */}
                <div className="relative overflow-hidden bg-gray-50 aspect-4/3 rounded-t-[14px]">
                  <img
                    src={template.thumbnail}
                    alt={template.name}
                    className={cn(
                      "w-full h-full object-cover transition-transform duration-500",
                      isHovered ? "scale-105" : "scale-100",
                    )}
                  />

                  {/* Hover Overlay */}
                  <div
                    className={cn(
                      "absolute inset-0 flex items-center justify-center transition-all duration-300",
                      "bg-black/40 backdrop-blur-[2px]",
                      isHovered ? "opacity-100" : "opacity-0",
                    )}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelect(template.id);
                      }}
                      className={cn(
                        "px-5 py-2.5 rounded-xl text-sm font-semibold text-white",
                        "bg-linear-to-br from-violet-500 to-purple-600",
                        "shadow-lg shadow-violet-500/30",
                        "hover:from-violet-600 hover:to-purple-700",
                        "transform transition-all duration-200",
                        isHovered
                          ? "translate-y-0 opacity-100"
                          : "translate-y-2 opacity-0",
                        "focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-transparent",
                      )}
                    >
                      Use this template →
                    </button>
                  </div>

                  {/* Selected Badge */}
                  {isSelected && (
                    <div className="absolute top-2 right-2 bg-violet-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
                      Selected
                    </div>
                  )}
                </div>

                {/* Card Footer */}
                <div className="px-3.5 py-3 bg-white rounded-b-[14px]">
                  <h3 className="font-semibold text-sm text-gray-800 truncate">
                    {template.name}
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5 truncate">
                    {template.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-gray-100 bg-gray-50/60 rounded-b-2xl">
          <DialogFooter className="flex items-center justify-between sm:justify-between gap-3">
            <p className="text-xs text-gray-400">
              {selectedId
                ? "Template selected — click Use this template on the card or confirm below."
                : "Hover over a template to preview the action button."}
            </p>
            <div className="flex gap-2">
              <DialogClose asChild>
                <Button variant="outline" className="rounded-xl text-sm">
                  Cancel
                </Button>
              </DialogClose>
              {selectedId && (
                <Button
                  onClick={() => handleSelect(selectedId)}
                  className="rounded-xl text-sm bg-linear-to-br from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white shadow shadow-violet-200"
                >
                  Use Selected Template
                </Button>
              )}
            </div>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
