"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const STATUS_OPTIONS = [
  { value: "wishlist", label: "Wishlist" },
  { value: "applied", label: "Applied" },
  { value: "interview", label: "Interview" },
  { value: "offer", label: "Offer" },
  { value: "rejected", label: "Rejected" },
];

export interface ApplicationRecord {
  id: string;
  company: string;
  role: string;
  status: string;
  appliedDate: string | null;
  updatedAt: string;
  matchScore: number | null;
  tags: string[];
  location: string | null;
  salary: string | null;
  notes: string | null;
  url: string | null;
}

export interface AddApplicationPrefill {
  company?: string;
  role?: string;
  jobDescription?: string;
  status?: string;
  source?: string;
}

interface AddApplicationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prefill?: AddApplicationPrefill;
  onCreated?: (application: ApplicationRecord) => void;
}

const emptyForm = {
  company: "",
  role: "",
  status: "wishlist",
  location: "",
  salary: "",
  url: "",
  notes: "",
};

// The one creation path for job applications — used identically by the
// manual "+ Add Application" button on the tracker board and by the "Add"
// action on the smart tracker prompts (components/shared/AddToTrackerPrompt.tsx).
// Both call POST /api/applications, so entries look the same afterward
// regardless of where they came from.
export default function AddApplicationModal({
  open,
  onOpenChange,
  prefill,
  onCreated,
}: AddApplicationModalProps) {
  const [form, setForm] = useState(emptyForm);
  const [jobDescription, setJobDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm({
      ...emptyForm,
      company: prefill?.company ?? "",
      role: prefill?.role ?? "",
      status: prefill?.status ?? "wishlist",
    });
    setJobDescription(prefill?.jobDescription ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.company.trim() || !form.role.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: form.company.trim(),
          role: form.role.trim(),
          status: form.status,
          location: form.location.trim() || undefined,
          salary: form.salary.trim() || undefined,
          url: form.url.trim() || undefined,
          notes: form.notes.trim() || undefined,
          jobDescription: jobDescription.trim() || undefined,
          appliedDate: form.status === "applied" ? new Date().toISOString() : undefined,
          source: prefill?.source ?? "manual",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to add application");

      toast.success(`Added ${form.company} to your tracker.`);
      onCreated?.(data);
      onOpenChange(false);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to add application",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Application</DialogTitle>
          <DialogDescription>
            Track a job application on your board.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
                placeholder="e.g. Stripe"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="role">Role</Label>
              <Input
                id="role"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                placeholder="e.g. Frontend Engineer"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="status">Stage</Label>
              <NativeSelect
                id="status"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                {STATUS_OPTIONS.map((opt) => (
                  <NativeSelectOption key={opt.value} value={opt.value}>
                    {opt.label}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="e.g. Remote"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="salary">Salary Range</Label>
              <Input
                id="salary"
                value={form.salary}
                onChange={(e) => setForm({ ...form, salary: e.target.value })}
                placeholder="e.g. $150k - $190k"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="url">Job Posting URL</Label>
              <Input
                id="url"
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="jobDescription">Job Description (optional)</Label>
            <Textarea
              id="jobDescription"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description here..."
              rows={4}
              className="resize-none text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Optional notes..."
              rows={2}
              className="resize-none text-sm"
            />
          </div>

          <Button
            type="submit"
            disabled={!form.company.trim() || !form.role.trim() || isSubmitting}
            className="w-full"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Add Application
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
