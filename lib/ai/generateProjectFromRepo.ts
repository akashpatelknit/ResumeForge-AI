import { generateText } from "./llm";
import { buildProjectFromRepoPrompt } from "./buildProjectFromRepoPrompt";

// Same strip-fences-then-parse pattern as generateColdEmails.ts / linkedin.ts
// — kept as a local copy rather than a shared import, matching how those do it.
function parseAIJson(text: string): unknown {
  const cleaned = text
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();

  return JSON.parse(cleaned);
}

export interface GeneratedProjectFromRepo {
  projectName: string;
  description: string;
  highlights: string[];
  techStack: string[];
}

interface GenerateProjectFromRepoParams {
  repoName: string;
  repoDescription?: string;
  language?: string;
  topics?: string[];
  readme?: string | null;
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (v): v is string => typeof v === "string" && v.trim().length > 0,
  );
}

export async function generateProjectFromRepo({
  repoName,
  repoDescription,
  language,
  topics,
  readme,
}: GenerateProjectFromRepoParams): Promise<GeneratedProjectFromRepo> {
  const prompt = buildProjectFromRepoPrompt({
    repoName,
    repoDescription,
    language,
    topics,
    readme,
  });

  const res = await generateText(prompt);
  if (!res) {
    throw new Error("AI response was empty");
  }

  const parsed = parseAIJson(res) as {
    projectName?: unknown;
    description?: unknown;
    highlights?: unknown;
    techStack?: unknown;
  };

  if (typeof parsed.projectName !== "string" || !parsed.projectName.trim()) {
    throw new Error("AI response did not include a project name");
  }

  return {
    projectName: parsed.projectName.trim(),
    description:
      typeof parsed.description === "string" ? parsed.description.trim() : "",
    highlights: toStringArray(parsed.highlights),
    techStack: toStringArray(parsed.techStack),
  };
}
