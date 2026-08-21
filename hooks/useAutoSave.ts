import { useEffect, useRef } from "react";
import { useResumeStore } from "@/store/resumeStore";
import { useDebounce } from "./useDebounce";

export function useAutoSave(delay = 3000) {
  const { currentResume, saveResume, isSaving } = useResumeStore();
  const debouncedResume = useDebounce(currentResume, delay);
  // Tracks whether we've seen a loaded resume yet — not just the first
  // effect run. currentResume starts null and flips to the loaded resume
  // once loadResume() resolves; that transition is a real dependency
  // change (null -> object), so skipping only the very first render still
  // let it through as a "change" and fired a save right after every page
  // load with zero edits. This skips that specific transition instead.
  const hasSeenResume = useRef(false);

  useEffect(() => {
    if (!debouncedResume) return;

    if (!hasSeenResume.current) {
      hasSeenResume.current = true;
      return;
    }

    if (isSaving) return;

    saveResume();
  }, [debouncedResume]);
}
