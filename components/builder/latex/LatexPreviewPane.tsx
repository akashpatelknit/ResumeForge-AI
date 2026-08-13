"use client";

import { useEffect, useMemo } from "react";
import { AlertCircle, Loader2, FileText } from "lucide-react";

interface LatexPreviewPaneProps {
  pdfBlob: Blob | null;
  isCompiling: boolean;
  errorMessage: string | null;
  rawLog: string | null;
}

export default function LatexPreviewPane({
  pdfBlob,
  isCompiling,
  errorMessage,
  rawLog,
}: LatexPreviewPaneProps) {
  // @react-pdf/renderer (already a project dependency) renders React
  // components *to* a PDF — it isn't a viewer for an arbitrary compiled PDF
  // blob, and no PDF.js-based viewer package is installed. A native
  // <iframe src="blob:..."> renders PDFs directly in every evergreen
  // browser with zero extra dependencies, so that's what this uses.
  const blobUrl = useMemo(
    () => (pdfBlob ? URL.createObjectURL(pdfBlob) : null),
    [pdfBlob],
  );

  // Revocation is a side effect (freeing a browser resource), not state
  // derivation, so it belongs in its own effect rather than next to the
  // useMemo above.
  useEffect(() => {
    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [blobUrl]);

  return (
    <div className="relative flex h-full w-full flex-col bg-gray-100">
      {blobUrl && !errorMessage && (
        <iframe
          src={blobUrl}
          title="Compiled resume PDF"
          className="h-full w-full border-0"
        />
      )}

      {!blobUrl && !errorMessage && !isCompiling && (
        <div className="flex h-full flex-col items-center justify-center gap-2 text-gray-400">
          <FileText className="h-10 w-10" />
          <p className="text-sm">Compile to see your PDF preview</p>
        </div>
      )}

      {errorMessage && (
        <div className="flex h-full flex-col overflow-auto p-4">
          <div className="mb-3 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p className="text-sm font-semibold">Compilation failed</p>
              <p className="text-xs">{errorMessage}</p>
            </div>
          </div>
          {rawLog && (
            <pre className="whitespace-pre-wrap rounded-lg bg-gray-900 p-3 text-xs text-gray-100">
              {rawLog}
            </pre>
          )}
        </div>
      )}

      {isCompiling && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-[1px]">
          <div className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 shadow-lg">
            <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
            <span className="text-sm font-medium text-gray-700">
              Compiling...
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
