import "server-only";
import { google } from "googleapis";
// MailComposer isn't on nodemailer's main export — it's reached via this
// subpath. Used purely to build a correct RFC 822/2045 message (boundaries,
// base64 line-folding, headers) — no SMTP transport involved, nothing is
// sent through nodemailer itself. The actual send goes through Gmail's API.
import MailComposer from "nodemailer/lib/mail-composer";
import { createOAuthClient } from "@/lib/gmail/oauthClient";

export type GmailSendFailureReason = "reauth_required" | "rate_limited" | "invalid_recipient" | "unknown";

export class GmailSendError extends Error {
  reason: GmailSendFailureReason;
  constructor(message: string, reason: GmailSendFailureReason, cause?: unknown) {
    super(message);
    this.name = "GmailSendError";
    this.reason = reason;
    if (cause !== undefined) this.cause = cause;
  }
}

interface SendQuickApplyEmailParams {
  accessToken: string;
  fromEmail: string;
  to: string;
  subject: string;
  text: string;
  attachment: { filename: string; content: Buffer; contentType: string };
}

async function buildRawMessage(params: Omit<SendQuickApplyEmailParams, "accessToken">): Promise<string> {
  const composer = new MailComposer({
    from: params.fromEmail,
    to: params.to,
    subject: params.subject,
    text: params.text,
    attachments: [
      {
        filename: params.attachment.filename,
        content: params.attachment.content,
        contentType: params.attachment.contentType,
      },
    ],
  });

  const compiled = await composer.compile().build();

  // Gmail API requires the standard "URL-safe" base64 variant (RFC 4648 §5)
  // — no line breaks, `-`/`_` in place of `+`/`/`, no padding.
  return compiled.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function classifyGmailError(error: unknown): GmailSendFailureReason {
  const status =
    (error as { code?: number; response?: { status?: number } })?.response?.status ??
    (error as { code?: number })?.code;
  const message = (
    (error as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message ??
    (error instanceof Error ? error.message : "")
  ).toLowerCase();

  if (status === 401 || message.includes("invalid_grant") || message.includes("invalid credentials")) {
    return "reauth_required";
  }
  if (status === 429 || message.includes("rate limit") || message.includes("quota")) {
    return "rate_limited";
  }
  if (status === 400 && (message.includes("recipient") || message.includes("invalid to header"))) {
    return "invalid_recipient";
  }
  return "unknown";
}

export async function sendQuickApplyEmail(params: SendQuickApplyEmailParams): Promise<{ messageId: string }> {
  const raw = await buildRawMessage(params);

  const client = createOAuthClient();
  client.setCredentials({ access_token: params.accessToken });
  const gmail = google.gmail({ version: "v1", auth: client });

  try {
    const res = await gmail.users.messages.send({
      userId: "me",
      requestBody: { raw },
    });

    if (!res.data.id) {
      throw new GmailSendError("Gmail accepted the send but returned no message id", "unknown");
    }

    return { messageId: res.data.id };
  } catch (error) {
    if (error instanceof GmailSendError) throw error;
    const reason = classifyGmailError(error);
    const messages: Record<GmailSendFailureReason, string> = {
      reauth_required: "Your Gmail connection has expired — reconnect it and try again.",
      rate_limited: "Gmail rate limit reached — try again in a few minutes.",
      invalid_recipient: "Gmail rejected the recipient address — double-check it's valid.",
      unknown: "Failed to send this email via Gmail. Please try again.",
    };
    throw new GmailSendError(messages[reason], reason, error);
  }
}
