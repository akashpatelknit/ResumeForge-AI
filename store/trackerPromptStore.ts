import { create } from "zustand";

export interface TrackerSuggestion {
  companyName: string;
  roleTitle: string;
  jobDescription: string;
}

interface TrackerPromptStore {
  // Set once, right after a tailored resume is saved — read by the single
  // <AddToTrackerPrompt source="tailor" /> mounted in app/(app)/layout.tsx
  // so the toast survives the navigation to the new resume's builder page.
  pending: TrackerSuggestion | null;
  suggest: (suggestion: TrackerSuggestion) => void;
  clear: () => void;
}

export const useTrackerPromptStore = create<TrackerPromptStore>((set) => ({
  pending: null,
  suggest: (suggestion) => set({ pending: suggestion }),
  clear: () => set({ pending: null }),
}));
