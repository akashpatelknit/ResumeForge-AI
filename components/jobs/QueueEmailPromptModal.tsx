"use client";

import { useState } from "react";
import { Loader2, Send, X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { EmailChipInput } from "@/components/jobs/EmailChipInput";
import type { NormalizedJob } from "@/lib/jobs/types";

// Shown when "Add to Queue" is clicked on a job with no contact email on
// file yet (see the discover route's `contactEmails` field) — queueing
// requires at least one email so there's someone to actually send outreach
// to later.
export function QueueEmailPromptModal({
  job,
  onOpenChange,
  onConfirm,
}: {
  job: NormalizedJob | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: (emails: string[]) => Promise<void>;
}) {
  const [emails, setEmails] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleConfirm() {
    if (emails.length === 0) return;
    setIsSubmitting(true);
    try {
      await onConfirm(emails);
      setEmails([]);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={job !== null} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="w-full max-w-md gap-0 rounded-2xl p-0">
        <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-6 py-5">
          <div>
            <DialogTitle className="text-lg font-bold text-gray-900">Add contact email(s)</DialogTitle>
            {job && (
              <p className="text-sm text-gray-500">
                {job.jobTitle} at {job.company}
              </p>
            )}
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

        <div className="px-6 py-5">
          <p className="mb-2 text-xs text-gray-500">
            Who should outreach for this job go to? Add at least one recruiter or contact email.
          </p>
          <EmailChipInput emails={emails} onChange={setEmails} />
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-gray-100 px-6 py-4">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="inline-flex cursor-pointer items-center rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={emails.length === 0 || isSubmitting}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-brand-purple px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-purple-200 hover:bg-brand-purple/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Add to Queue
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
