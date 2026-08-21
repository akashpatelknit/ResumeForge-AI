import { getSeedResumeData } from "@/lib/seedResumeData";
import type { AppResume } from "@/types/resume";

// A representative AppResume for template-preview surfaces that have no
// real resume in context (the template picker grids, comparison view,
// marketing gallery) — feeds the same real react-pdf render used
// everywhere else (see components/pdf/PdfCanvasThumbnail.tsx) so these
// previews can never drift from what the template actually produces, the
// way a hand-copied HTML mock would.
export function buildSampleAppResume(templateId: string): AppResume {
  return {
    id: `sample-${templateId}`,
    userId: "sample",
    title: "Sample Resume",
    templateId,
    latexSource: null,
    readinessScore: null,
    readinessScoreDetails: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...getSeedResumeData(templateId),
  };
}
