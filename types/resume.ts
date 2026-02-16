// types/resume.ts
import { Prisma, Resume as PrismaResume } from "@/app/generated/prisma/client";

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

export interface ResumeData {
  personalInfo: PersonalInfo;
  summary: string;
  experience: Experience[];
  education: Education[];
  skills: Skill[];
  projects: Project[];
  achievements: any[];
  certifications: any[];
  languages: string[];
  isFavorite: boolean;
  thumbnail: string;
  atsScore: number;
}

export type AppResume = Omit<PrismaResume, "data"> & ResumeData;

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
