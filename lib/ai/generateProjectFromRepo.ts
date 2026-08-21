import { callAiGateway } from "./gateway";
import { resumeProjectFromRepoSchema } from "./schemas";
import { buildProjectFromRepoPrompt } from "./buildProjectFromRepoPrompt";

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

export async function generateProjectFromRepo(
  { repoName, repoDescription, language, topics, readme }: GenerateProjectFromRepoParams,
  userId: string,
): Promise<GeneratedProjectFromRepo> {
  const parsed = await callAiGateway({
    feature: "resume.projectFromRepo",
    userId,
    input: { repoName, repoDescription, language, topics, readme },
    promptBuilder: buildProjectFromRepoPrompt,
    outputSchema: resumeProjectFromRepoSchema,
    freeText: [readme ?? undefined],
  });

  if (!parsed.projectName.trim()) {
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
