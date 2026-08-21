"use client";

import { useEffect, useRef, useState } from "react";
import { pdf } from "@react-pdf/renderer";
import type { PDFDocumentLoadingTask } from "pdfjs-dist";
import { getTemplateComponent } from "@/components/pdf/template";
import { AppResume } from "@/types/resume";

// pdfjs-dist must NEVER be a static top-level import here: its build
// constructs `const SCALE_MATRIX = new DOMMatrix()` at module scope (not
// inside a function), so merely importing the module — even without
// calling anything in it — throws "DOMMatrix is not defined" the moment
// it's evaluated outside a browser. Next still evaluates a "use client"
// file's static imports during the server-side render pass (SSR/SSG) that
// produces the initial HTML, so a static import here crashed every page
// that (transitively) renders this component during prerendering. Loaded
// dynamically inside the client-only useEffect below instead, so the
// module is only ever evaluated in the browser, after mount.
let workerConfigured = false;

// Renders page 1 of the resume's *actual* PDF (via the same react-pdf →
// pdf.js → <canvas> pipeline as PDFPreview.tsx) at thumbnail size, instead
// of a hand-copied HTML/CSS approximation of the template that silently
// drifts out of sync whenever the real template changes. No zoom/paging —
// this is a static, small preview, so it strips those out.
const RENDER_SCALE = 1.5;
const DEBOUNCE_MS = 400;

interface PdfCanvasThumbnailProps {
  resume: AppResume;
  className?: string;
}

export default function PdfCanvasThumbnail({ resume, className = "" }: PdfCanvasThumbnailProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    let loadingTask: PDFDocumentLoadingTask | null = null;

    const timeout = setTimeout(async () => {
      try {
        setLoading(true);
        const TemplateComponent = getTemplateComponent(resume.templateId);
        const blob = await pdf(<TemplateComponent resume={resume} />).toBlob();
        const buffer = await blob.arrayBuffer();
        if (cancelled) return;

        const pdfjsLib = await import("pdfjs-dist");
        if (!workerConfigured) {
          pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
            "pdfjs-dist/build/pdf.worker.min.mjs",
            import.meta.url,
          ).toString();
          workerConfigured = true;
        }
        if (cancelled) return;

        loadingTask = pdfjsLib.getDocument({ data: buffer });
        const doc = await loadingTask.promise;
        if (cancelled) {
          loadingTask.destroy();
          return;
        }

        const page = await doc.getPage(1);
        const viewport = page.getViewport({ scale: RENDER_SCALE });
        const canvas = canvasRef.current;
        const context = canvas?.getContext("2d");
        if (!canvas || !context) return;

        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await page.render({ canvasContext: context, viewport, canvas }).promise;
      } catch (error) {
        console.error("Error rendering PDF thumbnail:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
      loadingTask?.destroy();
    };
  }, [resume]);

  return (
    <div className={`relative flex h-full w-full items-center justify-center overflow-hidden bg-white ${className}`}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
          <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-gray-300" />
        </div>
      )}
      <canvas ref={canvasRef} className="max-h-full max-w-full object-contain" />
    </div>
  );
}
