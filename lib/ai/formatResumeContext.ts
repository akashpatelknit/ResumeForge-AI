import type { AppResume } from "@/types/resume";

// A candidate's resume context for an outreach-email prompt, from either
// source a "Resume to Attach" picker can select: a structured Rezlo
// Resume, or raw text extracted from an uploaded PDF (no structured fields
// available in that case — see lib/textExtraction/extractUploadedResumeText.ts).
// The ResumeContext type itself is shared across every outreach prompt
// builder (Quick Apply's exact-template ones and the cron sender's
// freeform one). formatCandidateContext below — a condensed summary/
// skills/roles block for freeform prose — is used only by
// buildScheduledOutreachPrompt.ts now; Quick Apply's exact-template
// prompts need the fuller, un-condensed data instead, see
// lib/ai/formatCandidateProfile.ts.
export type ResumeContext =
  | { kind: "structured"; resume: AppResume }
  | { kind: "text"; text: string; candidateName?: string };

const MAX_EXTRACTED_TEXT_CHARS = 6000;

export function formatCandidateContext(
  context: ResumeContext,
  experienceCount: number,
): { candidateName: string; block: string } {
  if (context.kind === "structured") {
    const { resume } = context;
    const skills = resume.skills.flatMap((s) => s.items).join(", ");
    const recentRoles = resume.experience
      .slice(0, experienceCount)
      .map((e) => `${e.position} at ${e.company}${e.description ? `: ${e.description}` : ""}`)
      .join("\n");

    return {
      candidateName: resume.personalInfo.fullName || "the candidate",
      block: [
        `CANDIDATE SUMMARY: ${resume.summary || "Not provided"}`,
        `CANDIDATE KEY SKILLS: ${skills || "Not provided"}`,
        `CANDIDATE RECENT EXPERIENCE:\n${recentRoles || "Not provided"}`,
      ].join("\n"),
    };
  }

  const truncated =
    context.text.length > MAX_EXTRACTED_TEXT_CHARS
      ? `${context.text.slice(0, MAX_EXTRACTED_TEXT_CHARS)}...`
      : context.text;

  return {
    candidateName: context.candidateName || "the candidate",
    block: `CANDIDATE RESUME (raw text extracted from an uploaded PDF — no structured fields available):\n${truncated}`,
  };
}
