import { createElement } from "react";
import { createClerkClient } from "@clerk/backend";
import { renderToBuffer } from "@react-pdf/renderer";
import { prisma } from "@/lib/prisma";
import { getResume } from "@/lib/db/resumes";
import { getUploadedResume, setUploadedResumeParsedText } from "@/lib/db/uploadedResumes";
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
import { AiRefusalError, AI_REFUSAL_MESSAGE } from "@/lib/ai/policy/refusal";
import { AiRateLimitError } from "@/lib/ai/rateLimit";
import { AiBlockedError, AiCreditsError } from "@/lib/credits/errors";
import type { ResumeContext } from "@/lib/ai/formatResumeContext";
import { buildResumeAttachmentFilename } from "@/lib/outreach/resumeAttachmentFilename";
import type { SavedJob } from "@/app/generated/prisma/client";
import type { AppResume } from "@/types/resume";

// The actual "send one scheduled outreach email" pipeline — extracted out of
// the old cron-poll route so both the BullMQ worker (worker/outreachWorker.ts,
// the primary trigger) and the Vercel route (app/api/cron/process-outreach-queue,
// now just a backstop for anything that failed to enqueue) call the exact
// same logic. No "server-only" import here on purpose: this module is also
// loaded by the standalone worker process, which isn't bundled by Next.js —
// see worker/outreachWorker.ts's comment on the `--conditions=react-server`
// flag that makes the *other* server-only-guarded modules this file imports
// (getValidAccessToken.ts, sendMail.ts, lib/credits/userCredits.ts, etc.)
// resolve correctly outside Next's bundler.
//
// Uses @clerk/backend's createClerkClient directly instead of
// @clerk/nextjs/server's clerkClient() — the latter's package resolves
// (under the react-server condition above) to a build that transitively
// imports next/navigation's App Router context, which only works inside
// Next's actual runtime and throws immediately in a plain Node process.
// @clerk/backend is the framework-agnostic SDK underneath it — same Backend
// API, no Next.js coupling — and works identically from a normal Next.js
// route too, so both callers of this module use the same client.
const clerkBackendClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

export async function markOutreachSendFailed(jobId: string, currentAttempts: number, message: string) {
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

export async function processOutreachSend(job: SavedJob) {
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
  // Kept alongside uploadedFile so the extraction step below can reuse a
  // cached parse (uploaded.parsedText) or persist a fresh one — the actual
  // PDF bytes still have to be fetched either way, for the email attachment.
  let uploadedResumeRow: { id: string; parsedText: string | null } | null = null;

  if (job.resumeSourceType === "uploaded") {
    if (!job.uploadedResumeId) {
      await markOutreachSendFailed(job.id, job.sendAttempts, "No resume was attached when this job was scheduled.");
      return;
    }
    const uploaded = await getUploadedResume(job.uploadedResumeId, job.userId);
    if (!uploaded) {
      await markOutreachSendFailed(job.id, job.sendAttempts, "The uploaded resume attached to this job no longer exists.");
      return;
    }
    uploadedResumeRow = { id: uploaded.id, parsedText: uploaded.parsedText };
    try {
      const fileRes = await fetch(uploaded.fileUrl);
      if (!fileRes.ok) throw new Error(`Blob fetch failed with status ${fileRes.status}`);
      uploadedFile = { buffer: Buffer.from(await fileRes.arrayBuffer()), fileName: uploaded.fileName };
    } catch (error) {
      console.error(`Failed to fetch uploaded resume for job ${job.id}:`, error);
      await markOutreachSendFailed(job.id, job.sendAttempts, "Failed to fetch the uploaded resume for this job.");
      return;
    }
  } else {
    if (!job.resumeId) {
      await markOutreachSendFailed(job.id, job.sendAttempts, "No resume was attached when this job was scheduled.");
      return;
    }
    const resumeRow = await getResume(job.resumeId, job.userId);
    if (!resumeRow) {
      await markOutreachSendFailed(job.id, job.sendAttempts, "The resume attached to this job no longer exists.");
      return;
    }
    builderResume = mapResumeFromDB(resumeRow);
  }

  if (!subject || !bodyText) {
    // No pre-check here — generateScheduledOutreachEmail below goes through
    // the AI Gateway (lib/ai/gateway.ts), which checks AI-access-block and
    // credit balance itself before calling Gemini, and throws AiBlockedError
    // / AiCreditsError if either gate fails (caught below).

    // Uploaded PDFs have no structured JSON to feed the prompt — extract
    // raw text from the same bytes fetched above (reusing the landing
    // page's parse-flow extraction, not a duplicate) and pass that instead,
    // unless a previous generation for this same upload already cached it.
    let resumeContext: ResumeContext;
    if (builderResume) {
      resumeContext = { kind: "structured", resume: builderResume };
    } else if (uploadedResumeRow?.parsedText) {
      resumeContext = { kind: "text", text: uploadedResumeRow.parsedText };
    } else {
      try {
        const file = new File([new Uint8Array(uploadedFile!.buffer)], uploadedFile!.fileName, { type: "application/pdf" });
        const text = await extractResumeText(file);
        resumeContext = { kind: "text", text };
        if (uploadedResumeRow) {
          setUploadedResumeParsedText(uploadedResumeRow.id, job.userId, text).catch((error) => {
            console.error(`Failed to cache parsed text for uploaded resume ${uploadedResumeRow!.id}:`, error);
          });
        }
      } catch (error) {
        if (!(error instanceof ResumeFileError)) {
          console.error(`Unexpected error reading uploaded resume for job ${job.id}:`, error);
        }
        const message = error instanceof ResumeFileError ? error.message : "Could not read the uploaded resume.";
        await markOutreachSendFailed(job.id, job.sendAttempts, message);
        return;
      }
    }

    try {
      const generated = await generateScheduledOutreachEmail(
        {
          companyName: job.company,
          roleTitle: job.jobTitle,
          jobDescription: job.jobDescription,
          resumeContext,
        },
        job.userId,
      );
      subject = generated.subject;
      bodyText = generated.body;

      await prisma.savedJob.update({
        where: { id: job.id },
        data: { generatedSubject: subject, generatedBody: bodyText },
      });
    } catch (error) {
      console.error(`Failed to generate outreach email for job ${job.id}:`, error);
      const message =
        error instanceof AiRefusalError
          ? AI_REFUSAL_MESSAGE
          : error instanceof AiRateLimitError || error instanceof AiCreditsError || error instanceof AiBlockedError
            ? error.message
            : "Failed to generate the outreach email.";
      await markOutreachSendFailed(job.id, job.sendAttempts, message);
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
    await markOutreachSendFailed(job.id, job.sendAttempts, message);
    return;
  }

  const gmailAccount = await prisma.gmailAccount.findUnique({ where: { userId: job.userId } });
  if (!gmailAccount) {
    await markOutreachSendFailed(job.id, job.sendAttempts, "Gmail not connected — connect it and retry from the dashboard.");
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
    // No active session in a background job, so the user is looked up by
    // id rather than via currentUser().
    const clerkUser = await clerkBackendClient.users.getUser(job.userId);
    resumeFilename = buildResumeAttachmentFilename(clerkUser.firstName, clerkUser.lastName);
  } else {
    try {
      const TemplateComponent = getTemplateComponent(builderResume!.templateId);
      pdfBuffer = await renderToBuffer(
        createElement(TemplateComponent, { resume: builderResume! }) as Parameters<typeof renderToBuffer>[0],
      );
    } catch (error) {
      console.error(`Failed to render resume PDF for job ${job.id}:`, error);
      await markOutreachSendFailed(job.id, job.sendAttempts, "Failed to generate the resume PDF for this send.");
      return;
    }
    resumeFilename = `${builderResume!.personalInfo.fullName || "Resume"} - Resume.pdf`;
  }

  const recipients = job.contactEmails.length > 0 ? job.contactEmails : [];
  if (recipients.length === 0) {
    await markOutreachSendFailed(job.id, job.sendAttempts, "No contact email on file for this job.");
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
