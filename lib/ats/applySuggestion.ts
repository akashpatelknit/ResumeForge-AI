import type { AppResume } from "@/types/resume";
import type { AtsSuggestion } from "@/lib/ai/generateAnalyzeJd";

// Parses the "experience[i].achievements[j]" / "projects[i].highlights[j]"
// path syntax the ATS analysis prompt is instructed to use (see
// lib/ai/buildAnalyzeJdPrompt.ts). A missing trailing [j] means "the list
// itself" (an add_bullet target) rather than one specific bullet. Exported
// so lib/ai/generateAnalyzeJd.ts can validate a suggestion's targetField
// against the exact same rule the apply side will use, instead of two
// independently-maintained regexes drifting apart.
export type BulletTarget =
  | { section: "experience"; entryIndex: number; bulletIndex: number | null }
  | { section: "projects"; entryIndex: number; bulletIndex: number | null };

const EXPERIENCE_PATTERN = /^experience\[(\d+)\]\.achievements(?:\[(\d+)\])?$/;
const PROJECTS_PATTERN = /^projects\[(\d+)\]\.highlights(?:\[(\d+)\])?$/;

export function parseBulletTarget(targetField: string): BulletTarget | null {
  const expMatch = EXPERIENCE_PATTERN.exec(targetField);
  if (expMatch) {
    return {
      section: "experience",
      entryIndex: Number(expMatch[1]),
      bulletIndex: expMatch[2] !== undefined ? Number(expMatch[2]) : null,
    };
  }

  const projMatch = PROJECTS_PATTERN.exec(targetField);
  if (projMatch) {
    return {
      section: "projects",
      entryIndex: Number(projMatch[1]),
      bulletIndex: projMatch[2] !== undefined ? Number(projMatch[2]) : null,
    };
  }

  return null;
}

// Last-resort category name — only used if a suggestion genuinely has no
// targetCategory at all (the prompt in buildAnalyzeJdPrompt.ts always asks
// Gemini for one, and generateAnalyzeJd.ts's sanitizer falls back to this
// if it's missing from the response). Normal add_skill suggestions route
// into a real matching (or newly-named) category instead — see
// resolveSkillCategory below.
export const FALLBACK_SKILL_CATEGORY = "Other Skills";

// Matches a suggested category name against the resume's existing
// categories, tolerant of case/whitespace/punctuation differences (e.g.
// "Backend & Languages" vs "backend and languages") so a slightly
// reformatted-but-equivalent name from the model still lands in the same
// bucket instead of spawning a near-duplicate category.
function normalizeCategoryName(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export interface ApplySuggestionMutators {
  addSkill: (skill: { id: string; category: string; items: string[] }) => void;
  updateSkill: (id: string, updates: { items: string[] }) => void;
  updateExperience: (id: string, updates: { achievements: string[] }) => void;
  updateProject: (id: string, updates: { highlights: string[] }) => void;
}

export type ApplySuggestionResult = { ok: true } | { ok: false; message: string };

// Pure function: reads `resume` to figure out what the mutation should be,
// then calls exactly one of the existing Zustand store mutators passed in
// via `mutators` — the same ones ExperienceSection.tsx/ProjectsSection.tsx/
// SkillsSection.tsx already use, so autosave and the live preview pick this
// up identically to a manual edit. Takes `resume` and `mutators` as plain
// arguments (rather than calling useResumeStore() itself) so this stays a
// plain, testable function instead of a hook.
export function applyAtsSuggestion(
  suggestion: AtsSuggestion,
  resume: AppResume,
  mutators: ApplySuggestionMutators,
): ApplySuggestionResult {
  if (suggestion.type === "add_skill") {
    const value = suggestion.suggestedValue.trim();
    if (!value) return { ok: false, message: "This suggestion has no skill to add." };

    const targetCategory = suggestion.targetCategory?.trim() || FALLBACK_SKILL_CATEGORY;
    const normalizedTarget = normalizeCategoryName(targetCategory);

    // Route into whichever existing category actually matches — the bug
    // this fixes always dumped every add_skill suggestion into one flat
    // "Additional Skills" bucket regardless of how well-categorized the
    // resume already was. Falls back to creating a new category (named
    // either by the model's targetCategory, or FALLBACK_SKILL_CATEGORY if
    // that was never set) only when nothing on the resume matches.
    const existing = resume.skills.find(
      (skill) => normalizeCategoryName(skill.category) === normalizedTarget,
    );

    if (existing) {
      if (existing.items.some((item) => item.toLowerCase() === value.toLowerCase())) {
        return { ok: false, message: "That skill is already on your resume." };
      }
      mutators.updateSkill(existing.id, { items: [...existing.items, value] });
    } else {
      mutators.addSkill({ id: crypto.randomUUID(), category: targetCategory, items: [value] });
    }
    return { ok: true };
  }

  const target = parseBulletTarget(suggestion.targetField);
  if (!target) {
    return { ok: false, message: "Couldn't figure out where this suggestion applies." };
  }

  if (target.section === "experience") {
    const entry = resume.experience[target.entryIndex];
    if (!entry) return { ok: false, message: "That experience entry no longer exists — try re-analyzing." };

    const result = nextBullets(suggestion, entry.achievements, target.bulletIndex);
    if (!result.ok) return result;

    mutators.updateExperience(entry.id, { achievements: result.bullets });
    return { ok: true };
  }

  const entry = resume.projects[target.entryIndex];
  if (!entry) return { ok: false, message: "That project entry no longer exists — try re-analyzing." };

  const result = nextBullets(suggestion, entry.highlights, target.bulletIndex);
  if (!result.ok) return result;

  mutators.updateProject(entry.id, { highlights: result.bullets });
  return { ok: true };
}

function nextBullets(
  suggestion: AtsSuggestion,
  bullets: string[],
  bulletIndex: number | null,
): { ok: true; bullets: string[] } | { ok: false; message: string } {
  if (suggestion.type === "add_bullet") {
    return { ok: true, bullets: [...bullets, suggestion.suggestedValue] };
  }

  if (suggestion.type === "rewrite_bullet") {
    if (bulletIndex === null || bulletIndex >= bullets.length) {
      return { ok: false, message: "That bullet no longer exists — try re-analyzing." };
    }
    return {
      ok: true,
      bullets: bullets.map((bullet, i) => (i === bulletIndex ? suggestion.suggestedValue : bullet)),
    };
  }

  return { ok: false, message: "Unknown suggestion type." };
}
