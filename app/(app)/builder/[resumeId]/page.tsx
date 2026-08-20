"use client";

import { use, useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useResumeStore } from "@/store/resumeStore";
import { cn } from "@/lib/utils";
import ResumeForm from "@/components/builder/ResumeForm";
import PDFPreview from "@/components/builder/preview/PDFPreview";
import BuilderToolbar from "@/components/builder/BuilderToolbar";
import AIOptimizeButton from "@/components/builder/AIOptimizeButton";
import ATSScoreButton from "@/components/builder/ATSScoreButton";
import LayoutPanel from "@/components/builder/layout/LayoutPanel";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

/* ============================================================================
 * LaTeX editing mode — DISABLED HERE, NOT DELETED.
 *
 * Turned off at your request while you get familiar with the LaTeX side
 * separately. Nothing about the feature itself was touched or removed —
 * every file it depends on is untouched and still fully working:
 *
 *   lib/latex/generateLatexFromResume.ts   Form -> LaTeX (deterministic)
 *   lib/latex/extractResumeFromLatex.ts    LaTeX -> Form (via Gemini)
 *   lib/latex/compile.ts                   Tectonic compile backend
 *   lib/latex/templates/                   selectable .tex templates
 *   components/builder/latex/LatexEditor.tsx
 *   components/builder/latex/LatexPreviewPane.tsx
 *   hooks/useLatexAutoSave.ts
 *   app/api/compile-latex/route.ts
 *   app/api/ai/latex-to-resume/route.ts
 *
 * This file previously wired those into a Form/LaTeX toggle right here.
 * That exact wiring is preserved below as a comment so it can be restored
 * by uncommenting it and swapping the JSX back — nothing needs to be
 * rebuilt from scratch.
 *
 * ----------------------------------------------------------------------------
 *
 * import { use, useCallback, useEffect, useRef, useState } from "react";
 * import { useAuth } from "@clerk/nextjs";
 * import { toast } from "sonner";
 * import { Code2, FileText, LayoutTemplate, Loader2, Play } from "lucide-react";
 * import { cn } from "@/lib/utils";
 * import { Button } from "@/components/ui/button";
 * import {
 *   DropdownMenu,
 *   DropdownMenuContent,
 *   DropdownMenuItem,
 *   DropdownMenuTrigger,
 * } from "@/components/ui/dropdown-menu";
 * import { useResumeStore } from "@/store/resumeStore";
 * import { useDebounce } from "@/hooks/useDebounce";
 * import { useLatexAutoSave } from "@/hooks/useLatexAutoSave";
 * import ResumeForm from "@/components/builder/ResumeForm";
 * import BuilderToolbar from "@/components/builder/BuilderToolbar";
 * import AIOptimizeButton from "@/components/builder/AIOptimizeButton";
 * import LatexEditor from "@/components/builder/latex/LatexEditor";
 * import LatexPreviewPane from "@/components/builder/latex/LatexPreviewPane";
 * import { generateLatexFromResume } from "@/lib/latex/generateLatexFromResume";
 * import { LATEX_TEMPLATES, type LatexTemplateOption } from "@/lib/latex/templates";
 * import type { LatexDiagnostic } from "@/types/latex";
 * import type { AppResume } from "@/types/resume";
 *
 * type Mode = "form" | "latex";
 *
 * // Two editing modes for the same resume, sharing one PDF pipeline: the
 * // preview is ALWAYS produced by compiling LaTeX (via Tectonic,
 * // /api/compile-latex), never by @react-pdf/renderer, regardless of which
 * // editor is visible.
 * //
 * // Sync model — the mode toggle IS the sync trigger:
 * // - Switching Form -> LaTeX: nothing to do, latexSource is kept
 * //   continuously regenerated from form data while in Form mode (see the
 * //   debouncedResume effect below).
 * // - Switching LaTeX -> Form: the current (possibly hand-edited) LaTeX is
 * //   sent to Gemini to extract structured fields back into the form. This
 * //   direction is inherently best-effort — LaTeX is freeform text, not a
 * //   fixed schema — so custom formatting/macros that don't map onto the
 * //   form's fields are lost. We warn about this via toast rather than
 * //   pretending it's a lossless round-trip.
 * export default function BuilderPage({
 *   params,
 * }: {
 *   params: Promise<{ resumeId: string }>;
 * }) {
 *   const { currentResume, setCurrentResume, loadResume } = useResumeStore();
 *   const [isLoading, setIsLoading] = useState(true);
 *   const { userId } = useAuth();
 *   const { resumeId } = use(params);
 *
 *   const [mode, setModeState] = useState<Mode>("form");
 *   const [latexSource, setLatexSource] = useState("");
 *   const [isSyncingToForm, setIsSyncingToForm] = useState(false);
 *   const hasInitializedLatexRef = useRef(false);
 *
 *   const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
 *   const [isCompiling, setIsCompiling] = useState(false);
 *   const [compileError, setCompileError] = useState<string | null>(null);
 *   const [rawLog, setRawLog] = useState<string | null>(null);
 *   const [diagnostics, setDiagnostics] = useState<LatexDiagnostic[]>([]);
 *
 *   useEffect(() => {
 *     if (!userId) return;
 *     let cancelled = false;
 *
 *     const run = async () => {
 *       if (resumeId) {
 *         await loadResume(resumeId, userId);
 *       }
 *       if (!cancelled) setIsLoading(false);
 *     };
 *
 *     run();
 *     return () => {
 *       cancelled = true;
 *     };
 *     // eslint-disable-next-line react-hooks/exhaustive-deps
 *   }, [resumeId, userId]);
 *
 *   // Initialize latexSource exactly once, after the resume has loaded: reuse
 *   // a previously saved/hand-edited source if one exists, otherwise generate
 *   // a fresh one from the form data.
 *   useEffect(() => {
 *     if (!currentResume || hasInitializedLatexRef.current) return;
 *     hasInitializedLatexRef.current = true;
 *     const saved = currentResume.latexSource;
 *     setLatexSource(
 *       saved && saved.trim() ? saved : generateLatexFromResume(currentResume),
 *     );
 *   }, [currentResume]);
 *
 *   const debouncedResume = useDebounce(currentResume, 800);
 *
 *   // Form -> LaTeX: while in Form mode, keep latexSource regenerated from
 *   // the latest form data so the preview (and a future toggle to LaTeX
 *   // mode) always reflects what's in the form.
 *   useEffect(() => {
 *     if (mode !== "form" || !debouncedResume || !hasInitializedLatexRef.current) {
 *       return;
 *     }
 *     setLatexSource(generateLatexFromResume(debouncedResume));
 *   }, [debouncedResume, mode]);
 *
 *   const { isSaving: isSavingLatex, lastSaved } = useLatexAutoSave(
 *     resumeId,
 *     latexSource,
 *   );
 *
 *   const handleRecompile = useCallback(async (source: string) => {
 *     setIsCompiling(true);
 *     setCompileError(null);
 *     setRawLog(null);
 *
 *     try {
 *       const res = await fetch("/api/compile-latex", {
 *         method: "POST",
 *         headers: { "Content-Type": "application/json" },
 *         body: JSON.stringify({ latexCode: source }),
 *       });
 *
 *       if (res.ok) {
 *         const blob = await res.blob();
 *         setPdfBlob(blob);
 *         setDiagnostics([]);
 *         return;
 *       }
 *
 *       const errorBody = await res.json().catch(() => ({}));
 *       setCompileError(errorBody.error ?? "Compilation failed.");
 *       setRawLog(errorBody.rawLog ?? null);
 *       setDiagnostics(errorBody.diagnostics ?? []);
 *     } catch (error) {
 *       console.error("LaTeX compile request failed:", error);
 *       setCompileError("Could not reach the compile service.");
 *     } finally {
 *       setIsCompiling(false);
 *     }
 *   }, []);
 *
 *   // Single compile pipeline driving the preview, regardless of mode.
 *   const debouncedLatexSource = useDebounce(latexSource, 800);
 *   useEffect(() => {
 *     if (!debouncedLatexSource) return;
 *     handleRecompile(debouncedLatexSource);
 *   }, [debouncedLatexSource, handleRecompile]);
 *
 *   const handleModeChange = async (next: Mode) => {
 *     if (next === mode || isSyncingToForm) return;
 *
 *     if (next === "form") {
 *       setIsSyncingToForm(true);
 *       try {
 *         const res = await fetch("/api/ai/latex-to-resume", {
 *           method: "POST",
 *           headers: { "Content-Type": "application/json" },
 *           body: JSON.stringify({ latexCode: latexSource }),
 *         });
 *
 *         if (!res.ok) {
 *           const errorBody = await res.json().catch(() => ({}));
 *           throw new Error(errorBody.error ?? "Failed to sync form fields");
 *         }
 *
 *         const { result } = await res.json();
 *         if (currentResume) {
 *           setCurrentResume({ ...currentResume, ...result } as AppResume);
 *         }
 *         toast.warning(
 *           "Form fields updated from your LaTeX — please review. Custom LaTeX formatting isn't captured by the form.",
 *         );
 *       } catch (error) {
 *         console.error("Failed to sync form from LaTeX:", error);
 *         toast.error("Couldn't sync form fields from your LaTeX. Staying in LaTeX mode.");
 *         setIsSyncingToForm(false);
 *         return; // don't switch modes on failure — don't strand the user
 *       }
 *       setIsSyncingToForm(false);
 *     }
 *
 *     setModeState(next);
 *   };
 *
 *   const handleSelectTemplate = (template: LatexTemplateOption) => {
 *     const hasCustomContent =
 *       latexSource.trim().length > 0 &&
 *       !LATEX_TEMPLATES.some((t) => t.source === latexSource);
 *
 *     if (
 *       hasCustomContent &&
 *       !window.confirm(
 *         `Replace the current LaTeX with the "${template.name}" template? This can't be undone.`,
 *       )
 *     ) {
 *       return;
 *     }
 *
 *     setLatexSource(template.source);
 *   };
 *
 *   if (isLoading) {
 *     return (
 *       <div className="flex items-center justify-center min-h-screen">
 *         Loading...
 *       </div>
 *     );
 *   }
 *
 *   const modeToggle = (
 *     <div className="inline-flex rounded-lg border border-gray-200 p-0.5">
 *       <button
 *         onClick={() => handleModeChange("form")}
 *         disabled={isSyncingToForm}
 *         className={cn(
 *           "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-60",
 *           mode === "form"
 *             ? "bg-purple-600 text-white"
 *             : "text-gray-600 hover:bg-gray-100",
 *         )}
 *       >
 *         <FileText className="h-4 w-4" />
 *         Form
 *       </button>
 *       <button
 *         onClick={() => handleModeChange("latex")}
 *         disabled={isSyncingToForm}
 *         className={cn(
 *           "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-60",
 *           mode === "latex"
 *             ? "bg-purple-600 text-white"
 *             : "text-gray-600 hover:bg-gray-100",
 *         )}
 *       >
 *         <Code2 className="h-4 w-4" />
 *         LaTeX
 *       </button>
 *     </div>
 *   );
 *
 *   const statusText = isSyncingToForm ? (
 *     <span className="flex items-center gap-1.5 text-xs text-gray-500">
 *       <Loader2 className="h-3 w-3 animate-spin" />
 *       Syncing form fields from LaTeX...
 *     </span>
 *   ) : mode === "latex" ? (
 *     <span className="text-xs text-gray-400">
 *       {isSavingLatex
 *         ? "Saving..."
 *         : lastSaved
 *           ? `Saved ${lastSaved.toLocaleTimeString()}`
 *           : ""}
 *     </span>
 *   ) : (
 *     <span className="hidden text-xs text-gray-400 lg:inline">
 *       Preview compiles from LaTeX generated off your form fields
 *     </span>
 *   );
 *
 *   const toolbarCenter = (
 *     <>
 *       {modeToggle}
 *       {statusText}
 *     </>
 *   );
 *
 *   const toolbarEnd =
 *     mode === "latex" ? (
 *       <>
 *         <DropdownMenu>
 *           <DropdownMenuTrigger asChild>
 *             <Button variant="outline" size="sm">
 *               <LayoutTemplate className="mr-2 h-4 w-4" />
 *               Templates
 *             </Button>
 *           </DropdownMenuTrigger>
 *           <DropdownMenuContent align="end" className="w-64">
 *             {LATEX_TEMPLATES.map((template) => (
 *               <DropdownMenuItem
 *                 key={template.id}
 *                 onClick={() => handleSelectTemplate(template)}
 *                 className="flex-col items-start gap-0.5"
 *               >
 *                 <span className="font-medium">{template.name}</span>
 *                 <span className="text-xs text-gray-500">
 *                   {template.description}
 *                 </span>
 *               </DropdownMenuItem>
 *             ))}
 *           </DropdownMenuContent>
 *         </DropdownMenu>
 *
 *         <Button
 *           size="sm"
 *           onClick={() => handleRecompile(latexSource)}
 *           disabled={isCompiling}
 *           className="bg-linear-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700"
 *         >
 *           {isCompiling ? (
 *             <Loader2 className="mr-2 h-4 w-4 animate-spin" />
 *           ) : (
 *             <Play className="mr-2 h-4 w-4" />
 *           )}
 *           Recompile
 *         </Button>
 *       </>
 *     ) : null;
 *
 *   return (
 *     <div className="min-h-screen bg-gray-50">
 *       <BuilderToolbar centerSlot={toolbarCenter} endSlot={toolbarEnd} />
 *
 *       <div className="container mx-auto px-4 py-4">
 *         <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
 *           <div className="min-h-0">
 *             {mode === "form" ? (
 *               <ResumeForm />
 *             ) : (
 *               <div className="h-[75vh] overflow-hidden rounded-lg border bg-white">
 *                 <LatexEditor
 *                   value={latexSource}
 *                   onChange={setLatexSource}
 *                   diagnostics={diagnostics}
 *                   className="h-full"
 *                 />
 *               </div>
 *             )}
 *           </div>
 *
 *           <div className="sticky top-6 h-fit">
 *             <div className="h-full overflow-hidden rounded-lg border">
 *               <LatexPreviewPane
 *                 pdfBlob={pdfBlob}
 *                 isCompiling={isCompiling}
 *                 errorMessage={compileError}
 *                 rawLog={rawLog}
 *               />
 *             </div>
 *           </div>
 *         </div>
 *       </div>
 *
 *       <AIOptimizeButton />
 *     </div>
 *   );
 * }
 * ========================================================================= */

export default function BuilderPage({
  params,
}: {
  params: Promise<{ resumeId: string }>;
}) {
  const { currentResume, loadResume } = useResumeStore();
  const [isLoading, setIsLoading] = useState(true);
  const { userId } = useAuth();
  const { resumeId } = use(params);
  // Below lg there isn't room to show the form and the live preview at
  // once, so mobile/tablet gets a toggle instead of a stacked column —
  // both panels stay mounted (just hidden via CSS) so form/scroll state
  // survives switching back and forth.
  const [mobileView, setMobileView] = useState<"edit" | "preview">("edit");

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;

    const run = async () => {
      if (resumeId) {
        await loadResume(resumeId, userId);
      }
      if (!cancelled) setIsLoading(false);
    };

    run();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resumeId, userId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <BuilderToolbar
        mobilePreviewActive={mobileView === "preview"}
        onTogglePreview={() => setMobileView((v) => (v === "edit" ? "preview" : "edit"))}
      />

      <div className="container mx-auto px-4 py-4">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className={cn("space-y-4", mobileView === "preview" && "hidden lg:block")}>
            <Tabs defaultValue="content">
              <TabsList>
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="layout">Layout</TabsTrigger>
              </TabsList>
              <TabsContent value="content">
                <ResumeForm />
              </TabsContent>
              <TabsContent value="layout">
                <div className="rounded-xl border bg-white p-4">
                  <LayoutPanel />
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div className={cn("h-fit lg:sticky lg:top-6", mobileView === "edit" && "hidden lg:block")}>
            <PDFPreview resume={currentResume} />
          </div>
        </div>
      </div>

      <AIOptimizeButton />
      <ATSScoreButton resumeId={currentResume?.id ?? null} />
    </div>
  );
}
