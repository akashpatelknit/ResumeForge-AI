import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import type { Prisma } from "@/app/generated/prisma/client";
import { getResume, setResumeReadinessScore } from "@/lib/db/resumes";
import { getUploadedResume, setUploadedResumeParsedText, setUploadedResumeReadinessScore } from "@/lib/db/uploadedResumes";
import { mapResumeFromDB } from "@/mapper/mapResumeFromDB";
import { extractUploadedResumeText } from "@/lib/textExtraction/extractUploadedResumeText";
import { ResumeFileError } from "@/lib/textExtraction/extractResumeText";
import { generateReadinessScore } from "@/lib/ai/generateReadinessScore";
import { aiRouteErrorResponse } from "@/lib/ai/policy/refusal";

// extractUploadedResumeText → extractResumeText needs Node's Buffer API —
// not available on the edge runtime.
export const runtime = "nodejs";

// ATS Readiness Score check — persists the "last checked" value directly on
// the Resume/UploadedResume row (readinessScore is null / "N/A" until this
// endpoint is explicitly called for that specific resume; there is no bulk
// or automatic scoring). Exactly one of resumeId / uploadedResumeId is
// accepted per call, mirroring the resumeSourceType pattern used across
// Quick Apply (see prisma/schema.prisma's ResumeSourceType).
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
  const uploadedResumeIdValue = (body as { uploadedResumeId?: unknown })?.uploadedResumeId;
  const jobDescriptionValue = (body as { jobDescription?: unknown })?.jobDescription;

  const resumeId = typeof resumeIdValue === "string" && resumeIdValue.trim() ? resumeIdValue : null;
  const uploadedResumeId =
    typeof uploadedResumeIdValue === "string" && uploadedResumeIdValue.trim() ? uploadedResumeIdValue : null;
  const jobDescription =
    typeof jobDescriptionValue === "string" && jobDescriptionValue.trim() ? jobDescriptionValue : undefined;

  if (!resumeId && !uploadedResumeId) {
    return NextResponse.json({ error: "resumeId or uploadedResumeId is required" }, { status: 400 });
  }
  if (resumeId && uploadedResumeId) {
    return NextResponse.json({ error: "Pass only one of resumeId or uploadedResumeId" }, { status: 400 });
  }

  let resumeInput: string | object;

  if (resumeId) {
    const resumeRow = await getResume(resumeId, userId);
    if (!resumeRow) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }
    resumeInput = mapResumeFromDB(resumeRow);
  } else {
    const uploaded = await getUploadedResume(uploadedResumeId!, userId);
    if (!uploaded) {
      return NextResponse.json({ error: "Uploaded resume not found" }, { status: 404 });
    }

    if (uploaded.parsedText) {
      resumeInput = uploaded.parsedText;
    } else {
      try {
        resumeInput = await extractUploadedResumeText(uploaded.fileUrl, uploaded.fileName);
      } catch (error) {
        if (!(error instanceof ResumeFileError)) {
          console.error(`Unexpected error reading uploaded resume ${uploaded.id}:`, error);
        }
        const message = error instanceof ResumeFileError ? error.message : "Could not read the uploaded resume.";
        return NextResponse.json({ error: message }, { status: 400 });
      }

      // Best-effort cache write, same as Quick Apply's generate route —
      // a failure here shouldn't fail a request that already has a good
      // `resumeInput` result in hand.
      setUploadedResumeParsedText(uploaded.id, userId, resumeInput).catch((error) => {
        console.error(`Failed to cache parsed text for uploaded resume ${uploaded.id}:`, error);
      });
    }
  }

  let result;
  try {
    result = await generateReadinessScore({ resume: resumeInput, jobDescription }, userId);
  } catch (error) {
    console.error("ATS readiness score check failed:", error);
    return aiRouteErrorResponse(error, "Failed to check this resume's ATS readiness. Please try again.");
  }

  const detailsJson = result as unknown as Prisma.InputJsonValue;

  try {
    if (resumeId) {
      await setResumeReadinessScore(resumeId, userId, result.score, detailsJson);
    } else {
      await setUploadedResumeReadinessScore(uploadedResumeId!, userId, result.score, detailsJson);
    }
  } catch (error) {
    // The score was computed successfully — still return it to the caller
    // even if persisting the "last checked" value failed, rather than
    // discarding a result the user is waiting on.
    console.error("Failed to persist ATS readiness score:", error);
  }

  return NextResponse.json({ result });
}
