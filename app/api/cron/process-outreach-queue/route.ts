import "server-only";
import { createElement } from "react";
import { NextRequest, NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { prisma } from "@/lib/prisma";
import { getResume } from "@/lib/db/resumes";
import { getUploadedResume } from "@/lib/db/uploadedResumes";
import { mapResumeFromDB } from "@/mapper/mapResumeFromDB";
import { getTemplateComponent } from "@/components/pdf/template";
import { extractResumeText, ResumeFileError } from "@/lib/textExtraction/extractResumeText";
import {
  GmailNotConnectedError,
  GmailReauthRequiredError,
  getValidAccessToken,
} from "@/lib/gmail/getValidAccessToken";
import { GmailSendError, sendQuickApplyEmail } from "@/lib/gmail/sendMail";
import { generateScheduledOutreachEmail } from "@/lib/ai/generateScheduledOutreachEmail";
import type { ResumeContext } from "@/lib/ai/formatResumeContext";
import { buildResumeAttachmentFilename } from "@/lib/outreach/resumeAttachmentFilename";
import { checkAiGate, recordAiGeneration } from "@/lib/subscription/aiGate";
import type { SavedJob } from "@/app/generated/prisma/client";
import type { AppResume } from "@/types/resume";

// extractResumeText needs Node APIs (Buffer, pdf-parse) — not available on
// the edge runtime. This route already implicitly required Node via
// @react-pdf/renderer; stated explicitly now that a second Node-only
// dependency is in play.
export const runtime = "nodejs";
export const maxDuration = 120;

const BATCH_SIZE = 20;

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;

  const authHeader = request.headers.get("authorization");
  const bearer = authHeader?.match(/^Bearer\s+(.+)$/i)?.[1];
  const explicitHeader = request.headers.get("x-cron-secret");

  return bearer === secret || explicitHeader === secret;
}

async function markFailed(jobId: string, currentAttempts: number, message: string) {
  await prisma.savedJob.update({
    where: { id: jobId },
    data: {
      outreachStatus: "failed",
      sendAttempts: currentAttempts + 1,
      lastError: message,
      lastActivityAt: new Date(),
    },
  });
}

async function processEntry(job: SavedJob) {
  await prisma.savedJob.update({
    where: { id: job.id },
    data: { outreachStatus: "generating", lastActivityAt: new Date() },
  });

  let subject = job.generatedSubject;
  let bodyText = job.generatedBody;

  // Resolve the resume attachment source up front — a builder Resume row,
  // or the raw bytes of an uploaded PDF (fetched once here and reused
  // below both for AI context extraction and as the final email
  // attachment, rather than fetching the same blob twice).
  let builderResume: AppResume | null = null;
  let uploadedFile: { buffer: Buffer; fileName: string } | null = null;

  if (job.resumeSourceType === "uploaded") {
    if (!job.uploadedResumeId) {
      await markFailed(job.id, job.sendAttempts, "No resume was attached when this job was scheduled.");
      return;
    }
    const uploaded = await getUploadedResume(job.uploadedResumeId, job.userId);
    if (!uploaded) {
      await markFailed(job.id, job.sendAttempts, "The uploaded resume attached to this job no longer exists.");
      return;
    }
    try {
      const fileRes = await fetch(uploaded.fileUrl);
      if (!fileRes.ok) throw new Error(`Blob fetch failed with status ${fileRes.status}`);
      uploadedFile = { buffer: Buffer.from(await fileRes.arrayBuffer()), fileName: uploaded.fileName };
    } catch (error) {
      console.error(`Failed to fetch uploaded resume for job ${job.id}:`, error);
      await markFailed(job.id, job.sendAttempts, "Failed to fetch the uploaded resume for this job.");
      return;
    }
  } else {
    if (!job.resumeId) {
      await markFailed(job.id, job.sendAttempts, "No resume was attached when this job was scheduled.");
      return;
    }
    const resumeRow = await getResume(job.resumeId, job.userId);
    if (!resumeRow) {
      await markFailed(job.id, job.sendAttempts, "The resume attached to this job no longer exists.");
      return;
    }
    builderResume = mapResumeFromDB(resumeRow);
  }

  if (!subject || !bodyText) {
    const gate = await checkAiGate(job.userId);
    if (!gate.allowed) {
      await markFailed(job.id, job.sendAttempts, "AI generation limit reached for this month — upgrade or retry next month.");
      return;
    }

    // Uploaded PDFs have no structured JSON to feed the prompt — extract
    // raw text from the same bytes fetched above (reusing the landing
    // page's parse-flow extraction, not a duplicate) and pass that instead.
    let resumeContext: ResumeContext;
    if (builderResume) {
      resumeContext = { kind: "structured", resume: builderResume };
    } else {
      try {
        const file = new File([new Uint8Array(uploadedFile!.buffer)], uploadedFile!.fileName, { type: "application/pdf" });
        const text = await extractResumeText(file);
        resumeContext = { kind: "text", text };
      } catch (error) {
        const message = error instanceof ResumeFileError ? error.message : "Could not read the uploaded resume.";
        await markFailed(job.id, job.sendAttempts, message);
        return;
      }
    }

    try {
      const generated = await generateScheduledOutreachEmail({
        companyName: job.company,
        roleTitle: job.jobTitle,
        jobDescription: job.jobDescription,
        resumeContext,
      });
      subject = generated.subject;
      bodyText = generated.body;
      await recordAiGeneration(job.userId, gate.plan);

      await prisma.savedJob.update({
        where: { id: job.id },
        data: { generatedSubject: subject, generatedBody: bodyText },
      });
    } catch (error) {
      console.error(`Failed to generate outreach email for job ${job.id}:`, error);
      await markFailed(job.id, job.sendAttempts, "Failed to generate the outreach email.");
      return;
    }
  }

  await prisma.savedJob.update({
    where: { id: job.id },
    data: { outreachStatus: "sending", lastActivityAt: new Date() },
  });

  let accessToken: string;
  try {
    accessToken = await getValidAccessToken(job.userId);
  } catch (error) {
    const message =
      error instanceof GmailNotConnectedError
        ? "Gmail not connected — connect it and retry from the dashboard."
        : error instanceof GmailReauthRequiredError
          ? "Gmail connection expired — reconnect and retry from the dashboard."
          : "Failed to authorize with Gmail.";
    await markFailed(job.id, job.sendAttempts, message);
    return;
  }

  const gmailAccount = await prisma.gmailAccount.findUnique({ where: { userId: job.userId } });
  if (!gmailAccount) {
    await markFailed(job.id, job.sendAttempts, "Gmail not connected — connect it and retry from the dashboard.");
    return;
  }

  // Same branch as the AI context above: an uploaded PDF is already a file
  // (its bytes were fetched earlier) — skip PDF generation and attach that
  // directly instead of rendering a builder Resume.
  let pdfBuffer: Buffer;
  let resumeFilename: string;

  if (uploadedFile) {
    pdfBuffer = uploadedFile.buffer;
    // Renamed at send time to the account holder's name — same as the
    // Quick Apply send path (app/api/outreach/quick-apply/send/route.ts).
    // No active session in a cron job, so the user is looked up by id
    // rather than via currentUser().
    const clerkUser = await (await clerkClient()).users.getUser(job.userId);
    resumeFilename = buildResumeAttachmentFilename(clerkUser.firstName, clerkUser.lastName);
  } else {
    try {
      const TemplateComponent = getTemplateComponent(builderResume!.templateId);
      pdfBuffer = await renderToBuffer(
        createElement(TemplateComponent, { resume: builderResume! }) as Parameters<typeof renderToBuffer>[0],
      );
    } catch (error) {
      console.error(`Failed to render resume PDF for job ${job.id}:`, error);
      await markFailed(job.id, job.sendAttempts, "Failed to generate the resume PDF for this send.");
      return;
    }
    resumeFilename = `${builderResume!.personalInfo.fullName || "Resume"} - Resume.pdf`;
  }
  const recipients = job.contactEmails.length > 0 ? job.contactEmails : [];
  if (recipients.length === 0) {
    await markFailed(job.id, job.sendAttempts, "No contact email on file for this job.");
    return;
  }

  const messageIds: string[] = [];
  let lastSendError: string | null = null;

  for (const to of recipients) {
    try {
      const { messageId } = await sendQuickApplyEmail({
        accessToken,
        fromEmail: gmailAccount.email,
        to,
        subject,
        text: bodyText,
        attachment: { filename: resumeFilename, content: pdfBuffer, contentType: "application/pdf" },
      });
      messageIds.push(messageId);
    } catch (error) {
      const gmailError = error instanceof GmailSendError ? error : null;
      lastSendError = gmailError?.message ?? "Failed to send this email via Gmail.";
      console.error(`Failed to send outreach email for job ${job.id} to ${to}:`, error);
    }
  }

  if (messageIds.length === recipients.length) {
    await prisma.savedJob.update({
      where: { id: job.id },
      data: {
        outreachStatus: "sent",
        sentAt: new Date(),
        gmailMessageIds: messageIds,
        lastError: null,
        lastActivityAt: new Date(),
      },
    });
  } else {
    // Partial or total failure — record whatever succeeded but surface as
    // failed overall so the user sees it needs attention/manual retry.
    await prisma.savedJob.update({
      where: { id: job.id },
      data: {
        outreachStatus: "failed",
        sendAttempts: job.sendAttempts + 1,
        gmailMessageIds: messageIds,
        lastError: lastSendError ?? "Failed to send this email.",
        lastActivityAt: new Date(),
      },
    });
  }
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const due = await prisma.savedJob.findMany({
    where: { outreachStatus: "scheduled", scheduledSendTime: { lte: new Date() } },
    orderBy: { scheduledSendTime: "asc" },
    take: BATCH_SIZE,
  });

  const results = { processed: due.length, succeeded: 0, failed: 0 };

  for (const job of due) {
    try {
      await processEntry(job);
      const updated = await prisma.savedJob.findUnique({ where: { id: job.id }, select: { outreachStatus: true } });
      if (updated?.outreachStatus === "sent") results.succeeded++;
      else results.failed++;
    } catch (error) {
      console.error(`Unexpected error processing outreach job ${job.id}:`, error);
      try {
        await markFailed(job.id, job.sendAttempts, "Unexpected error while sending.");
      } catch (updateError) {
        console.error(`Failed to mark job ${job.id} as failed after an unexpected error:`, updateError);
      }
      results.failed++;
    }
  }

  return NextResponse.json(results);
}

// Also allow GET so the cron endpoint can be triggered/verified manually
// (e.g. from a browser or curl) without needing to craft a POST — Vercel
// Cron itself calls with GET by default.
export async function GET(request: NextRequest) {
  return POST(request);
}
