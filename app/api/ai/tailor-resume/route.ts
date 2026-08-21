import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getResume } from "@/lib/db/resumes";
import { mapResumeFromDB } from "@/mapper/mapResumeFromDB";
import { generateTailorResume } from "@/lib/ai/generateTailorResume";
import { aiRouteErrorResponse } from "@/lib/ai/policy/refusal";

// Tailors a resume's wording/emphasis to a job description — reworded
// bullets and reordered skills only, never fabricated content (see
// lib/ai/buildTailorPrompt.ts). Returns the tailored fields only; it does
// NOT save or overwrite anything — saving as a new resume is a separate
// client-driven POST /api/resumes call once the user has accepted the
// changes they want (see components/dashboard/TailorResumeModal.tsx).
export async function POST(request: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const resumeIdValue = (body as { resumeId?: unknown })?.resumeId;
  const jobDescriptionValue = (body as { jobDescription?: unknown })
    ?.jobDescription;

  if (typeof resumeIdValue !== "string" || !resumeIdValue.trim()) {
    return NextResponse.json(
      { error: "resumeId is required" },
      { status: 400 },
    );
  }
  if (
    typeof jobDescriptionValue !== "string" ||
    !jobDescriptionValue.trim()
  ) {
    return NextResponse.json(
      { error: "jobDescription is required" },
      { status: 400 },
    );
  }

  const resumeId = resumeIdValue;
  const jobDescription = jobDescriptionValue;

  const resumeRow = await getResume(resumeId, userId);
  if (!resumeRow) {
    return NextResponse.json({ error: "Resume not found" }, { status: 404 });
  }
  const resume = mapResumeFromDB(resumeRow);

  try {
    const result = await generateTailorResume({ resume, jobDescription }, userId);
    return NextResponse.json({ result });
  } catch (error) {
    console.error("Resume tailoring failed:", error);
    return aiRouteErrorResponse(error, "Failed to tailor this resume. Please try again.");
  }
}
