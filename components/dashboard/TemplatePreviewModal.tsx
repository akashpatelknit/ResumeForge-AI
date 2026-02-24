import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Download,
  Star,
  Users,
  Crown,
  Check,
  Sparkles,
  ArrowRight,
  RotateCcw,
} from "lucide-react";
import { Template } from "@/types/template";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useResumeStore } from "@/store/resumeStore";
import { useUser } from "@clerk/nextjs";

interface TemplatePreviewModalProps {
  template: Template;
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
}

export default function TemplatePreviewModal({
  template,
  onClose,
  onNext,
  onPrevious,
}: TemplatePreviewModalProps) {
  const [zoom, setZoom] = useState(100);
  const [isVisible, setIsVisible] = useState(false);
  const router = useRouter();
  const { currentResume, createNewResume } = useResumeStore();
  const { user, isLoaded, isSignedIn } = useUser();

  // Use refs to avoid stale closures while keeping keyboard nav always fresh
  const onCloseRef = React.useRef(onClose);
  const onNextRef = React.useRef(onNext);
  const onPreviousRef = React.useRef(onPrevious);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);
  useEffect(() => {
    onNextRef.current = onNext;
  }, [onNext]);
  useEffect(() => {
    onPreviousRef.current = onPrevious;
  }, [onPrevious]);

  useEffect(() => {
    requestAnimationFrame(() => setIsVisible(true));
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCloseRef.current();
      if (e.key === "ArrowRight") onNextRef.current();
      if (e.key === "ArrowLeft") onPreviousRef.current();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []); // mount/unmount only — refs keep callbacks current

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 25, 50));
  const handleZoomReset = () => setZoom(100);

  return (
    <TooltipProvider>
      {/* Single wrapper — backdrop + centering, pointer-events only on card */}
      <div
        className={cn(
          "fixed inset-0 z-50 flex items-center justify-center p-4",
          "bg-black/75 backdrop-blur-md",
          "transition-opacity duration-300",
          isVisible ? "opacity-100" : "opacity-0",
        )}
        onClick={onClose}
      >
        <div
          className={cn(
            "relative flex w-full max-w-6xl h-[90vh] rounded-2xl overflow-hidden shadow-2xl border border-white/10",
            "transition-transform duration-300",
            isVisible ? "scale-100" : "scale-95",
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Preview Panel */}
          <div className="relative flex-1 bg-[#0f0f13] flex flex-col">
            {/* Top Bar */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/8">
              {/* Zoom Controls */}
              <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={handleZoomOut}
                      disabled={zoom <= 50}
                      className="p-1.5 rounded-md hover:bg-white/10 text-white/60 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ZoomOut className="w-3.5 h-3.5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Zoom Out</TooltipContent>
                </Tooltip>

                <button
                  onClick={handleZoomReset}
                  className="px-2.5 py-1 text-xs font-mono font-medium text-white/70 hover:text-white hover:bg-white/10 rounded-md transition-all min-w-14 text-center"
                >
                  {zoom}%
                </button>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={handleZoomIn}
                      disabled={zoom >= 200}
                      className="p-1.5 rounded-md hover:bg-white/10 text-white/60 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Zoom In</TooltipContent>
                </Tooltip>

                <Separator
                  orientation="vertical"
                  className="h-4 bg-white/10 mx-0.5"
                />

                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={handleZoomReset}
                      className="p-1.5 rounded-md hover:bg-white/10 text-white/60 hover:text-white transition-all"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Reset Zoom</TooltipContent>
                </Tooltip>
              </div>

              {/* Navigation pills */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={onPrevious}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-xs font-medium transition-all border border-white/8 hover:border-white/15"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  Prev
                </button>
                <button
                  onClick={onNext}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-xs font-medium transition-all border border-white/8 hover:border-white/15"
                >
                  Next
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Close */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={onClose}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-white/60 hover:text-white transition-all border border-white/8 hover:border-white/15"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>Close (Esc)</TooltipContent>
              </Tooltip>
            </div>

            {/* Document Preview */}
            <div className="flex-1 overflow-auto flex items-center justify-center p-8">
              {/* Subtle grid background */}
              <div
                className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{
                  backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
                  backgroundSize: "24px 24px",
                }}
              />

              <div
                className="relative transition-transform duration-200 ease-out"
                style={{ transform: `scale(${zoom / 100})` }}
              >
                {/* Paper shadow layers */}
                <div className="absolute -bottom-2 left-2 right-2 h-full bg-white/5 rounded-lg" />
                <div className="absolute -bottom-1 left-1 right-1 h-full bg-white/8 rounded-lg" />

                <div
                  className="relative bg-white rounded-lg overflow-hidden"
                  style={{
                    width: "480px",
                    aspectRatio: "8.5 / 11",
                    boxShadow:
                      "0 25px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)",
                  }}
                >
                  <img
                    src={template.fullPreview}
                    alt={template.name}
                    className="w-full h-full object-cover"
                    draggable={false}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-75 bg-white flex flex-col border-l border-gray-100">
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-4">
                {/* Header */}
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h2 className="text-base font-semibold text-gray-900 leading-tight tracking-tight">
                      {template.name}
                    </h2>
                    {template.isPremium && (
                      <Badge className="shrink-0 bg-amber-50 text-amber-700 border border-amber-200 font-medium text-xs px-2 py-0.5 rounded-full">
                        <Crown className="w-3 h-3 mr-1 fill-amber-500 text-amber-500" />
                        Premium
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
                    {template.description}
                  </p>
                </div>

                {/* Stats — inline row */}
                <div className="flex items-center gap-4 bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-100">
                  <div className="flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span className="text-sm font-semibold text-gray-900">
                      {template.rating}
                    </span>
                    <span className="text-xs text-gray-400">rating</span>
                  </div>
                  <div className="w-px h-4 bg-gray-200" />
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-sm font-semibold text-gray-900">
                      {template.usageCount.toLocaleString()}+
                    </span>
                    <span className="text-xs text-gray-400">users</span>
                  </div>
                </div>

                <Separator />

                {/* Features */}
                <div>
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Features
                  </h3>
                  <div className="space-y-1.5">
                    {Array.isArray(template.features) &&
                      template.features.map((feature, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <Check
                            className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5"
                            strokeWidth={2.5}
                          />
                          <span className="text-xs text-gray-600 leading-snug">
                            {feature}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>

                <Separator />

                {/* Best For */}
                <div>
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Best For
                  </h3>
                  <div className="flex flex-wrap gap-1">
                    {template.bestFor.map((role, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="bg-violet-50 text-violet-700 border border-violet-100 text-xs font-medium rounded-full px-2 py-0"
                      >
                        {role}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Category */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">Category:</span>
                  <Badge
                    variant="outline"
                    className="capitalize text-xs text-gray-600 border-gray-200 rounded-full px-2 py-0"
                  >
                    {template.category}
                  </Badge>
                </div>
              </div>
            </ScrollArea>

            {/* Bottom Actions — sticky */}
            <div className="p-3 border-t border-gray-100 bg-white space-y-2">
              {template.isPremium ? (
                <>
                  <div className="flex items-start gap-3 bg-amber-50 border border-amber-100 rounded-xl p-3.5 mb-3">
                    <Crown className="w-4 h-4 text-amber-500 shrink-0 mt-0.5 fill-amber-400" />
                    <div>
                      <p className="text-xs font-semibold text-gray-800 mb-0.5">
                        Premium Template
                      </p>
                      <p className="text-xs text-gray-500 leading-snug">
                        Upgrade to Pro to unlock all premium templates.
                      </p>
                    </div>
                  </div>
                  <Button className="w-full bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-sm shadow-amber-200 font-semibold text-sm h-10 rounded-xl transition-all hover:shadow-md hover:shadow-amber-200 border-0">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Upgrade to Pro
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full h-10 rounded-xl text-sm font-medium border-gray-200 text-gray-600 hover:bg-gray-50"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Sample
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold text-sm h-11 rounded-xl transition-all hover:shadow-lg hover:shadow-gray-900/20 border-0 group"
                    onClick={() => {
                      createNewResume(template.id, user?.id || "");
                      router.push(`/builder/${currentResume?.id}`);
                    }}
                  >
                    Use This Template
                    <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-0.5" />
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full h-10 rounded-xl text-sm font-medium border-gray-200 text-gray-600 hover:bg-gray-50"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Sample PDF
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
