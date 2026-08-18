"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { isValidEmailFormat } from "@/lib/validation/textSanity";

// Same chip look as GenerateEmailPanel.tsx's (read-only, display-only)
// EmailChips — but that component only removes, never adds, and Cold
// Outreach's Generate & Review panel is explicitly out of scope to touch.
// This is a standalone, self-contained sibling with real add/remove, built
// for Job Discovery's "Add to Queue" prompt and "Add Job Manually" form.
export function EmailChipInput({
  emails,
  onChange,
  placeholder = "Add an email and press Enter",
}: {
  emails: string[];
  onChange: (emails: string[]) => void;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);

  function commit() {
    const value = draft.trim().replace(/,$/, "");
    if (!value) return;

    if (!isValidEmailFormat(value)) {
      setError("Not a valid email address");
      return;
    }
    if (emails.includes(value)) {
      setDraft("");
      setError(null);
      return;
    }

    onChange([...emails, value]);
    setDraft("");
    setError(null);
  }

  function remove(email: string) {
    onChange(emails.filter((e) => e !== email));
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-gray-200 bg-gray-50 p-2">
        {emails.map((email) => (
          <span
            key={email}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-700 shadow-xs"
          >
            {email}
            <button
              type="button"
              onClick={() => remove(email)}
              className="cursor-pointer rounded-sm border-none bg-transparent p-0 text-gray-400 hover:text-gray-600"
              aria-label={`Remove ${email}`}
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value);
            setError(null);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              commit();
            } else if (e.key === "Backspace" && draft === "" && emails.length > 0) {
              remove(emails[emails.length - 1]);
            }
          }}
          onBlur={commit}
          placeholder={emails.length === 0 ? placeholder : "Add another..."}
          className="min-w-40 flex-1 border-none bg-transparent px-1 py-1 text-xs text-gray-700 outline-none placeholder:text-gray-400"
        />
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
