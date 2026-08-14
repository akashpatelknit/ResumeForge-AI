"use client";

import { Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import JobDescriptionAnalyzer from "@/components/builder/ai/JobDescriptionAnalyzer";

interface ATSScoreButtonProps {
  // The currently-open resume's id — null while it's still loading.
  resumeId: string | null;
}

// Entry point for checking the ATS match score without leaving the editor:
// opens the same JobDescriptionAnalyzer used on the dashboard's Job
// Analyzer page, in a side sheet, scoped to whichever resume is open here.
export default function ATSScoreButton({ resumeId }: ATSScoreButtonProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          size="lg"
          className="fixed bottom-6 left-6 z-50 bg-white text-gray-800 border border-gray-200 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200 rounded-full px-6 py-6 cursor-pointer"
        >
          <Target className="h-5 w-5 mr-2 text-blue-600" />
          <span className="font-semibold">Check ATS Score</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>ATS Match Score</SheetTitle>
          <SheetDescription>
            Paste a job description to see how well this resume matches.
          </SheetDescription>
        </SheetHeader>
        <div className="px-4 pb-6">
          <JobDescriptionAnalyzer resumeId={resumeId} layout="stack" />
        </div>
      </SheetContent>
    </Sheet>
  );
}
