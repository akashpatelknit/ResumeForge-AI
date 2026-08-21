import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getResume, getResumeAnalytics, trackEvent } from "@/lib/db/resumes";
import { mapResumeFromDB } from "@/mapper/mapResumeFromDB";
import { generateAnalyzeJd } from "@/lib/ai/generateAnalyzeJd";
import { aiRouteErrorResponse } from "@/lib/ai/policy/refusal";

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

  // Read prior history BEFORE writing this run's event, so "previous score"
  // reflects the last *completed* check, not the one we're about to save.
  let previousScore: number | null = null;
  try {
    const priorEvents = await getResumeAnalytics(resumeId);
    const priorAts = priorEvents.find((e) => e.eventType === "ats_analysis");
    const priorData = priorAts?.eventData as { score?: unknown } | null;
    if (typeof priorData?.score === "number") {
      previousScore = priorData.score;
    }
  } catch (error) {
    console.error("Failed to load prior ATS analytics:", error);
    // Non-fatal — proceed without a "previous score" comparison.
  }

  let result;
  try {
    result = await generateAnalyzeJd({ resume, jobDescription }, userId);
  } catch (error) {
    console.error("ATS analysis failed:", error);
    return aiRouteErrorResponse(error, "Failed to analyze this job description. Please try again.");
  }

  try {
    await trackEvent(resumeId, "ats_analysis", {
      ...result,
      jobDescription,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    // Saving history is best-effort — don't fail a request the user is
    // waiting on just because the analytics write failed.
    console.error("Failed to save ATS analysis event:", error);
  }

  return NextResponse.json({ result, previousScore });
}
