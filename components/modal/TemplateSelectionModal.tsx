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
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function TemplateSelectionModal({
  open,
  onClose,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (templateId: string) => Promise<void>;
}) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [creatingId, setCreatingId] = useState<string | null>(null);

  const handleSelect = async (templateId: string) => {
    if (creatingId) return; // a creation is already in flight
    setSelectedId(templateId);
    setCreatingId(templateId);
    try {
      await onSelect(templateId);
      onClose();
    } catch (error) {
      console.error("Failed to create resume from template:", error);
      toast.error("Failed to create resume. Please try again.");
    } finally {
      setCreatingId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="inset-0 h-screen w-screen max-w-none translate-x-0 translate-y-0 overflow-hidden rounded-none border-0 bg-white p-0 shadow-2xl sm:inset-auto sm:top-1/2 sm:left-1/2 sm:h-auto sm:max-h-[90vh] sm:w-full sm:max-w-4xl sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl lg:max-w-6xl">
        {/* Header */}
        <div className="border-b border-gray-100 px-4 pt-6 pb-4 sm:px-8 sm:pt-8">
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
        <div className="grid grid-cols-1 gap-5 overflow-y-auto px-4 py-6 max-h-[calc(100vh-13rem)] sm:max-h-[55vh] sm:grid-cols-2 sm:px-8 lg:grid-cols-3 xl:grid-cols-4 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
          {templates.map((template) => {
            const isHovered = hoveredId === template.id;
            const isSelected = selectedId === template.id;
            const isCreatingThis = creatingId === template.id;
            const isDisabled = creatingId !== null && !isCreatingThis;

            return (
              <div
                key={template.id}
                className={cn(
                  "group relative rounded-2xl overflow-hidden transition-all duration-300",
                  "border-2 shadow-sm isolate",
                  isSelected
                    ? "border-violet-500 shadow-violet-100 shadow-lg"
                    : "border-gray-200 hover:border-violet-400 hover:shadow-md",
                  isDisabled
                    ? "opacity-50 cursor-not-allowed"
                    : "cursor-pointer",
                )}
                style={{ isolation: "isolate" }}
                onMouseEnter={() => !isDisabled && setHoveredId(template.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => !isDisabled && setSelectedId(template.id)}
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
                      isHovered || isCreatingThis ? "opacity-100" : "opacity-0",
                    )}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelect(template.id);
                      }}
                      disabled={isDisabled || isCreatingThis}
                      className={cn(
                        "px-5 py-2.5 rounded-xl text-sm font-semibold text-white",
                        "bg-linear-to-br from-violet-500 to-purple-600",
                        "shadow-lg shadow-violet-500/30",
                        "hover:from-violet-600 hover:to-purple-700",
                        "transform transition-all duration-200",
                        "flex items-center gap-2",
                        isHovered || isCreatingThis
                          ? "translate-y-0 opacity-100"
                          : "translate-y-2 opacity-0",
                        "focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-transparent",
                        "disabled:cursor-not-allowed",
                      )}
                    >
                      {isCreatingThis ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        "Use this template →"
                      )}
                    </button>
                  </div>

                  {/* Selected Badge */}
                  {isSelected && !isCreatingThis && (
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
        <div className="border-t border-gray-100 bg-gray-50/60 px-4 py-5 sm:px-8 rounded-b-2xl">
          <DialogFooter className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-gray-400">
              {creatingId
                ? "Creating your resume..."
                : selectedId
                  ? "Template selected — click Use this template on the card or confirm below."
                  : "Hover over a template to preview the action button."}
            </p>
            <div className="flex gap-2">
              <DialogClose asChild>
                <Button
                  variant="outline"
                  className="rounded-xl text-sm"
                  disabled={creatingId !== null}
                >
                  Cancel
                </Button>
              </DialogClose>
              {selectedId && (
                <Button
                  onClick={() => handleSelect(selectedId)}
                  disabled={creatingId !== null}
                  className="rounded-xl text-sm bg-linear-to-br from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white shadow shadow-violet-200 disabled:opacity-70"
                >
                  {creatingId ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Use Selected Template"
                  )}
                </Button>
              )}
            </div>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
