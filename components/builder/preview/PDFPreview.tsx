"use client";

import { Card } from "@/components/ui/card";
import { AppResume } from "@/types/resume";
import { pdf } from "@react-pdf/renderer";
import { useCallback, useEffect, useRef, useState } from "react";
import { getTemplateComponent } from "@/components/pdf/template";
import * as pdfjsLib from "pdfjs-dist";
import type { PDFDocumentLoadingTask, PDFDocumentProxy } from "pdfjs-dist";

// pdf.js needs its worker resolved as an asset URL — this pattern is what
// both webpack 5 and Turbopack understand for bundling a worker file.
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

// Rendered onto <canvas> via pdf.js instead of <object type="application/pdf">
// so we get full control over the viewer chrome — the browser's native PDF
// plugin (Chrome's black toolbar with its own zoom/page/print controls)
// can't be restyled or hidden reliably across browsers, so this replaces it
// entirely. Zoom is a controlled prop, driven by the ZoomControl rendered in
// the builder header — this component owns no controls of its own.
// Rendered at a higher resolution than the CSS size so zooming in and
// high-DPI screens stay crisp instead of upscaling a blurry raster.
const RENDER_SCALE = 2;

interface PDFPreviewProps {
  resume: AppResume | null;
  zoom: number;
}

export default function PDFPreview({ resume, zoom }: PDFPreviewProps) {
  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const canvasRefs = useRef<Map<number, HTMLCanvasElement>>(new Map());
  const loadingTaskRef = useRef<PDFDocumentLoadingTask | null>(null);

  useEffect(() => {
    if (!resume?.personalInfo) return;
    let cancelled = false;

    const timeout = setTimeout(async () => {
      try {
        setLoading(true);
        const TemplateComponent = getTemplateComponent(resume.templateId);
        const blob = await pdf(<TemplateComponent resume={resume} />).toBlob();
        const buffer = await blob.arrayBuffer();
        if (cancelled) return;

        const loadingTask = pdfjsLib.getDocument({ data: buffer });
        const doc = await loadingTask.promise;
        if (cancelled) {
          loadingTask.destroy();
          return;
        }

        loadingTaskRef.current?.destroy();
        loadingTaskRef.current = loadingTask;
        setPdfDoc(doc);
        setNumPages(doc.numPages);
      } catch (error) {
        console.error("Error generating PDF preview:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 600); // debounce delay

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [resume]);

  const renderPage = useCallback(
    async (pageNum: number) => {
      if (!pdfDoc) return;
      const canvas = canvasRefs.current.get(pageNum);
      if (!canvas) return;

      const page = await pdfDoc.getPage(pageNum);
      const viewport = page.getViewport({ scale: RENDER_SCALE * zoom });
      const context = canvas.getContext("2d");
      if (!context) return;

      canvas.width = viewport.width;
      canvas.height = viewport.height;
      canvas.style.width = `${viewport.width / RENDER_SCALE}px`;
      canvas.style.height = `${viewport.height / RENDER_SCALE}px`;

      await page.render({ canvasContext: context, viewport, canvas }).promise;
    },
    [pdfDoc, zoom],
  );

  useEffect(() => {
    if (!pdfDoc) return;
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      renderPage(pageNum);
    }
  }, [pdfDoc, numPages, renderPage]);

  useEffect(() => {
    return () => {
      loadingTaskRef.current?.destroy();
    };
  }, []);

  if (!resume) {
    return (
      <Card className="flex h-50 items-center justify-center bg-gray-50 p-6">
        <p className="text-gray-400">No resume data</p>
      </Card>
    );
  }

  if (loading && numPages === 0) {
    return (
      <Card className="flex h-full min-h-100 items-center justify-center bg-gray-50 p-6">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
          <p className="text-gray-400">Loading preview...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="flex h-full w-full flex-col overflow-hidden p-0">
      <div className="flex w-full flex-1 flex-col items-center gap-4 overflow-auto bg-gray-100 p-4">
        {Array.from({ length: numPages }, (_, i) => i + 1).map((pageNum) => (
          <canvas
            key={pageNum}
            ref={(el) => {
              if (el) canvasRefs.current.set(pageNum, el);
              else canvasRefs.current.delete(pageNum);
            }}
            className="max-w-full rounded-sm bg-white shadow-lg"
          />
        ))}
      </div>
    </Card>
  );
}
