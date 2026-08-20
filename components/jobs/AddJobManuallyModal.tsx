"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Briefcase, Building2, Loader2, MapPin, Plus, X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { EmailChipInput } from "@/components/jobs/EmailChipInput";

export function AddJobManuallyModal({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}) {
  const [company, setCompany] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [location, setLocation] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [contactEmails, setContactEmails] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit =
    company.trim().length > 0 &&
    jobTitle.trim().length > 0 &&
    jobDescription.trim().length > 0 &&
    contactEmails.length > 0 &&
    !isSubmitting;

  async function handleSubmit() {
    if (!canSubmit) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/jobs/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "manual",
          company: company.trim(),
          jobTitle: jobTitle.trim(),
          location: location.trim() || undefined,
          jobDescription: jobDescription.trim(),
          contactEmails,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Failed to add this job.");
        return;
      }
      toast.success("Job added to your queue.");
      setCompany("");
      setJobTitle("");
      setLocation("");
      setJobDescription("");
      setContactEmails([]);
      onOpenChange(false);
      onCreated();
    } catch (error) {
      console.error("Failed to save manual job:", error);
      toast.error("Network error — please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="max-h-[90vh] w-full max-w-lg overflow-y-auto gap-0 rounded-2xl p-0">
        <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-6 py-5">
          <div>
            <DialogTitle className="text-lg font-bold text-gray-900">Add Job Manually</DialogTitle>
            <p className="text-sm text-gray-500">Paste in a posting you found elsewhere.</p>
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

        <div className="space-y-4 px-6 py-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-900">
                Company <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Acme Corporation"
                  className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm text-gray-700 outline-none placeholder:text-gray-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-900">
                Job Title <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Briefcase className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="Frontend Developer"
                  className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm text-gray-700 outline-none placeholder:text-gray-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-900">
              Location <span className="font-normal text-gray-400">(optional)</span>
            </label>
            <div className="relative">
              <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Remote, or a city"
                className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm text-gray-700 outline-none placeholder:text-gray-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-900">
              Job Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={6}
              placeholder="Paste the job posting here..."
              className="w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm leading-relaxed text-gray-700 outline-none placeholder:text-gray-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-900">
              Contact Email(s) <span className="text-red-500">*</span>
            </label>
            <EmailChipInput emails={contactEmails} onChange={setContactEmails} />
          </div>
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
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-brand-purple px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-purple-200 hover:bg-brand-purple/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Add to Queue
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
