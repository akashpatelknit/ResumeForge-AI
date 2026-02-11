"use client";

import { useEffect, useState } from "react";
import { useResumeStore } from "@/store/resumeStore";
import ResumeForm from "@/components/builder/ResumeForm";
import PDFPreview from "@/components/builder/preview/PDFPreview";
import BuilderToolbar from "@/components/builder/BuilderToolbar";

export default function BuilderPage({
  params,
}: {
  params: { resumeId: string };
}) {
  const { currentResume, setCurrentResume } = useResumeStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load resume data (for now, use mock data)
    const mockResume = {
      id: params.resumeId,
      title: "My Resume",
      templateId: "modern",
      personalInfo: {
        fullName: "",
        email: "",
        phone: "",
        location: "",
      },
      summary: "",
      experience: [],
      education: [],
      skills: [],
      projects: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setCurrentResume(mockResume);
    setIsLoading(false);
  }, [params.resumeId, setCurrentResume]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toolbar */}
      <BuilderToolbar />

      {/* Main Builder Interface */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Form Editor */}
          <div className="space-y-4">
            <ResumeForm />
          </div>

          {/* Right: PDF Preview */}
          <div className="sticky top-6 h-fit">
            <PDFPreview resume={currentResume} />
          </div>
        </div>
      </div>
    </div>
  );
}
