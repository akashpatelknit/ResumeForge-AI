import type { ResumeContext } from "./formatResumeContext";

// A fuller candidate data dump than formatResumeContext.ts's
// formatCandidateContext — that one produces a short summary/skills/roles
// paragraph for freeform-prose emails (still used by buildQuickApplyPrompt's
// sibling, buildScheduledOutreachPrompt.ts, for the cron sender). The two
// exact-template Quick Apply prompts (buildColdApplicationPrompt.ts /
// buildReferralRequestPrompt.ts) need to fill specific placeholders — total
// years of experience, current role, top overlapping skills, a project
// highlight, contact links — so they get the real underlying data (full
// personal info, every experience entry with dates, every skill, projects)
// and are instructed to compute/select from it themselves, rather than a
// pre-condensed block. Kept as its own file rather than extending
// formatResumeContext.ts so the cron path's prompt/behavior is untouched.
const MAX_EXTRACTED_TEXT_CHARS = 6000;

export function formatCandidateProfileBlock(context: ResumeContext): string {
  if (context.kind === "text") {
    const truncated =
      context.text.length > MAX_EXTRACTED_TEXT_CHARS
        ? `${context.text.slice(0, MAX_EXTRACTED_TEXT_CHARS)}...`
        : context.text;
    return `CANDIDATE RESUME (raw text extracted from an uploaded PDF — no separately structured contact fields; find name, phone, email, LinkedIn, GitHub/portfolio, experience, and skills directly in this text if present, and omit anything not present):\n${truncated}`;
  }

  const { resume } = context;
  const { personalInfo, summary, experience, skills, projects } = resume;

  const experienceBlock = experience.length
    ? experience
        .map(
          (e) =>
            `- ${e.position} at ${e.company} (${e.startDate} to ${e.endDate || "Present"}): ${e.description || ""}`,
        )
        .join("\n")
    : "Not provided";

  const skillsBlock = skills.length
    ? skills.map((s) => `${s.category}: ${s.items.join(", ")}`).join("\n")
    : "Not provided";

  const projectsBlock = projects.length
    ? projects
        .map((p) => `- ${p.name}: ${p.description}${p.highlights.length ? ` | ${p.highlights.join("; ")}` : ""}`)
        .join("\n")
    : "Not provided";

  return `
CANDIDATE PROFILE (structured data from their Rezlo resume — use ONLY this, never invent a fact not present here):
Full Name: ${personalInfo.fullName || "Not provided"}
Email: ${personalInfo.email || "Not provided"}
Phone: ${personalInfo.phone || "Not provided"}
LinkedIn: ${personalInfo.linkedin || "Not provided"}
GitHub: ${personalInfo.github || "Not provided"}
Portfolio: ${personalInfo.portfolio || "Not provided"}
Summary: ${summary || "Not provided"}

Work Experience (most recent first — use to compute total years of professional experience and identify the current/most recent role):
${experienceBlock}

Skills:
${skillsBlock}

Projects (for picking one relevant one-line highlight):
${projectsBlock}
`.trim();
}
