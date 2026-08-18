import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getResume } from "@/lib/db/resumes";
import { mapResumeFromDB } from "@/mapper/mapResumeFromDB";
import { generateQuickApplyEmail } from "@/lib/ai/generateQuickApplyEmail";
import { checkAiGate, recordAiGeneration } from "@/lib/subscription/aiGate";
import { isValidEmailFormat, looksLikeGibberish } from "@/lib/validation/textSanity";
import { prisma } from "@/lib/prisma";

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

  const gate = await checkAiGate(userId);
  if (!gate.allowed) return gate.response;

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

  if (!recipientEmail || !isValidEmailFormat(recipientEmail)) {
    return NextResponse.json({ error: "A valid recipient email is required" }, { status: 400 });
  }
  if (!companyName || looksLikeGibberish(companyName)) {
    return NextResponse.json({ error: "Company name doesn't look valid — please check it" }, { status: 400 });
  }
  if (!roleTitle || looksLikeGibberish(roleTitle)) {
    return NextResponse.json({ error: "Role / position doesn't look valid — please check it" }, { status: 400 });
  }
  if (!resumeId) {
    return NextResponse.json({ error: "resumeId is required" }, { status: 400 });
  }

  const resumeRow = await getResume(resumeId, userId);
  if (!resumeRow) {
    return NextResponse.json({ error: "Resume not found" }, { status: 404 });
  }
  const resume = mapResumeFromDB(resumeRow);

  // Ownership check when regenerating an existing entry — never let one
  // user's entryId update another user's row.
  if (entryId) {
    const existing = await prisma.quickApplyEntry.findFirst({ where: { id: entryId, userId } });
    if (!existing) {
      return NextResponse.json({ error: "Quick Apply entry not found" }, { status: 404 });
    }
  }

  try {
    const { subject, body: emailBody } = await generateQuickApplyEmail({
      companyName,
      roleTitle,
      pastedContext: pastedContext || undefined,
      resume,
    });

    const fields = {
      recipientEmail,
      companyName,
      roleTitle,
      pastedContext: pastedContext || null,
      resumeId,
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

    await recordAiGeneration(userId, gate.plan);
    return NextResponse.json({ entryId: entry.id, subject, body: emailBody });
  } catch (error) {
    console.error("Quick Apply email generation failed:", error);
    return NextResponse.json({ error: "Failed to generate this email. Please try again." }, { status: 500 });
  }
}
