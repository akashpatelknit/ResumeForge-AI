import { randomUUID } from "crypto";
import { generateText } from "./llm";
import { buildParseResumePrompt } from "./buildParseResumePrompt";
import type {
  Certification,
  Education,
  Experience,
  Project,
  ResumeData,
  Skill,
} from "@/types/resume";
import { DEFAULT_SECTION_ORDER } from "@/lib/resumeSections";

// Same strip-fences-then-parse pattern as generateSummary.ts / generateColdEmails.ts
// — kept as a local copy rather than a shared import, matching how those
// modules each keep their own copy.
function parseAIJson(text: string): unknown {
  const cleaned = text
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();

  return JSON.parse(cleaned);
}

function str(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function strArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];
}

interface RawExperience {
  company?: unknown;
  position?: unknown;
  location?: unknown;
  startDate?: unknown;
  endDate?: unknown;
  description?: unknown;
  achievements?: unknown;
}

interface RawEducation {
  institution?: unknown;
  degree?: unknown;
  field?: unknown;
  location?: unknown;
  startDate?: unknown;
  endDate?: unknown;
  gpa?: unknown;
}

interface RawSkill {
  category?: unknown;
  items?: unknown;
}

interface RawProject {
  name?: unknown;
  description?: unknown;
  technologies?: unknown;
  link?: unknown;
  github?: unknown;
  highlights?: unknown;
}

interface RawCertification {
  name?: unknown;
  issuer?: unknown;
  date?: unknown;
  credentialId?: unknown;
}

interface ParsedResumeJson {
  personalInfo?: {
    fullName?: unknown;
    email?: unknown;
    phone?: unknown;
    location?: unknown;
    linkedin?: unknown;
    github?: unknown;
    portfolio?: unknown;
  };
  summary?: unknown;
  experience?: RawExperience[];
  education?: RawEducation[];
  skills?: RawSkill[];
  projects?: RawProject[];
  certifications?: RawCertification[];
  languages?: unknown;
}

// Normalizes whatever Gemini returns into a valid ResumeData — fills missing
// arrays with [], generates ids for entries that don't have one (the model
// isn't asked for ids since they're not present in the source resume text),
// and defaults the app-only fields (isFavorite, thumbnail, atsScore, ...)
// that a freshly parsed resume doesn't have yet.
function normalizeResumeData(raw: ParsedResumeJson): ResumeData {
  const experience: Experience[] = (raw.experience ?? []).map((exp) => ({
    id: randomUUID(),
    company: str(exp.company),
    position: str(exp.position),
    location: str(exp.location),
    startDate: str(exp.startDate),
    endDate: exp.endDate ? str(exp.endDate) : null,
    description: str(exp.description),
    achievements: strArray(exp.achievements),
  }));

  const education: Education[] = (raw.education ?? []).map((edu) => ({
    id: randomUUID(),
    institution: str(edu.institution),
    degree: str(edu.degree),
    field: str(edu.field),
    location: str(edu.location),
    startDate: str(edu.startDate),
    endDate: str(edu.endDate),
    gpa: str(edu.gpa) || undefined,
  }));

  const skills: Skill[] = (raw.skills ?? []).map((skill) => ({
    id: randomUUID(),
    category: str(skill.category) || "Skills",
    items: strArray(skill.items),
  }));

  const projects: Project[] = (raw.projects ?? []).map((project) => ({
    id: randomUUID(),
    name: str(project.name),
    description: str(project.description),
    technologies: strArray(project.technologies),
    link: str(project.link) || undefined,
    github: str(project.github) || undefined,
    highlights: strArray(project.highlights),
  }));

  const certifications: Certification[] = (raw.certifications ?? []).map((cert) => ({
    id: randomUUID(),
    name: str(cert.name),
    issuer: str(cert.issuer),
    date: str(cert.date),
    credentialId: str(cert.credentialId) || undefined,
  }));

  return {
    personalInfo: {
      fullName: str(raw.personalInfo?.fullName),
      email: str(raw.personalInfo?.email),
      phone: str(raw.personalInfo?.phone),
      location: str(raw.personalInfo?.location),
      linkedin: str(raw.personalInfo?.linkedin) || undefined,
      github: str(raw.personalInfo?.github) || undefined,
      portfolio: str(raw.personalInfo?.portfolio) || undefined,
    },
    summary: str(raw.summary),
    experience,
    education,
    skills,
    projects,
    achievements: [],
    certifications,
    languages: strArray(raw.languages),
    customSections: [],
    sectionOrder: DEFAULT_SECTION_ORDER,
    isFavorite: false,
    isArchived: false,
    thumbnail: "",
    atsScore: 0,
  };
}

export async function generateParseResume(resumeText: string): Promise<ResumeData> {
  const prompt = buildParseResumePrompt(resumeText);

  const res = await generateText(prompt);
  if (!res) {
    throw new Error("AI response was empty");
  }

  const parsed = parseAIJson(res) as ParsedResumeJson;
  return normalizeResumeData(parsed);
}
