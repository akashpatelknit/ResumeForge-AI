import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useDebounce } from "./useDebounce";

// Mirrors the debounce-then-PUT pattern in useAutoSave.ts, but targets the
// standalone `latexSource` column instead of the structured resume `data`
// blob — sending only `{ latexSource }` leaves the rest of the resume
// untouched (Prisma treats the omitted fields as "don't update").
export function useLatexAutoSave(
  resumeId: string | undefined,
  latexSource: string,
  delay = 3000,
) {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const debouncedSource = useDebounce(latexSource, delay);
  const isFirstRender = useRef(true);
  const lastSavedValueRef = useRef(latexSource);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      lastSavedValueRef.current = debouncedSource;
      return;
    }

    if (!resumeId || debouncedSource === lastSavedValueRef.current) return;

    const save = async () => {
      setIsSaving(true);
      try {
        const res = await fetch(`/api/resumes/${resumeId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ latexSource: debouncedSource }),
        });

        if (!res.ok) {
          throw new Error("Failed to save LaTeX source");
        }

        lastSavedValueRef.current = debouncedSource;
        setLastSaved(new Date());
      } catch (error) {
        console.error("Failed to autosave LaTeX source:", error);
        toast.error("Failed to save changes");
      } finally {
        setIsSaving(false);
      }
    };

    save();
  }, [debouncedSource, resumeId]);

  return { isSaving, lastSaved };
}
