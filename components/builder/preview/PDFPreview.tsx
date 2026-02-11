"use client";

import { Card } from "@/components/ui/card";
import { Resume } from "@/types/resume";
import { PDFViewer } from "@react-pdf/renderer";
import ModernTemplate from "@/components/pdf/templates/ModernTemplate";

interface PDFPreviewProps {
  resume: Resume | null;
}

export default function PDFPreview({ resume }: PDFPreviewProps) {
  if (!resume) {
    return (
      <Card className="p-6 h-[800px] flex items-center justify-center">
        <p className="text-gray-400">No resume data</p>
      </Card>
    );
  }

  return (
    <Card className="p-4 overflow-hidden">
      <div className="mb-3">
        <h3 className="font-semibold text-sm text-gray-700">Live Preview</h3>
      </div>
      <div
        className="border rounded-lg overflow-hidden bg-white"
        style={{ height: "800px" }}
      >
        <PDFViewer width="100%" height="100%" showToolbar={false}>
          <ModernTemplate resume={resume} />
        </PDFViewer>
      </div>
    </Card>
  );
}
