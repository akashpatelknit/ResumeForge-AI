import { Resume as PrismaResume } from "@/app/generated/prisma/client";
import { AppResume, ResumeData } from "@/types/resume";
import { getEffectiveSectionOrder } from "@/lib/resumeSections";
import { DEFAULT_STYLE_CONFIG } from "@/types/styleConfig";

// Resumes created before a field existed in ResumeData (customSections is
// the newest example) simply don't have that key in their stored `data`
// JSON — it's `undefined` at runtime even though the ResumeData type says
// it's always present. This is the single place a DB row becomes the
// AppResume shape the rest of the app trusts, so defaults belong here
// rather than scattered as `?? []` guards across every consumer (the
// store's custom-section actions, ModernTemplate, generateLatexFromResume,
// etc.) — miss one of those and it's the exact crash this fixes.
export function mapResumeFromDB(r: PrismaResume): AppResume {
  const data = (r.data ?? {}) as unknown as Partial<ResumeData>;

  return {
    ...r,
    personalInfo: {
      fullName: "",
      email: "",
      phone: "",
      location: "",
      ...data.personalInfo,
    },
    summary: data.summary ?? "",
    experience: data.experience ?? [],
    education: data.education ?? [],
    skills: data.skills ?? [],
    projects: data.projects ?? [],
    achievements: data.achievements ?? [],
    certifications: data.certifications ?? [],
    languages: data.languages ?? [],
    customSections: data.customSections ?? [],
    // Sanitized (complete, deduped, "personal"-first) even if the stored
    // value is missing (pre-dates this field) or stale — see
    // lib/resumeSections.ts.
    sectionOrder: getEffectiveSectionOrder(data.sectionOrder),
    isFavorite: data.isFavorite ?? false,
    isArchived: data.isArchived ?? false,
    thumbnail: data.thumbnail ?? "",
    atsScore: data.atsScore ?? 0,
    styleConfig: {
      ...DEFAULT_STYLE_CONFIG,
      ...data.styleConfig,
      margins: {
        ...DEFAULT_STYLE_CONFIG.margins,
        ...data.styleConfig?.margins,
      },
    },
  };
}
