import { useEffect } from "react";
import { useResumeStore } from "@/store/resumeStore";
import { fetchResume } from "@/lib/api/resumes";

export function useLoadResume(resumeId?: string) {
  const { setCurrentResume, currentResume } = useResumeStore();

  useEffect(() => {
    if (!resumeId) return;

    const loadResume = async () => {
      try {
        const resume = await fetchResume(resumeId);
        setCurrentResume(resume);
      } catch (error) {
        console.error("Failed to load resume:", error);
      }
    };

    loadResume();
  }, [resumeId, setCurrentResume]);

  return currentResume;
}
