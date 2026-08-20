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
// Rendered in the builder header (BuilderToolbar's endSlot) alongside every
// other preview/editor control, not as a floating page-level button.
export default function ATSScoreButton({ resumeId }: ATSScoreButtonProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          aria-label="Check ATS Score"
          className="cursor-pointer px-2 transition-colors duration-200 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 sm:px-3"
        >
          <Target className="h-4 w-4 text-blue-600" />
          {/* <span className="hidden font-medium sm:inline">ATS</span> */}
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
