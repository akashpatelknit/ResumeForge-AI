import AtsCheckerPanel from "@/components/ats/AtsCheckerPanel";

// Standalone ATS Readiness Checker — a second, distinct score from the Job
// Match Score (app/(app)/dashboard/jobs/analyzer): this one scores resume
// structure/formatting/completeness generically, works with no job
// description at all, and works on both ResumeForge-built resumes and
// externally uploaded PDFs. See components/ats/AtsCheckerPanel.tsx for the
// actual flow.
export default function AtsCheckerPage() {
  return (
    <div className="min-h-screen">
      <div className="mb-4">
        <h1 className="text-xl font-bold text-gray-900">ATS Readiness Checker</h1>
        <p className="mt-0.5 text-sm text-gray-500">
          Check how ATS-parseable and complete a resume is — no job description required.
        </p>
      </div>

      <AtsCheckerPanel />
    </div>
  );
}
