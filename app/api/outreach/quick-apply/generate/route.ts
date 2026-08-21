import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getResume } from "@/lib/db/resumes";
import { getUploadedResume, setUploadedResumeParsedText } from "@/lib/db/uploadedResumes";
import { mapResumeFromDB } from "@/mapper/mapResumeFromDB";
import { extractUploadedResumeText } from "@/lib/textExtraction/extractUploadedResumeText";
import { ResumeFileError } from "@/lib/textExtraction/extractResumeText";
import { generateQuickApplyEmail } from "@/lib/ai/generateQuickApplyEmail";
import type { ResumeContext } from "@/lib/ai/formatResumeContext";
import { aiRouteErrorResponse } from "@/lib/ai/policy/refusal";
import { isValidEmailFormat, looksLikeGibberish } from "@/lib/validation/textSanity";
import { prisma } from "@/lib/prisma";

// extractUploadedResumeText → extractResumeText needs Node's Buffer API —
// not available on the edge runtime.
export const runtime = "nodejs";

// Resolves the "Resume to Attach" selection into (a) a ResumeContext for the
// AI prompt and (b) the resumeId/uploadedResumeId pair to persist on the
// QuickApplyEntry — shared by this route and draft/route.ts so the two
// don't disagree about what counts as a valid selection.
async function resolveResumeSelection(
  userId: string,
  resumeSourceType: "builder" | "uploaded",
  resumeId: string,
  uploadedResumeId: string,
): Promise<
  | { ok: true; resumeContext: ResumeContext; resumeId: string | null; uploadedResumeId: string | null }
  | { ok: false; status: number; error: string }
> {
  if (resumeSourceType === "uploaded") {
    if (!uploadedResumeId) {
      return { ok: false, status: 400, error: "uploadedResumeId is required" };
    }
    const uploaded = await getUploadedResume(uploadedResumeId, userId);
    if (!uploaded) {
      return { ok: false, status: 404, error: "Uploaded resume not found" };
    }

    let text: string;
    if (uploaded.parsedText) {
      // Already extracted on a previous generation for this same upload —
      // skip both the blob fetch and the PDF parse entirely.
      text = uploaded.parsedText;
    } else {
      try {
        text = await extractUploadedResumeText(uploaded.fileUrl, uploaded.fileName);
      } catch (error) {
        if (!(error instanceof ResumeFileError)) {
          console.error(`Unexpected error reading uploaded resume ${uploaded.id}:`, error);
        }
        const message = error instanceof ResumeFileError ? error.message : "Could not read the uploaded resume.";
        return { ok: false, status: 400, error: message };
      }

      // Best-effort cache write — a failure here shouldn't fail the request
      // that already has a perfectly good `text` result in hand.
      setUploadedResumeParsedText(uploaded.id, userId, text).catch((error) => {
        console.error(`Failed to cache parsed text for uploaded resume ${uploaded.id}:`, error);
      });
    }

    return {
      ok: true,
      resumeContext: { kind: "text", text },
      resumeId: null,
      uploadedResumeId: uploaded.id,
    };
  }

  if (!resumeId) {
    return { ok: false, status: 400, error: "resumeId is required" };
  }
  const resumeRow = await getResume(resumeId, userId);
  if (!resumeRow) {
    return { ok: false, status: 404, error: "Resume not found" };
  }

  return {
    ok: true,
    resumeContext: { kind: "structured", resume: mapResumeFromDB(resumeRow) },
    resumeId: resumeRow.id,
    uploadedResumeId: null,
  };
}

// Generates the email AND persists it as a QuickApplyEntry (status
// "generated") in one call. `entryId` is optional: pass the id returned by
// a previous call to this same endpoint (or by the draft endpoint) to
// regenerate in place rather than creating a new row per click — the
// frontend's "Regenerate" button in QuickApplyModal is expected to do this.
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

  const b = body as Record<string, unknown>;
  const entryId = typeof b.entryId === "string" && b.entryId.trim() ? b.entryId.trim() : undefined;
  const recipientEmail = typeof b.recipientEmail === "string" ? b.recipientEmail.trim() : "";
  const companyName = typeof b.companyName === "string" ? b.companyName.trim() : "";
  const roleTitle = typeof b.roleTitle === "string" ? b.roleTitle.trim() : "";
  const pastedContext = typeof b.pastedContext === "string" ? b.pastedContext.trim() : "";
  const resumeSourceType: "builder" | "uploaded" = b.resumeSourceType === "uploaded" ? "uploaded" : "builder";
  const resumeId = typeof b.resumeId === "string" ? b.resumeId.trim() : "";
  const uploadedResumeId = typeof b.uploadedResumeId === "string" ? b.uploadedResumeId.trim() : "";
  const messageType: "cold_application" | "referral_request" =
    b.messageType === "referral_request" ? "referral_request" : "cold_application";
  const jobId = typeof b.jobId === "string" ? b.jobId.trim() : "";

  if (!recipientEmail || !isValidEmailFormat(recipientEmail)) {
    return NextResponse.json({ error: "A valid recipient email is required" }, { status: 400 });
  }
  if (!companyName || looksLikeGibberish(companyName)) {
    return NextResponse.json({ error: "Company name doesn't look valid — please check it" }, { status: 400 });
  }
  if (!roleTitle || looksLikeGibberish(roleTitle)) {
    return NextResponse.json({ error: "Role / position doesn't look valid — please check it" }, { status: 400 });
  }

  const resolved = await resolveResumeSelection(userId, resumeSourceType, resumeId, uploadedResumeId);
  if (!resolved.ok) {
    return NextResponse.json({ error: resolved.error }, { status: resolved.status });
  }

  // Ownership check when regenerating an existing entry — never let one
  // user's entryId update another user's row.
  if (entryId) {
    const existing = await prisma.quickApplyEntry.findFirst({ where: { id: entryId, userId } });
    if (!existing) {
      return NextResponse.json({ error: "Quick Apply entry not found" }, { status: 404 });
    }
  }

  try {
    const { subject, body: emailBody } = await generateQuickApplyEmail(
      {
        companyName,
        roleTitle,
        pastedContext: pastedContext || undefined,
        resumeContext: resolved.resumeContext,
        messageType,
        jobId: jobId || undefined,
      },
      userId,
    );

    const fields = {
      recipientEmail,
      companyName,
      roleTitle,
      pastedContext: pastedContext || null,
      messageType,
      jobId: jobId || null,
      resumeSourceType,
      resumeId: resolved.resumeId,
      uploadedResumeId: resolved.uploadedResumeId,
      generatedSubject: subject,
      generatedBody: emailBody,
      status: "generated" as const,
    };

    const entry = entryId
      ? await prisma.quickApplyEntry.update({
          where: { id: entryId },
          data: { ...fields, errorMessage: null },
        })
      : await prisma.quickApplyEntry.create({
          data: { ...fields, userId },
        });

    return NextResponse.json({ entryId: entry.id, subject, body: emailBody });
  } catch (error) {
    console.error("Quick Apply email generation failed:", error);
    return aiRouteErrorResponse(error, "Failed to generate this email. Please try again.");
  }
}
