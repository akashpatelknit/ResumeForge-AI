import { createElement } from "react";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { prisma } from "@/lib/prisma";
import { getResume } from "@/lib/db/resumes";
import { mapResumeFromDB } from "@/mapper/mapResumeFromDB";
import { getTemplateComponent } from "@/components/pdf/template";
import {
  GmailNotConnectedError,
  GmailReauthRequiredError,
  getValidAccessToken,
} from "@/lib/gmail/getValidAccessToken";
import { GmailSendError, sendQuickApplyEmail } from "@/lib/gmail/sendMail";

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

  const quickApplyEntryId =
    typeof (body as { quickApplyEntryId?: unknown })?.quickApplyEntryId === "string"
      ? ((body as { quickApplyEntryId?: unknown }).quickApplyEntryId as string).trim()
      : "";

  if (!quickApplyEntryId) {
    return NextResponse.json({ error: "quickApplyEntryId is required" }, { status: 400 });
  }

  const entry = await prisma.quickApplyEntry.findFirst({
    where: { id: quickApplyEntryId, userId },
  });
  if (!entry) {
    return NextResponse.json({ error: "Quick Apply entry not found" }, { status: 404 });
  }
  if (!entry.generatedSubject || !entry.generatedBody) {
    return NextResponse.json({ error: "Generate the email before sending" }, { status: 400 });
  }

  // Resolve the Gmail token first — this is the most common failure mode
  // (never connected, or connection expired) and shouldn't cost a PDF
  // render if it's going to fail anyway.
  let accessToken: string;
  try {
    accessToken = await getValidAccessToken(userId);
  } catch (error) {
    if (error instanceof GmailNotConnectedError) {
      return NextResponse.json(
        { error: "Connect your Gmail account before sending.", code: "GMAIL_NOT_CONNECTED" },
        { status: 409 },
      );
    }
    if (error instanceof GmailReauthRequiredError) {
      await prisma.quickApplyEntry.update({
        where: { id: entry.id },
        data: { status: "failed", errorMessage: "Gmail connection expired — reconnect and try again." },
      });
      return NextResponse.json(
        { error: "Your Gmail connection expired. Reconnect it and try again.", code: "GMAIL_REAUTH_REQUIRED" },
        { status: 409 },
      );
    }
    console.error("Unexpected error resolving Gmail access token:", error);
    return NextResponse.json({ error: "Failed to authorize with Gmail." }, { status: 500 });
  }

  const gmailAccount = await prisma.gmailAccount.findUnique({ where: { userId } });
  if (!gmailAccount) {
    // Extremely unlikely given getValidAccessToken just succeeded, but the
    // row could theoretically be deleted between the two reads.
    return NextResponse.json(
      { error: "Connect your Gmail account before sending.", code: "GMAIL_NOT_CONNECTED" },
      { status: 409 },
    );
  }

  const resumeRow = await getResume(entry.resumeId, userId);
  if (!resumeRow) {
    return NextResponse.json({ error: "The resume attached to this entry no longer exists." }, { status: 404 });
  }
  const resume = mapResumeFromDB(resumeRow);

  let pdfBuffer: Buffer;
  try {
    const TemplateComponent = getTemplateComponent(resume.templateId);
    // Template components render a react-pdf <Document>, but their own
    // prop type is just { resume } — renderToBuffer's signature wants
    // ReactElement<DocumentProps> specifically (unlike the more permissive
    // `pdf()` helper PDFPreview.tsx uses client-side), hence the cast.
    pdfBuffer = await renderToBuffer(
      createElement(TemplateComponent, { resume }) as Parameters<typeof renderToBuffer>[0],
    );
  } catch (error) {
    console.error("Failed to render resume PDF for Quick Apply send:", error);
    return NextResponse.json({ error: "Failed to generate the resume PDF for this send." }, { status: 500 });
  }

  const resumeFilename = `${resume.personalInfo.fullName || "Resume"} - Resume.pdf`;

  try {
    const { messageId } = await sendQuickApplyEmail({
      accessToken,
      fromEmail: gmailAccount.email,
      to: entry.recipientEmail,
      subject: entry.generatedSubject,
      text: entry.generatedBody,
      attachment: { filename: resumeFilename, content: pdfBuffer, contentType: "application/pdf" },
    });

    await prisma.quickApplyEntry.update({
      where: { id: entry.id },
      data: { status: "sent", sentAt: new Date(), gmailMessageId: messageId, errorMessage: null },
    });

    return NextResponse.json({ ok: true, gmailMessageId: messageId });
  } catch (error) {
    const gmailError = error instanceof GmailSendError ? error : null;
    const reason = gmailError?.reason ?? "unknown";
    const message = gmailError?.message ?? "Failed to send this email. Please try again.";

    console.error("Quick Apply send failed:", error);

    await prisma.quickApplyEntry.update({
      where: { id: entry.id },
      data: { status: "failed", errorMessage: message },
    });

    const statusCode = reason === "rate_limited" ? 429 : reason === "invalid_recipient" ? 400 : 502;
    return NextResponse.json({ error: message, code: reason.toUpperCase() }, { status: statusCode });
  }
}
