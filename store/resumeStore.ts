import { create } from "zustand";
import { Resume } from "@/types/resume";

interface ResumeStore {
  currentResume: Resume | null;
  savedResumes: Resume[];
  isLoading: boolean;

  // Actions
  setCurrentResume: (resume: Resume) => void;
  updateResume: (updates: Partial<Resume>) => void;
  saveResume: () => Promise<void>;
  loadResumes: () => Promise<void>;
  deleteResume: (id: string) => Promise<void>;
}

export const useResumeStore = create<ResumeStore>((set, get) => ({
  currentResume: null,
  savedResumes: [],
  isLoading: false,

  setCurrentResume: (resume) => set({ currentResume: resume }),

  updateResume: (updates) =>
    set((state) => ({
      currentResume: state.currentResume
        ? { ...state.currentResume, ...updates }
        : null,
    })),

  saveResume: async () => {
    // API call to save resume
  },

  loadResumes: async () => {
    // API call to load resumes
  },

  deleteResume: async (id) => {
    // API call to delete resume
  },
}));
