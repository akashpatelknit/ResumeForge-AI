import { Resume as PrismaResume } from "@prisma/client";
import { AppResume, ResumeData } from "@/types/resume";

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
    isFavorite: data.isFavorite ?? false,
    thumbnail: data.thumbnail ?? "",
    atsScore: data.atsScore ?? 0,
  };
}
