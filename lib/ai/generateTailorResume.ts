import { generateText } from "./llm";
import { buildTailorPrompt } from "./buildTailorPrompt";
import type { AppResume } from "@/types/resume";

// Same strip-fences-then-parse pattern as generateColdEmails.ts / linkedin.ts
// — kept as a local copy rather than a shared import, matching how those do it.
function parseAIJson(text: string): unknown {
  const cleaned = text
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();

  return JSON.parse(cleaned);
}

export interface TailoredExperience {
  id: string;
  achievements: string[];
}
export interface TailoredSkillGroup {
  id: string;
  items: string[];
}
export interface TailoredProject {
  id: string;
  highlights: string[];
}
export interface TailoredResumeResult {
  companyName: string;
  roleTitle: string;
  summary: string;
  experience: TailoredExperience[];
  skills: TailoredSkillGroup[];
  projects: TailoredProject[];
}

interface GenerateTailorResumeParams {
  resume: AppResume;
  jobDescription: string;
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (v): v is string => typeof v === "string" && v.trim().length > 0,
  );
}

export async function generateTailorResume({
  resume,
  jobDescription,
}: GenerateTailorResumeParams): Promise<TailoredResumeResult> {
  const prompt = buildTailorPrompt({ resume, jobDescription });

  const res = await generateText(prompt);
  if (!res) {
    throw new Error("AI response was empty");
  }

  const parsed = parseAIJson(res) as {
    companyName?: unknown;
    roleTitle?: unknown;
    summary?: unknown;
    experience?: unknown;
    skills?: unknown;
    projects?: unknown;
  };

  const companyName =
    typeof parsed.companyName === "string" ? parsed.companyName.trim() : "";
  const roleTitle =
    typeof parsed.roleTitle === "string" ? parsed.roleTitle.trim() : "";

  const summary =
    typeof parsed.summary === "string" && parsed.summary.trim()
      ? parsed.summary.trim()
      : resume.summary;

  // The model is instructed to reuse original ids and never invent/drop
  // entries, but it's still a text model — defend both directions: drop any
  // entry whose id doesn't match the original (a hallucinated id would
  // otherwise silently vanish into nowhere on save), and fall back to the
  // original, unchanged, for any entry the model omitted. The result always
  // has exactly one entry per original id, which is what makes a 1:1
  // original-vs-tailored diff view possible on the frontend.
  const experienceById = new Map<string, TailoredExperience>();
  if (Array.isArray(parsed.experience)) {
    for (const entry of parsed.experience) {
      if (
        entry &&
        typeof entry === "object" &&
        typeof (entry as { id?: unknown }).id === "string" &&
        resume.experience.some((e) => e.id === (entry as { id: string }).id)
      ) {
        const id = (entry as { id: string }).id;
        experienceById.set(id, {
          id,
          achievements: toStringArray(
            (entry as { achievements?: unknown }).achievements,
          ),
        });
      }
    }
  }
  const experience = resume.experience.map(
    (orig) =>
      experienceById.get(orig.id) ?? { id: orig.id, achievements: orig.achievements },
  );

  const skillsById = new Map<string, TailoredSkillGroup>();
  if (Array.isArray(parsed.skills)) {
    for (const entry of parsed.skills) {
      if (
        entry &&
        typeof entry === "object" &&
        typeof (entry as { id?: unknown }).id === "string" &&
        resume.skills.some((s) => s.id === (entry as { id: string }).id)
      ) {
        const id = (entry as { id: string }).id;
        skillsById.set(id, {
          id,
          items: toStringArray((entry as { items?: unknown }).items),
        });
      }
    }
  }
  const skills = resume.skills.map(
    (orig) => skillsById.get(orig.id) ?? { id: orig.id, items: orig.items },
  );

  const projectsById = new Map<string, TailoredProject>();
  if (Array.isArray(parsed.projects)) {
    for (const entry of parsed.projects) {
      if (
        entry &&
        typeof entry === "object" &&
        typeof (entry as { id?: unknown }).id === "string" &&
        resume.projects.some((p) => p.id === (entry as { id: string }).id)
      ) {
        const id = (entry as { id: string }).id;
        projectsById.set(id, {
          id,
          highlights: toStringArray(
            (entry as { highlights?: unknown }).highlights,
          ),
        });
      }
    }
  }
  const projects = resume.projects.map(
    (orig) =>
      projectsById.get(orig.id) ?? { id: orig.id, highlights: orig.highlights },
  );

  return { companyName, roleTitle, summary, experience, skills, projects };
}
