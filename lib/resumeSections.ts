// Single source of truth for resume section ordering — shared by the
// builder's tab drag-reorder UI (components/builder/ResumeForm.tsx), the
// Zustand store (store/resumeStore.ts), and every template that needs to
// render sections in a user-chosen order (currently just
// components/pdf/template/ModernTemplate.tsx).

export type SectionKey =
  | "personal"
  | "skills"
  | "experience"
  | "projects"
  | "education"
  | "achievements"
  | "certifications"
  | "custom";

const SECTION_KEY_SET = new Set<SectionKey>([
  "personal",
  "skills",
  "experience",
  "projects",
  "education",
  "achievements",
  "certifications",
  "custom",
]);

// Matches the order these sections were already hardcoded in
// ModernTemplate.tsx before section reordering existed — new/legacy
// resumes with no stored order (or a corrupt one) fall back to this, so
// nothing changes visually until a user actually drags something.
export const DEFAULT_SECTION_ORDER: SectionKey[] = [
  "personal",
  "skills",
  "experience",
  "projects",
  "education",
  "achievements",
  "certifications",
  "custom",
];

// "personal" (contact header + professional summary) stays locked at the
// top per conventional resume layout — see the section-reordering PR
// description. Achievements/Certifications have no builder tab today (see
// components/builder/ResumeForm.tsx), so there's nothing to drag for them
// either; they keep whatever relative position DEFAULT_SECTION_ORDER (or a
// previously saved order) already gives them.
export const REORDERABLE_SECTIONS: SectionKey[] = [
  "experience",
  "education",
  "skills",
  "projects",
  "custom",
];

export const SECTION_LABELS: Record<SectionKey, string> = {
  personal: "Personal",
  skills: "Skills",
  experience: "Experience",
  projects: "Projects",
  education: "Education",
  achievements: "Achievements",
  certifications: "Certifications",
  custom: "Custom",
};

// Sanitizes a stored sectionOrder (possibly missing, from before this
// field existed, or containing stale/unknown keys) into a complete,
// deduplicated, "personal"-first array covering every SectionKey exactly
// once. This is the only function that should ever hand a sectionOrder to
// a renderer or the reorder UI — callers can trust the result is complete.
export function getEffectiveSectionOrder(order?: string[] | null): SectionKey[] {
  const valid = (order ?? []).filter((key): key is SectionKey => SECTION_KEY_SET.has(key as SectionKey));
  const deduped = Array.from(new Set(valid));
  const missing = DEFAULT_SECTION_ORDER.filter((key) => !deduped.includes(key));
  const complete = [...deduped, ...missing];

  const withoutPersonal = complete.filter((key) => key !== "personal");
  return ["personal", ...withoutPersonal];
}

// Derives just the reorderable subsequence, in the order they currently
// appear — this is what the tab drag UI actually displays and reorders.
export function getReorderableOrder(order?: string[] | null): SectionKey[] {
  return getEffectiveSectionOrder(order).filter((key) => REORDERABLE_SECTIONS.includes(key));
}

// Merges a newly-dragged reorderable subsequence back into the full
// section order, leaving locked/non-reorderable keys (personal,
// achievements, certifications) exactly where they were. Walks the
// existing full order and, at each position that WAS a reorderable key,
// substitutes the next key from `newReorderableOrder` — so e.g. dragging
// "skills" after "experience" doesn't disturb achievements/certifications
// sitting between projects and custom.
export function applyReorderedSections(
  fullOrder: SectionKey[],
  newReorderableOrder: SectionKey[],
): SectionKey[] {
  const reorderableSet = new Set(REORDERABLE_SECTIONS);
  let cursor = 0;
  return fullOrder.map((key) => (reorderableSet.has(key) ? newReorderableOrder[cursor++] : key));
}
