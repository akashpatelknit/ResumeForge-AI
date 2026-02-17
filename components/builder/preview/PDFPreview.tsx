"use client";

import { Card } from "@/components/ui/card";
import { AppResume, Resume } from "@/types/resume";
import { pdf } from "@react-pdf/renderer";
import ModernTemplate from "@/components/pdf/template/ModernTemplate";
import { useEffect, useState } from "react";

interface PDFPreviewProps {
  resume: AppResume | null;
}

export default function PDFPreview({ resume }: PDFPreviewProps) {
  const [pdfData, setPdfData] = useState<string>("");
  const [loading, setLoading] = useState(true);

  console.log("PDFPreview received resume:", pdfData);

  useEffect(() => {
    if (!resume) return;
    if (!resume?.personalInfo) return;

    const timeout = setTimeout(async () => {
      try {
        setLoading(true);

        const blob = await pdf(<ModernTemplate resume={resume} />).toBlob();

        const reader = new FileReader();

        reader.onloadend = () => {
          const base64data = reader.result as string;
          setPdfData(base64data);
        };

        reader.readAsDataURL(blob);
      } catch (error) {
        console.error("Error generating PDF:", error);
      } finally {
        setLoading(false);
      }
    }, 600); // debounce delay

    // cancel previous run
    return () => clearTimeout(timeout);
  }, [resume]);

  if (!resume) {
    return (
      <Card className="p-6 h-50 flex items-center justify-center bg-gray-50">
        <p className="text-gray-400">No resume data</p>
      </Card>
    );
  }

  if (loading || !pdfData) {
    return (
      <Card className="p-6 h-200 flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="text-gray-400">Loading preview...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-0 overflow-hidden">
      <div className="w-full h-200 flex items-center justify-center bg-gray-50">
        <div
          className="w-full h-full max-w-[210mm] bg-white rounded-lg shadow-xl overflow-hidden"
          style={{
            aspectRatio: "1 / 1.414", // A4 ratio
          }}
        >
          <object
            data={pdfData}
            type="application/pdf"
            className="w-full h-full"
            style={{
              border: "none",
              display: "block",
            }}
          >
            <embed
              src={pdfData}
              type="application/pdf"
              className="w-full h-full"
              style={{
                border: "none",
              }}
            />
          </object>
        </div>
      </div>
    </Card>
  );
}
