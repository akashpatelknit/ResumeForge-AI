import type { ResumeData } from "@/types/resume";

export const PENDING_PARSE_KEY = "rezlo_pending_parse";
export const PENDING_WIZARD_KEY = "rezlo_pending_wizard";

export interface PendingResume {
  data: ResumeData;
  savedAt: string;
}

function readPending(key: string): PendingResume | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as PendingResume;
  } catch {
    return null;
  }
}

function writePending(key: string, data: ResumeData): void {
  if (typeof window === "undefined") return;

  const entry: PendingResume = { data, savedAt: new Date().toISOString() };
  window.localStorage.setItem(key, JSON.stringify(entry));
}

function clearPending(key: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(key);
}

export const savePendingParse = (data: ResumeData) => writePending(PENDING_PARSE_KEY, data);
export const loadPendingParse = () => readPending(PENDING_PARSE_KEY);
export const clearPendingParse = () => clearPending(PENDING_PARSE_KEY);

export const savePendingWizard = (data: ResumeData) => writePending(PENDING_WIZARD_KEY, data);
export const loadPendingWizard = () => readPending(PENDING_WIZARD_KEY);
export const clearPendingWizard = () => clearPending(PENDING_WIZARD_KEY);
