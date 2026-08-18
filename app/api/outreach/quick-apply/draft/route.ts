import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getResume } from "@/lib/db/resumes";

// Not called out as one of the numbered routes in the original spec, but
// required by it ("'Save as Draft' persists the QuickApplyEntry with
// status 'draft'") — there was no other endpoint that could do this
// persistence. Deliberately skips the format/gibberish validation the
// generate endpoint applies: a draft is expected to hold incomplete or
// not-yet-checked fields.
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
  const resumeId = typeof b.resumeId === "string" ? b.resumeId.trim() : "";
  const subject = typeof b.subject === "string" ? b.subject.trim() : undefined;
  const emailBody = typeof b.body === "string" ? b.body.trim() : undefined;

  if (!resumeId) {
    return NextResponse.json({ error: "resumeId is required" }, { status: 400 });
  }

  const resumeRow = await getResume(resumeId, userId);
  if (!resumeRow) {
    return NextResponse.json({ error: "Resume not found" }, { status: 404 });
  }

  if (entryId) {
    const existing = await prisma.quickApplyEntry.findFirst({ where: { id: entryId, userId } });
    if (!existing) {
      return NextResponse.json({ error: "Quick Apply entry not found" }, { status: 404 });
    }
  }

  try {
    const fields = {
      recipientEmail,
      companyName,
      roleTitle,
      pastedContext: pastedContext || null,
      resumeId,
      status: "draft" as const,
      ...(subject !== undefined ? { generatedSubject: subject } : {}),
      ...(emailBody !== undefined ? { generatedBody: emailBody } : {}),
    };

    const entry = entryId
      ? await prisma.quickApplyEntry.update({ where: { id: entryId }, data: fields })
      : await prisma.quickApplyEntry.create({ data: { ...fields, userId } });

    return NextResponse.json({ entryId: entry.id });
  } catch (error) {
    console.error("Failed to save Quick Apply draft:", error);
    return NextResponse.json({ error: "Failed to save draft" }, { status: 500 });
  }
}
