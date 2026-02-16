import { useEffect, useRef } from "react";
import { useResumeStore } from "@/store/resumeStore";
import { useDebounce } from "./useDebounce";

export function useAutoSave(delay = 3000) {
  const { currentResume, saveResume, isSaving } = useResumeStore();
  const debouncedResume = useDebounce(currentResume, delay);
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Skip first render
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // Skip if already saving or no resume
    if (isSaving || !debouncedResume) return;

    // Auto-save
    saveResume();
  }, [debouncedResume]);
}
