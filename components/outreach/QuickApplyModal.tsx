"use client";

import { useState } from "react";
import {
  Bookmark,
  Briefcase,
  Building2,
  ChevronDown,
  FileText,
  Loader2,
  Mail,
  RefreshCw,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { MOCK_RESUMES } from "@/components/outreach/outreachData";

const JOB_CONTEXT_MAX = 2000;

function generateMockEmail(company: string, role: string) {
  const companyLabel = company.trim() || "your company";
  const roleLabel = role.trim() || "the role";
  return {
    subject: `Application for ${roleLabel} – Akash Patel`,
    body: `Hi Team,

I came across your post about the ${roleLabel} opening at ${companyLabel} and I'm excited to apply. I have 3+ years of experience building modern, responsive web applications using React, TypeScript, Tailwind CSS, and related technologies. I've attached my resume for your review. I'd love the opportunity to contribute to your team and help build amazing products.

Looking forward to hearing from you!

Best regards,
Akash Patel`,
  };
}

export function QuickApplyModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [recipientEmail, setRecipientEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [role, setRole] = useState("");
  const [jobContext, setJobContext] = useState("");
  const [selectedResumeId, setSelectedResumeId] = useState(MOCK_RESUMES[0].id);
  const [resumeOpen, setResumeOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generated, setGenerated] = useState<{ subject: string; body: string } | null>(null);
  const [previewCollapsed, setPreviewCollapsed] = useState(false);

  const selectedResume = MOCK_RESUMES.find((r) => r.id === selectedResumeId) ?? MOCK_RESUMES[0];
  const canGenerate = recipientEmail.trim().length > 0 && Boolean(selectedResumeId) && !isGenerating;

  function handleGenerate() {
    if (!canGenerate) return;
    setIsGenerating(true);
    setTimeout(() => {
      setGenerated(generateMockEmail(companyName, role));
      setPreviewCollapsed(false);
      setIsGenerating(false);
    }, 1500);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto gap-0 rounded-2xl p-0"
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
            className="cursor-pointer rounded-lg border-none bg-transparent p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6 px-6 py-5">
          {/* Top row */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-900">
                Recipient Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  placeholder="careers@acmecorp.com"
                  className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm text-gray-700 outline-none placeholder:text-gray-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                />
              </div>
              <p className="mt-1.5 text-xs text-gray-400">We&apos;ll send your application to this email</p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-900">Company Name</label>
              <div className="relative">
                <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Acme Corporation"
                  className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm text-gray-700 outline-none placeholder:text-gray-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-900">Role / Position</label>
              <div className="relative">
                <Briefcase className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="Frontend Developer"
                  className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm text-gray-700 outline-none placeholder:text-gray-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                />
              </div>
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
            <div className="relative">
              <button
                type="button"
                onClick={() => setResumeOpen((v) => !v)}
                className="flex w-full cursor-pointer items-center gap-2.5 rounded-xl border border-gray-200 bg-white px-3.5 py-3 text-left hover:border-purple-200"
              >
                <FileText className="h-4 w-4 shrink-0 text-gray-400" />
                <span className="flex-1 truncate text-sm font-medium text-gray-800">{selectedResume.name}</span>
                {selectedResume.aiSuggested && (
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-purple-100 px-2.5 py-0.5 text-[11px] font-medium text-brand-purple">
                    <span className="h-1 w-1 rounded-full bg-brand-purple" />
                    AI Suggested
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
                      <FileText className="h-3.5 w-3.5 shrink-0" />
                      <span className="flex-1 truncate">{resume.name}</span>
                      {resume.aiSuggested && (
                        <span className="shrink-0 text-[11px] font-medium text-brand-purple">AI suggested</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <p className="mt-1.5 text-xs text-gray-400">This resume best matches the role and context</p>
          </div>

          {/* Generate Email */}
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={!canGenerate}
              className="inline-flex w-full shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl bg-linear-to-r from-purple-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-200 transition-all hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none sm:w-auto"
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              {isGenerating ? "Generating..." : "Generate Email"}
            </button>
            <p className="text-xs text-gray-400">
              We&apos;ll use AI to draft a personalized email using the details above.
            </p>
          </div>

          {/* Generated Email Preview */}
          {generated && (
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
                      setGenerated(generateMockEmail(companyName, role));
                    }}
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Regenerate
                  </button>
                  <ChevronDown className={cn("h-4 w-4 text-gray-400 transition-transform", !previewCollapsed && "rotate-180")} />
                </span>
              </div>

              {!previewCollapsed && (
                <div className="space-y-3 border-t border-gray-100 px-4 py-4">
                  <p className="text-sm">
                    <span className="font-semibold text-gray-900">Subject:</span>{" "}
                    <span className="text-gray-700">{generated.subject}</span>
                  </p>
                  <textarea
                    value={generated.body}
                    onChange={(e) => setGenerated({ ...generated, body: e.target.value })}
                    rows={9}
                    className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm leading-relaxed text-gray-700 outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-100"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-col items-end gap-1.5 border-t border-gray-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              <Bookmark className="h-4 w-4" />
              Save as Draft
            </button>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={!generated}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-brand-purple px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-purple-200 hover:bg-brand-purple/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              Send Now
            </button>
          </div>
          <p className="text-xs text-gray-400">This will send immediately from your connected email</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
