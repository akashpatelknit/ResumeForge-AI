import "server-only";
import { generateText } from "@/lib/ai/llm";
import type {
  Achievement,
  CustomSection,
  Education,
  Experience,
  Project,
  ResumeData,
  Skill,
} from "@/types/resume";

// The "LaTeX -> Form" direction of the sync. Unlike generateLatexFromResume
// (deterministic, always safe), this direction is inherently best-effort:
// LaTeX is freeform text, not a structured schema, so parsing arbitrary
// hand-edited source back into fixed fields requires actual language
// understanding, not a parser. Any custom LaTeX/macros/formatting that
// don't map onto the structured schema are necessarily lost in this
// direction — callers should surface that to the user, not treat the
// result as a lossless round-trip.

function parseAIJson(text: string): unknown {
  const cleaned = text
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();
  return JSON.parse(cleaned);
}

const SCHEMA_INSTRUCTIONS = `Return ONLY a single JSON object (no markdown fences, no commentary) with exactly this shape:
{
  "personalInfo": { "fullName": string, "email": string, "phone": string, "location": string, "linkedin": string, "github": string, "portfolio": string },
  "summary": string,
  "experience": [ { "id": string, "company": string, "position": string, "location": string, "startDate": string, "endDate": string | null, "description": string, "achievements": string[] } ],
  "education": [ { "id": string, "institution": string, "degree": string, "field": string, "location": string, "startDate": string, "endDate": string, "gpa": string } ],
  "skills": [ { "id": string, "category": string, "items": string[] } ],
  "projects": [ { "id": string, "name": string, "description": string, "technologies": string[], "link": string, "github": string, "highlights": string[] } ],
  "achievements": [ { "id": string, "title": string, "description": string, "date": string } ],
  "certifications": [],
  "languages": string[],
  "customSections": [ { "id": string, "title": string, "items": [ { "id": string, "heading": string, "subheading": string, "description": string, "bullets": string[] } ] } ]
}

"customSections" is for any content that doesn't fit the fixed fields above
(e.g. Publications, Volunteer Work, Awards, Certifications with extra detail
sections written as their own \\section{...} in the source) — one entry per
\\section{...} in the document that isn't Professional Summary, Skills,
Experience, Projects, Education, or Achievements.

Rules:
- Read the raw LaTeX source below and extract its actual resume content.
- Strip LaTeX commands and escaping (e.g. "\\&" becomes "&", "\\textbf{X}" becomes "X") — output plain, human-readable text, not LaTeX markup.
- endDate should be null if the entry says "Present" or is currently ongoing.
- Generate simple sequential ids ("exp-1", "edu-1", "skill-1", "proj-1", "ach-1") — the original document has no stable ids to recover.
- If a field genuinely isn't present in the document, use an empty string "" or empty array [], never omit the key or use null (except endDate as noted above).
- Do not invent content that isn't in the source.`;

// Deliberately omits isFavorite/isArchived/thumbnail/atsScore/sectionOrder
// — those aren't recoverable from LaTeX text, and returning them (even as
// defaults) would invite callers to blindly overwrite unrelated existing
// resume state instead of merging just the extracted content fields. This
// matters especially for sectionOrder: the disabled LaTeX-mode sync
// (`{...currentResume, ...result}`) would otherwise silently wipe out a
// user's manually dragged section order every time they sync from LaTeX.
export type ExtractedResumeFields = Omit<
  ResumeData,
  "isFavorite" | "isArchived" | "thumbnail" | "atsScore" | "sectionOrder"
>;

export async function extractResumeFromLatex(
  latexSource: string,
): Promise<ExtractedResumeFields> {
  const prompt = `You are extracting structured resume data from a LaTeX document.\n\n${SCHEMA_INSTRUCTIONS}\n\nLaTeX source:\n"""\n${latexSource}\n"""`;

  const response = await generateText(prompt);
  if (!response) {
    throw new Error("AI response was empty");
  }

  const parsed = parseAIJson(response) as Partial<ResumeData>;

  // Defensive defaults — never trust an LLM response to have every key,
  // even with explicit schema instructions. This has to go item-by-item,
  // not just top-level array presence: a response with e.g.
  // `projects: [{ name: "X" }]` (missing "highlights") is exactly the kind
  // of partial output a model can return despite the schema instructions,
  // and both this module's own generateLatexFromResume() caller and the
  // form UI (components/builder/sections/*.tsx) call .map()/.filter() on
  // those nested arrays without guards.
  const asArray = <T,>(value: unknown): T[] => (Array.isArray(value) ? value : []);
  const genId = (prefix: string, index: number) => `${prefix}-${index + 1}`;

  return {
    personalInfo: {
      fullName: parsed.personalInfo?.fullName ?? "",
      email: parsed.personalInfo?.email ?? "",
      phone: parsed.personalInfo?.phone ?? "",
      location: parsed.personalInfo?.location ?? "",
      linkedin: parsed.personalInfo?.linkedin ?? "",
      github: parsed.personalInfo?.github ?? "",
      portfolio: parsed.personalInfo?.portfolio ?? "",
    },
    summary: parsed.summary ?? "",
    experience: asArray<Partial<Experience>>(parsed.experience).map((exp, i) => ({
      id: exp.id ?? genId("exp", i),
      company: exp.company ?? "",
      position: exp.position ?? "",
      location: exp.location ?? "",
      startDate: exp.startDate ?? "",
      endDate: exp.endDate ?? null,
      description: exp.description ?? "",
      achievements: asArray<string>(exp.achievements),
    })),
    education: asArray<Partial<Education>>(parsed.education).map((edu, i) => ({
      id: edu.id ?? genId("edu", i),
      institution: edu.institution ?? "",
      degree: edu.degree ?? "",
      field: edu.field ?? "",
      location: edu.location ?? "",
      startDate: edu.startDate ?? "",
      endDate: edu.endDate ?? "",
      gpa: edu.gpa ?? "",
      achievements: asArray<string>(edu.achievements),
    })),
    skills: asArray<Partial<Skill>>(parsed.skills).map((s, i) => ({
      id: s.id ?? genId("skill", i),
      category: s.category ?? "",
      items: asArray<string>(s.items),
    })),
    projects: asArray<Partial<Project>>(parsed.projects).map((proj, i) => ({
      id: proj.id ?? genId("proj", i),
      name: proj.name ?? "",
      description: proj.description ?? "",
      technologies: asArray<string>(proj.technologies),
      link: proj.link ?? "",
      github: proj.github ?? "",
      highlights: asArray<string>(proj.highlights),
    })),
    achievements: asArray<Partial<Achievement>>(parsed.achievements).map(
      (a, i) => ({
        id: a.id ?? genId("ach", i),
        title: a.title ?? "",
        description: a.description ?? "",
        date: a.date ?? "",
      }),
    ),
    certifications: asArray(parsed.certifications),
    languages: asArray<string>(parsed.languages),
    customSections: asArray<Partial<CustomSection>>(parsed.customSections).map(
      (section, i) => ({
        id: section.id ?? genId("section", i),
        title: section.title ?? "",
        items: asArray<{
          id?: string;
          heading?: string;
          subheading?: string;
          description?: string;
          bullets?: unknown;
        }>(section.items).map((item, j) => ({
          id: item.id ?? genId(`section-${i}-item`, j),
          heading: item.heading ?? "",
          subheading: item.subheading ?? "",
          description: item.description ?? "",
          bullets: asArray<string>(item.bullets),
        })),
      }),
    ),
  };
}
