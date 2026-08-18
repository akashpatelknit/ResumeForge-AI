"use client";

import { useState } from "react";
import { ChevronDown, Lock, RefreshCw, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { CompanyLogo } from "@/components/outreach/OutreachBadges";
import { RichTextEditor } from "@/components/outreach/RichTextEditor";
import {
  MOCK_JD_SUMMARY,
  MOCK_RESUMES,
  OUTREACH_TYPE_LABELS,
  generateMockEmailHtml,
  type OutreachEntry,
  type OutreachType,
} from "@/components/outreach/outreachData";

// Quick Apply now has its own dedicated flow (components/outreach/
// QuickApplyModal.tsx, with real generate/send wiring) — it's deliberately
// left out of this panel's segmented control so it isn't offered twice.
const OUTREACH_TYPES: OutreachType[] = ["cold", "general", "referral"];
const TONES = ["Formal", "Casual", "Friendly"] as const;
const LENGTHS = ["Short", "Medium", "Detailed"] as const;

function EmailChips({ emails, onRemove }: { emails: string[]; onRemove: (email: string) => void }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-gray-200 bg-gray-50 p-2">
      {emails.map((email) => (
        <span
          key={email}
          className="inline-flex items-center gap-1.5 rounded-lg bg-white border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-700 shadow-xs"
        >
          {email}
          <button
            type="button"
            onClick={() => onRemove(email)}
            className="cursor-pointer rounded-sm border-none bg-transparent p-0 text-gray-400 hover:text-gray-600"
            aria-label={`Remove ${email}`}
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      {emails.length === 0 && (
        <span className="px-1 py-1 text-xs text-gray-400">No recruiter emails added</span>
      )}
    </div>
  );
}

export function GenerateEmailPanel({
  open,
  onOpenChange,
  entry,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry: OutreachEntry | null;
}) {
  // Initializers read `entry` directly rather than syncing via effect — the
  // parent remounts this component (key={entry.id}) whenever a different
  // row's panel opens, so a fresh initial state per entry is all that's
  // needed instead of an effect that re-derives state on every prop change.
  // A row whose type is "quickApply" (still a valid table/badge category on
  // the dashboard) has no tab here anymore — fall back to "cold" rather
  // than initializing to a value none of the segmented buttons represent.
  const [outreachType, setOutreachType] = useState<OutreachType>(
    entry?.outreachType && OUTREACH_TYPES.includes(entry.outreachType) ? entry.outreachType : "cold",
  );
  const [emails, setEmails] = useState<string[]>(entry?.emails ?? []);
  const [jobId, setJobId] = useState(entry?.jobId ?? "");
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [resumeOpen, setResumeOpen] = useState(false);
  const [selectedResumeId, setSelectedResumeId] = useState(MOCK_RESUMES[0].id);
  const [subject, setSubject] = useState(entry ? `Application for ${entry.role} – Akash Patel` : "");
  const [body, setBody] = useState(() => generateMockEmailHtml());
  const [tone, setTone] = useState<(typeof TONES)[number]>("Formal");
  const [length, setLength] = useState<(typeof LENGTHS)[number]>("Medium");

  const showEmailField = outreachType !== "referral";
  const plainTextBody = body.replace(/<[^>]+>/g, " ").trim();
  const wordCount = plainTextBody.length === 0 ? 0 : plainTextBody.split(/\s+/).length;
  const selectedResume = MOCK_RESUMES.find((r) => r.id === selectedResumeId) ?? MOCK_RESUMES[0];

  if (!entry) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="w-full gap-0 overflow-y-auto p-0 sm:max-w-2xl"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-6 py-5">
          <div className="flex items-center gap-3">
            <CompanyLogo company={entry.company} size="lg" />
            <div>
              <h2 className="text-lg font-bold text-gray-900">{entry.company}</h2>
              <p className="text-sm text-gray-500">{entry.role}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="cursor-pointer rounded-lg border-none bg-transparent p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            aria-label="Close panel"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-6 px-6 py-5">
          {/* Outreach Type */}
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-500">
              Outreach Type
            </label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {OUTREACH_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setOutreachType(type)}
                  className={cn(
                    "cursor-pointer rounded-xl border px-3 py-2.5 text-xs font-semibold transition-all",
                    outreachType === type
                      ? "border-brand-purple bg-purple-50 text-brand-purple shadow-sm"
                      : "border-gray-200 bg-white text-gray-500 hover:border-purple-200 hover:text-purple-600",
                  )}
                >
                  {OUTREACH_TYPE_LABELS[type]}
                </button>
              ))}
            </div>
          </div>

          {/* Conditional fields */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_220px]">
            {showEmailField ? (
              <div>
                <label className="mb-2 block text-xs font-semibold text-gray-700">
                  Recruiter Email(s) <span className="text-red-500">*</span>
                </label>
                <p className="mb-1.5 text-xs text-gray-400">Add one or more recruiter or hiring manager emails</p>
                <EmailChips emails={emails} onRemove={(email) => setEmails((prev) => prev.filter((e) => e !== email))} />
              </div>
            ) : (
              <div className="hidden sm:block" />
            )}

            <div>
              <label className="mb-2 block text-xs font-semibold text-gray-700">Job ID / Req ID</label>
              <p className="mb-1.5 text-xs text-gray-400">(For Referral type only)</p>
              <div className="relative">
                <input
                  value={jobId}
                  onChange={(e) => setJobId(e.target.value)}
                  disabled={outreachType !== "referral"}
                  placeholder="e.g., REQ-123456"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 pr-9 text-sm text-gray-700 outline-none placeholder:text-gray-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 disabled:cursor-not-allowed disabled:opacity-60"
                />
                {outreachType !== "referral" && (
                  <Lock className="absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                )}
              </div>
            </div>
          </div>

          {!showEmailField && (
            <div className="-mt-2">
              <label className="mb-2 block text-xs font-semibold text-gray-700">
                Recruiter Email(s) <span className="text-red-500">*</span>
              </label>
              <EmailChips emails={emails} onRemove={(email) => setEmails((prev) => prev.filter((e) => e !== email))} />
            </div>
          )}

          {/* Job Description Summary */}
          <div className="rounded-xl border border-gray-200">
            <button
              type="button"
              onClick={() => setSummaryOpen((v) => !v)}
              className="flex w-full cursor-pointer items-center justify-between border-none bg-transparent px-4 py-3 text-left"
            >
              <span className="text-sm font-semibold text-gray-800">Job Description Summary</span>
              <span className="flex items-center gap-2">
                <span className="rounded-lg bg-brand-purple px-3 py-1.5 text-xs font-semibold text-white">
                  {summaryOpen ? "Hide Summary" : "Show Summary"}
                </span>
                <ChevronDown className={cn("h-4 w-4 text-gray-400 transition-transform", summaryOpen && "rotate-180")} />
              </span>
            </button>
            {summaryOpen && (
              <div className="border-t border-gray-100 px-4 py-3">
                <p className="text-sm leading-relaxed text-gray-600">{MOCK_JD_SUMMARY}</p>
              </div>
            )}
          </div>

          {/* Resume to Attach */}
          <div>
            <label className="mb-2 block text-xs font-semibold text-gray-700">Resume to Attach</label>
            <p className="mb-1.5 text-xs text-gray-400">This resume will be referenced in the email.</p>
            <div className="relative">
              <button
                type="button"
                onClick={() => setResumeOpen((v) => !v)}
                className="flex w-full cursor-pointer items-center gap-2.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-left hover:border-purple-200"
              >
                <span className="flex-1 truncate text-sm font-medium text-gray-700">{selectedResume.name}</span>
                {selectedResume.aiSuggested && (
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-purple-50 px-2 py-0.5 text-[11px] font-medium text-brand-purple">
                    <Sparkles className="h-3 w-3" />
                    AI suggested
                  </span>
                )}
                <ChevronDown className={cn("h-4 w-4 shrink-0 text-gray-400 transition-transform", resumeOpen && "rotate-180")} />
              </button>
              {resumeOpen && (
                <div className="absolute left-0 right-0 top-full z-10 mt-1.5 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
                  {MOCK_RESUMES.map((resume) => (
                    <button
                      key={resume.id}
                      type="button"
                      onClick={() => {
                        setSelectedResumeId(resume.id);
                        setResumeOpen(false);
                      }}
                      className={cn(
                        "flex w-full cursor-pointer items-center gap-2 border-none px-3.5 py-2.5 text-left text-sm transition-colors",
                        resume.id === selectedResumeId ? "bg-purple-50 text-brand-purple" : "bg-white text-gray-700 hover:bg-gray-50",
                      )}
                    >
                      <span className="flex-1 truncate">{resume.name}</span>
                      {resume.aiSuggested && (
                        <span className="shrink-0 text-[11px] font-medium text-brand-purple">AI suggested</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* AI Generated Email */}
          <div className="rounded-xl border border-gray-200 p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-gray-800">AI Generated Email</h3>
                <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2 py-0.5 text-[11px] font-medium text-brand-purple">
                  <Sparkles className="h-3 w-3" />
                  Generated with Gemini
                </span>
              </div>
              <button
                type="button"
                onClick={() => setBody(generateMockEmailHtml())}
                className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Regenerate
              </button>
            </div>

            <label className="mb-1.5 block text-xs font-semibold text-gray-500">
              Subject <span className="text-red-500">*</span>
            </label>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="mb-4 w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm font-medium text-gray-800 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
            />

            <label className="mb-1.5 block text-xs font-semibold text-gray-500">
              Email Body <span className="text-red-500">*</span>
            </label>
            <RichTextEditor value={body} onChange={setBody} />
            <p className="mt-1.5 text-xs text-gray-400">{wordCount} words</p>
          </div>

          {/* Tone */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs font-semibold text-gray-700">Tone</label>
              <div className="flex gap-2">
                {TONES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTone(t)}
                    className={cn(
                      "flex-1 cursor-pointer rounded-lg border px-3 py-2 text-xs font-semibold transition-all",
                      tone === t
                        ? "border-brand-purple bg-purple-50 text-brand-purple"
                        : "border-gray-200 bg-white text-gray-500 hover:border-purple-200",
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold text-gray-700">Length</label>
              <div className="flex gap-2">
                {LENGTHS.map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setLength(l)}
                    className={cn(
                      "flex-1 cursor-pointer rounded-lg border px-3 py-2 text-xs font-semibold transition-all",
                      length === l
                        ? "border-brand-purple bg-purple-50 text-brand-purple"
                        : "border-gray-200 bg-white text-gray-500 hover:border-purple-200",
                    )}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Info callout */}
          <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-xs text-blue-700">
            Review before sending — approved emails will be queued for automatic send.
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t border-gray-100 bg-white px-6 py-4">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="cursor-pointer rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Save Draft
          </button>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="cursor-pointer rounded-xl bg-brand-purple px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-purple-200 hover:bg-brand-purple/90"
          >
            Approve & Schedule
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
