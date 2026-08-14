"use client";

import { useState } from "react";
import { X, Briefcase, Plus } from "lucide-react";
import AddApplicationModal from "@/components/dashboard/AddApplicationModal";

interface AddToTrackerPromptProps {
  companyName?: string;
  roleTitle?: string;
  jobDescription?: string;
  source: "tailor" | "outreach";
  onDismiss?: () => void;
}

// One reusable prompt shared by both smart tracker-suggestion moments:
// - source="tailor": rendered once, globally, from app/(app)/layout.tsx
//   reading store/trackerPromptStore.ts — a toast-weight card, since saving
//   a tailored resume is itself a strong application-intent signal even
//   when a company name couldn't be extracted from the pasted JD.
// - source="outreach": rendered inline inside the AI Outreach tab body
//   right after a successful generation — a quieter banner, and only when
//   a company name was confidently identified (outreach alone is a weaker
//   intent signal than tailoring).
// "Add" reuses the exact same POST /api/applications creation path as the
// manual "+ Add Application" button, so entries look identical afterward.
export default function AddToTrackerPrompt({
  companyName,
  roleTitle,
  jobDescription,
  source,
  onDismiss,
}: AddToTrackerPromptProps) {
  const [dismissed, setDismissed] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const trimmedCompany = companyName?.trim() ?? "";

  if (source === "outreach" && !trimmedCompany) return null;
  if (dismissed) return null;

  const dismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  const roleLabel = roleTitle?.trim();
  const subject = trimmedCompany
    ? roleLabel
      ? `${roleLabel} at ${trimmedCompany}`
      : trimmedCompany
    : "this role";

  const heading =
    source === "tailor"
      ? `Add ${subject} to your job tracker?`
      : `Track this application at ${trimmedCompany}?`;

  return (
    <>
      {source === "tailor" ? (
        <div className="fixed bottom-6 right-6 z-50 w-[calc(100vw-3rem)] max-w-sm bg-white border border-gray-200 rounded-xl shadow-xl p-4 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-purple-50 border border-purple-100 flex items-center justify-center shrink-0">
              <Briefcase className="w-4 h-4 text-purple-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 leading-snug">
                {heading}
              </p>
              <div className="flex items-center gap-2 mt-3">
                <button
                  onClick={() => setShowModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 text-white text-xs font-semibold hover:bg-purple-700 transition-colors cursor-pointer border-none"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add
                </button>
                <button
                  onClick={dismiss}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer border-none bg-transparent"
                >
                  Not now
                </button>
              </div>
            </div>
            <button
              onClick={dismiss}
              className="text-gray-300 hover:text-gray-500 cursor-pointer border-none bg-transparent p-0.5 shrink-0"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-3 bg-purple-50/60 border border-purple-100 rounded-lg px-3.5 py-2 mt-4 animate-in fade-in">
          <p className="text-xs text-purple-800 min-w-0 truncate">{heading}</p>
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => setShowModal(true)}
              className="px-2.5 py-1 rounded-md bg-purple-600 text-white text-xs font-semibold hover:bg-purple-700 transition-colors cursor-pointer border-none"
            >
              Add
            </button>
            <button
              onClick={dismiss}
              className="px-2.5 py-1 rounded-md text-xs font-medium text-purple-700/70 hover:text-purple-900 transition-colors cursor-pointer border-none bg-transparent"
            >
              Not now
            </button>
          </div>
        </div>
      )}

      <AddApplicationModal
        open={showModal}
        onOpenChange={setShowModal}
        prefill={{
          company: trimmedCompany,
          role: roleLabel,
          jobDescription,
          status: "wishlist",
          source,
        }}
        onCreated={dismiss}
      />
    </>
  );
}
