"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  AlertCircle,
  AlertTriangle,
  Bookmark,
  Briefcase,
  Building2,
  CheckCircle2,
  ChevronDown,
  Hash,
  Loader2,
  Mail,
  RefreshCw,
  Send,
  Sparkles,
  UserSearch,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ResumeAttachPicker, type ResumeAttachValue } from "@/components/outreach/ResumeAttachPicker";

const JOB_CONTEXT_MAX = 2000;
const EXTRACT_DEBOUNCE_MS = 800;

type ExtractableField = "recipientEmail" | "companyName" | "roleTitle" | "jobId";
type GmailStatus = "loading" | "connected" | "not_connected" | "reauth_required";
type MessageType = "cold_application" | "referral_request";

export function QuickApplyModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  // ── Resume to attach (a Rezlo Resume or an uploaded PDF) ──
  const [resumeSelection, setResumeSelection] = useState<ResumeAttachValue | null>(null);

  // ── Gmail connection ──
  const [gmailStatus, setGmailStatus] = useState<GmailStatus>("loading");

  // ── Form fields ──
  const [recipientEmail, setRecipientEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [role, setRole] = useState("");
  const [jobContext, setJobContext] = useState("");
  const [jobId, setJobId] = useState("");
  const [messageType, setMessageType] = useState<MessageType>("cold_application");
  const [autoFilledFields, setAutoFilledFields] = useState<Set<ExtractableField>>(new Set());
  // Ref, not state — read inside the debounced extraction callback without
  // re-triggering that effect (which is keyed only on jobContext) every
  // time the user edits an unrelated field.
  const manuallyEditedRef = useRef<Set<ExtractableField>>(new Set());

  // ── Generation / entry lifecycle ──
  const [entryId, setEntryId] = useState<string | null>(null);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [hasGenerated, setHasGenerated] = useState(false);
  const [previewCollapsed, setPreviewCollapsed] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

  // ── Send / draft ──
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch("/api/gmail/status");
        const data = await res.json();
        if (cancelled) return;
        setGmailStatus(data.connected ? "connected" : (data.reason ?? "not_connected"));
      } catch (error) {
        console.error("Failed to check Gmail connection status:", error);
        if (!cancelled) setGmailStatus("not_connected");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // Debounced auto-extract from the pasted job post/context.
  useEffect(() => {
    const text = jobContext.trim();
    if (!text) return;

    const timeout = setTimeout(async () => {
      try {
        const res = await fetch("/api/outreach/quick-apply/extract", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pastedText: text }),
        });
        const data = await res.json();
        if (!res.ok) return;

        const result = data.result as {
          recipientEmail: string | null;
          companyName: string | null;
          roleTitle: string | null;
          jobId: string | null;
        };

        if (result.recipientEmail && !manuallyEditedRef.current.has("recipientEmail")) {
          setRecipientEmail(result.recipientEmail);
          setAutoFilledFields((prev) => new Set(prev).add("recipientEmail"));
        }
        if (result.companyName && !manuallyEditedRef.current.has("companyName")) {
          setCompanyName(result.companyName);
          setAutoFilledFields((prev) => new Set(prev).add("companyName"));
        }
        if (result.roleTitle && !manuallyEditedRef.current.has("roleTitle")) {
          setRole(result.roleTitle);
          setAutoFilledFields((prev) => new Set(prev).add("roleTitle"));
        }
        if (result.jobId && !manuallyEditedRef.current.has("jobId")) {
          setJobId(result.jobId);
          setAutoFilledFields((prev) => new Set(prev).add("jobId"));
        }
      } catch (error) {
        // Non-fatal — extraction is a convenience, never blocks manual entry.
        console.error("Quick Apply context extraction failed:", error);
      }
    }, EXTRACT_DEBOUNCE_MS);

    return () => clearTimeout(timeout);
  }, [jobContext]);

  function editField(field: ExtractableField, value: string, setter: (v: string) => void) {
    manuallyEditedRef.current.add(field);
    setAutoFilledFields((prev) => {
      if (!prev.has(field)) return prev;
      const next = new Set(prev);
      next.delete(field);
      return next;
    });
    setter(value);
  }

  // Referral Request only makes sense with a Job ID to reference — if one
  // was cleared (extracted then edited away, or typed then deleted) while
  // Referral was selected, fall back to Cold Application so the toggle
  // never silently shows a mode it can't actually generate.
  useEffect(() => {
    if (messageType === "referral_request" && !jobId.trim()) {
      setMessageType("cold_application");
    }
  }, [jobId, messageType]);

  const canGenerate =
    gmailStatus === "connected" &&
    recipientEmail.trim().length > 0 &&
    Boolean(resumeSelection) &&
    !isGenerating;

  async function handleGenerate() {
    if (!canGenerate) return;
    setIsGenerating(true);
    setGenerateError(null);
    try {
      const res = await fetch("/api/outreach/quick-apply/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entryId: entryId ?? undefined,
          recipientEmail,
          companyName,
          roleTitle: role,
          pastedContext: jobContext.trim() || undefined,
          messageType,
          jobId: jobId.trim() || undefined,
          resumeSourceType: resumeSelection?.resumeSourceType,
          resumeId: resumeSelection?.resumeSourceType === "builder" ? resumeSelection.resumeId : undefined,
          uploadedResumeId:
            resumeSelection?.resumeSourceType === "uploaded" ? resumeSelection.uploadedResumeId : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setGenerateError(data.error ?? "Failed to generate this email.");
        return;
      }
      setEntryId(data.entryId);
      setSubject(data.subject);
      setBody(data.body);
      setHasGenerated(true);
      setPreviewCollapsed(false);
      setSent(false);
      setSendError(null);
    } catch (error) {
      console.error("Quick Apply generate failed:", error);
      setGenerateError("Network error — please try again.");
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleSaveDraft() {
    if (!resumeSelection) return;
    setIsSavingDraft(true);
    try {
      const res = await fetch("/api/outreach/quick-apply/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entryId: entryId ?? undefined,
          recipientEmail,
          companyName,
          roleTitle: role,
          pastedContext: jobContext.trim() || undefined,
          messageType,
          jobId: jobId.trim() || undefined,
          resumeSourceType: resumeSelection.resumeSourceType,
          resumeId: resumeSelection.resumeSourceType === "builder" ? resumeSelection.resumeId : undefined,
          uploadedResumeId:
            resumeSelection.resumeSourceType === "uploaded" ? resumeSelection.uploadedResumeId : undefined,
          subject: subject || undefined,
          body: body || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Failed to save draft.");
        return;
      }
      setEntryId(data.entryId);
      toast.success("Saved as draft.");
      onOpenChange(false);
    } catch (error) {
      console.error("Quick Apply draft save failed:", error);
      toast.error("Network error — please try again.");
    } finally {
      setIsSavingDraft(false);
    }
  }

  async function handleSend() {
    if (!entryId) return;
    setIsSending(true);
    setSendError(null);
    try {
      const res = await fetch("/api/outreach/quick-apply/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quickApplyEntryId: entryId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSendError(data.error ?? "Failed to send this email.");
        if (data.code === "GMAIL_NOT_CONNECTED") setGmailStatus("not_connected");
        if (data.code === "GMAIL_REAUTH_REQUIRED") setGmailStatus("reauth_required");
        return;
      }
      setSent(true);
      toast.success("Application sent!");
      setTimeout(() => onOpenChange(false), 1200);
    } catch (error) {
      console.error("Quick Apply send failed:", error);
      setSendError("Network error — please try again.");
    } finally {
      setIsSending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="inset-0 h-screen w-screen max-w-none translate-x-0 translate-y-0 gap-0 overflow-y-auto rounded-none p-0 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:h-auto sm:max-h-[90vh] sm:w-full sm:max-w-3xl sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-6 py-5">
          <div className="flex items-center gap-3">
            <Mail className="h-6 w-6 shrink-0 text-brand-purple" />
            <div>
              <DialogTitle className="text-xl font-bold text-gray-900">Quick Apply</DialogTitle>
              <p className="text-sm text-gray-500">Apply fast to a one-off posting</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="cursor-pointer rounded-lg border-none bg-transparent p-3.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 sm:p-1.5"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6 px-6 py-5">
          {gmailStatus !== "connected" && gmailStatus !== "loading" && (
            <div className="flex flex-col items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                <div>
                  <p className="text-sm font-semibold text-amber-800">
                    {gmailStatus === "reauth_required" ? "Your Gmail connection expired" : "Connect Gmail to send applications"}
                  </p>
                  <p className="text-xs text-amber-700">
                    You can still fill in details and save a draft, but generating and sending need a connected Gmail account.
                  </p>
                </div>
              </div>
              <a
                href="/api/gmail/connect"
                className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-amber-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-amber-700"
              >
                <Mail className="h-3.5 w-3.5" />
                {gmailStatus === "reauth_required" ? "Reconnect Gmail" : "Connect Gmail"}
              </a>
            </div>
          )}

          {/* Top row */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <label className="text-sm font-semibold text-gray-900">
                  Recipient Email <span className="text-red-500">*</span>
                </label>
                {autoFilledFields.has("recipientEmail") && <AutoFilledTag />}
              </div>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => editField("recipientEmail", e.target.value, setRecipientEmail)}
                  placeholder="careers@acmecorp.com"
                  className={cn(
                    "w-full rounded-xl border py-2.5 pl-9 pr-3 text-sm text-gray-700 outline-none placeholder:text-gray-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-100",
                    autoFilledFields.has("recipientEmail") ? "border-purple-200 bg-purple-50/40" : "border-gray-200 bg-white",
                  )}
                />
              </div>
              <p className="mt-1.5 text-xs text-gray-400">We&apos;ll send your application to this email</p>
            </div>

            <div>
              <div className="mb-2 flex items-center gap-2">
                <label className="text-sm font-semibold text-gray-900">Company Name</label>
                {autoFilledFields.has("companyName") && <AutoFilledTag />}
              </div>
              <div className="relative">
                <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  value={companyName}
                  onChange={(e) => editField("companyName", e.target.value, setCompanyName)}
                  placeholder="Acme Corporation"
                  className={cn(
                    "w-full rounded-xl border py-2.5 pl-9 pr-3 text-sm text-gray-700 outline-none placeholder:text-gray-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-100",
                    autoFilledFields.has("companyName") ? "border-purple-200 bg-purple-50/40" : "border-gray-200 bg-white",
                  )}
                />
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center gap-2">
                <label className="text-sm font-semibold text-gray-900">Role / Position</label>
                {autoFilledFields.has("roleTitle") && <AutoFilledTag />}
              </div>
              <div className="relative">
                <Briefcase className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  value={role}
                  onChange={(e) => editField("roleTitle", e.target.value, setRole)}
                  placeholder="Frontend Developer"
                  className={cn(
                    "w-full rounded-xl border py-2.5 pl-9 pr-3 text-sm text-gray-700 outline-none placeholder:text-gray-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-100",
                    autoFilledFields.has("roleTitle") ? "border-purple-200 bg-purple-50/40" : "border-gray-200 bg-white",
                  )}
                />
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center gap-2">
                <label className="text-sm font-semibold text-gray-900">Job ID</label>
                <span className="text-xs font-normal text-gray-400">(optional)</span>
                {autoFilledFields.has("jobId") && <AutoFilledTag />}
              </div>
              <div className="relative">
                <Hash className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  value={jobId}
                  onChange={(e) => editField("jobId", e.target.value, setJobId)}
                  placeholder="REQ-12345"
                  className={cn(
                    "w-full rounded-xl border py-2.5 pl-9 pr-3 text-sm text-gray-700 outline-none placeholder:text-gray-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-100",
                    autoFilledFields.has("jobId") ? "border-purple-200 bg-purple-50/40" : "border-gray-200 bg-white",
                  )}
                />
              </div>
              <p className="mt-1.5 text-xs text-gray-400">Unlocks Referral Request mode</p>
            </div>
          </div>

          {/* Job post / context */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-900">
              Paste Job Post or Context <span className="font-normal text-gray-400">(optional)</span>
            </label>
            <div className="relative">
              <textarea
                value={jobContext}
                onChange={(e) => setJobContext(e.target.value.slice(0, JOB_CONTEXT_MAX))}
                maxLength={JOB_CONTEXT_MAX}
                rows={6}
                placeholder={`We're hiring a Frontend Developer to join our growing team!\n\nYou'll build modern web apps using React, TypeScript, and Tailwind CSS.\n\nIf you're excited about building delightful products, send your resume to careers@acmecorp.com\n\nLocation: Remote (India)`}
                className="w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm leading-relaxed text-gray-700 outline-none placeholder:text-gray-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
              />
              <span className="pointer-events-none absolute bottom-3 right-3 text-xs text-gray-400">
                {jobContext.length} / {JOB_CONTEXT_MAX}
              </span>
            </div>
          </div>

          {/* Resume to attach */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-900">
              Resume to Attach <span className="text-red-500">*</span>
            </label>
            <ResumeAttachPicker value={resumeSelection} onChange={setResumeSelection} />
            <p className="mt-1.5 text-xs text-gray-400">This resume will be attached to the email as a PDF</p>
          </div>

          {/* Message type */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-900">Message Type</label>
            <div className="grid grid-cols-2 gap-2 sm:max-w-md">
              <button
                type="button"
                onClick={() => setMessageType("cold_application")}
                className={cn(
                  "flex cursor-pointer items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-semibold transition-all",
                  messageType === "cold_application"
                    ? "border-brand-purple bg-purple-50 text-brand-purple shadow-sm"
                    : "border-gray-200 bg-white text-gray-500 hover:border-purple-200 hover:text-purple-600",
                )}
              >
                <Mail className="h-4 w-4" />
                Cold Application
              </button>
              <button
                type="button"
                onClick={() => jobId.trim() && setMessageType("referral_request")}
                disabled={!jobId.trim()}
                title={
                  jobId.trim()
                    ? undefined
                    : "No Job ID found in the pasted content — add one manually above, or use Cold Application"
                }
                className={cn(
                  "flex cursor-pointer items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-50",
                  messageType === "referral_request"
                    ? "border-brand-purple bg-purple-50 text-brand-purple shadow-sm"
                    : "border-gray-200 bg-white text-gray-500 hover:border-purple-200 hover:text-purple-600 disabled:hover:border-gray-200 disabled:hover:text-gray-500",
                )}
              >
                <UserSearch className="h-4 w-4" />
                Referral Request
              </button>
            </div>
            {messageType === "referral_request" && (
              <p className="mt-1.5 text-xs text-gray-400">
                Uses Job ID <span className="font-medium text-gray-600">{jobId}</span> in the email.
              </p>
            )}
          </div>

          {/* Generate Email */}
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={!canGenerate}
              className="inline-flex w-full shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl bg-linear-to-r from-purple-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-200 transition-all hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none sm:w-auto"
            >
              {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {isGenerating ? "Generating..." : "Generate Email"}
            </button>
            <p className="text-xs text-gray-400">
              We&apos;ll use AI to draft a personalized email using the details above.
            </p>
          </div>

          {generateError && (
            <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {generateError}
            </div>
          )}

          {/* Generated Email Preview */}
          {hasGenerated && (
            <div className="rounded-xl border border-gray-200">
              <div
                onClick={() => setPreviewCollapsed((v) => !v)}
                className="flex w-full cursor-pointer items-center justify-between px-4 py-3.5"
              >
                <span className="flex items-center gap-2.5">
                  <ChevronDown className={cn("h-4 w-4 text-gray-400 transition-transform", !previewCollapsed && "rotate-180")} />
                  <span className="text-sm font-semibold text-gray-900">Generated Email Preview</span>
                  <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                    Generated
                  </span>
                </span>
                <span className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      void handleGenerate();
                    }}
                    disabled={isGenerating}
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <RefreshCw className={cn("h-3.5 w-3.5", isGenerating && "animate-spin")} />
                    Regenerate
                  </button>
                  <ChevronDown className={cn("h-4 w-4 text-gray-400 transition-transform", !previewCollapsed && "rotate-180")} />
                </span>
              </div>

              {!previewCollapsed && (
                <div className="space-y-3 border-t border-gray-100 px-4 py-4">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-semibold text-gray-900 shrink-0">Subject:</span>
                    <input
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="flex-1 rounded-lg border border-transparent bg-transparent px-1 py-0.5 text-gray-700 outline-none hover:border-gray-200 focus:border-purple-300 focus:bg-white focus:ring-2 focus:ring-purple-100"
                    />
                  </div>
                  <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    rows={9}
                    className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm leading-relaxed text-gray-700 outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-100"
                  />
                </div>
              )}
            </div>
          )}

          {sendError && (
            <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {sendError}
            </div>
          )}

          {sent && (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              Sent successfully.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-col items-end gap-1.5 border-t border-gray-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={isSavingDraft || !resumeSelection}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSavingDraft ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bookmark className="h-4 w-4" />}
              Save as Draft
            </button>
            <button
              type="button"
              onClick={handleSend}
              disabled={!hasGenerated || !entryId || isSending || gmailStatus !== "connected" || sent}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-brand-purple px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-purple-200 hover:bg-brand-purple/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {isSending ? "Sending..." : "Send Now"}
            </button>
          </div>
          <p className="text-xs text-gray-400">This will send immediately from your connected email</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function AutoFilledTag() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-medium text-brand-purple">
      <Sparkles className="h-2.5 w-2.5" />
      Auto-filled
    </span>
  );
}
