// types/resume.ts
import { Prisma, Resume as PrismaResume } from "@/app/generated/prisma/client";
import type { ResumeStyleConfig } from "@/types/styleConfig";

export type ResumeWithRelations = Prisma.ResumeGetPayload<{
  include: {
    coverLetters: true;
    analytics: true;
  };
}>;
export interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  location: string;
  startDate: string;
  endDate: string | null; // null means current
  description: string;
  achievements: string[];
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  location: string;
  startDate: string;
  endDate: string;
  gpa?: string;
  achievements?: string[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  link?: string;
  github?: string;
  highlights: string[];
}

export interface Skill {
  id: string;
  category: string; // e.g., "Frontend", "Backend"
  items: string[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  date?: string;
}

// A user-defined section beyond the fixed set (Experience, Projects, etc.) —
// e.g. "Publications", "Volunteer Work", "Awards". Reuses the same visual
// vocabulary as the rest of the resume (bold heading, italic subheading,
// paragraph, bullet list) so it renders consistently in both the PDF
// template and the LaTeX generator without needing bespoke layout per
// section a user might invent.
export interface CustomSectionItem {
  id: string;
  heading?: string;
  subheading?: string;
  description?: string;
  bullets: string[];
}

export interface CustomSection {
  id: string;
  title: string;
  items: CustomSectionItem[];
}

export interface ResumeData {
  personalInfo: PersonalInfo;
  summary: string;
  experience: Experience[];
  education: Education[];
  skills: Skill[];
  projects: Project[];
  achievements: Achievement[];
  certifications: Certification[];
  languages: string[];
  customSections: CustomSection[];
  // Ordered section keys (see lib/resumeSections.ts for the canonical
  // SectionKey union and default). Always a complete, "personal"-first
  // array once it passes through mapResumeFromDB — templates and the
  // builder's tab UI both render off this rather than a hardcoded order.
  sectionOrder: string[];
  isFavorite: boolean;
  // Soft-hide from the default resume list — lives in the `data` JSON blob
  // rather than a dedicated Prisma column, so no migration is needed.
  isArchived: boolean;
  thumbnail: string;
  atsScore: number;
  styleConfig: ResumeStyleConfig;
}

// Shape of the readinessScoreDetails JSON column (Resume /
// UploadedResume, see prisma/schema.prisma) — the ATS Readiness Score
// feature (lib/ai/generateReadinessScore.ts), a second, distinct score
// from the JD Match Score's atsScore/AnalyzeJdResult above.
export interface ReadinessScoreDetails {
  score: number;
  breakdown: {
    structure: number;
    formatting: number;
    completeness: number;
    keywordStrength: number;
  };
  suggestions: string[];
  analyzedAt: string;
}

export type AppResume = Omit<PrismaResume, "data" | "readinessScoreDetails"> &
  ResumeData & { readinessScoreDetails: ReadinessScoreDetails | null };

export interface Resume {
  id: string;
  userId: string;
  title: string; // e.g., "Frontend Developer Resume"
  templateId: string;
  personalInfo: PersonalInfo;
  summary: string;
  experience: Experience[];
  education: Education[];
  skills: Skill[];
  projects: Project[];
  achievements?: string[];
  certifications?: Certification[];
  languages?: Language[];
  isFavorite?: boolean;
  thumbnail?: string;
  atsScore?: number; // For ATS optimization score
  createdAt: Date;
  updatedAt: Date;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  credentialId?: string;
}

export interface Language {
  id: string;
  name: string;
  proficiency: "Native" | "Fluent" | "Professional" | "Intermediate" | "Basic";
}
