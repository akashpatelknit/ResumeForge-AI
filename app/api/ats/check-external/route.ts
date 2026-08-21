import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { extractResumeText, ResumeFileError } from "@/lib/textExtraction/extractResumeText";
import { generateReadinessScore } from "@/lib/ai/generateReadinessScore";
import { aiRouteErrorResponse } from "@/lib/ai/policy/refusal";

// Needs Buffer/File — same reasoning as app/api/resumes/upload/route.ts.
export const runtime = "nodejs";

// ATS Readiness Score check for a resume the user hasn't saved to their
// account at all — a raw PDF upload that's scored and discarded, never
// persisted here. If they want the score attached to a saved record, they
// upload via the existing /api/resumes/upload endpoint first, then check it
// through /api/ats/check with the resulting uploadedResumeId instead.
export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const jobDescriptionValue = formData.get("jobDescription");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file was uploaded." }, { status: 400 });
  }

  const jobDescription =
    typeof jobDescriptionValue === "string" && jobDescriptionValue.trim() ? jobDescriptionValue : undefined;

  let text: string;
  try {
    text = await extractResumeText(file);
  } catch (error) {
    if (!(error instanceof ResumeFileError)) {
      console.error("Unexpected error reading uploaded PDF for ATS check:", error);
    }
    const message = error instanceof ResumeFileError ? error.message : "Could not read this file.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  let result;
  try {
    result = await generateReadinessScore({ resume: text, jobDescription }, userId);
  } catch (error) {
    console.error("ATS readiness score check (external) failed:", error);
    return aiRouteErrorResponse(error, "Failed to check this resume's ATS readiness. Please try again.");
  }

  return NextResponse.json({ result });
}
