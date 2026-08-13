import type { AppResume } from "@/types/resume";

// Deterministic Form -> LaTeX generation, built on the same macro set as
// lib/latex/templates/classicAtsTemplate.ts (\resumeSubheading, \resumeItem,
// etc.) so output styling is consistent regardless of which editing mode
// produced it. This is the reliable direction of the sync — the reverse
// (LaTeX -> Form) can't be deterministic in general, see
// lib/latex/extractResumeFromLatex.ts.

// Escapes LaTeX special characters in user-entered text. Order matters:
// backslash must be handled first, or the backslashes this function itself
// inserts for the other characters would get escaped a second time.
function escapeLatex(value: string | null | undefined): string {
  if (!value) return "";
  return value
    .replace(/\\/g, "\\textbackslash{}")
    .replace(/([{}$&#%_])/g, "\\$1")
    .replace(/\^/g, "\\textasciicircum{}")
    .replace(/~/g, "\\textasciitilde{}");
}

function formatDateRange(startDate: string, endDate: string | null): string {
  const end = endDate && endDate.trim() ? escapeLatex(endDate) : "Present";
  return `${escapeLatex(startDate)} -- ${end}`;
}

// Data feeding this generator doesn't always come from the form (see the
// LaTeX -> Form AI extraction path in extractResumeFromLatex.ts) and isn't
// guaranteed to have every array field populated, even with explicit
// schema instructions to the model. Normalize once up front instead of
// scattering `?? []` across every build* function below.
function normalize(resume: AppResume): AppResume {
  return {
    ...resume,
    experience: (resume.experience ?? []).map((exp) => ({
      ...exp,
      achievements: exp.achievements ?? [],
    })),
    education: (resume.education ?? []).map((edu) => ({
      ...edu,
      achievements: edu.achievements ?? [],
    })),
    skills: (resume.skills ?? []).map((s) => ({
      ...s,
      items: s.items ?? [],
    })),
    projects: (resume.projects ?? []).map((proj) => ({
      ...proj,
      technologies: proj.technologies ?? [],
      highlights: proj.highlights ?? [],
    })),
    achievements: resume.achievements ?? [],
    customSections: (resume.customSections ?? []).map((section) => ({
      ...section,
      items: section.items ?? [],
    })),
  };
}

const PREAMBLE = String.raw`\documentclass[a4paper,20pt]{article}

\usepackage{latexsym}
\usepackage[empty]{fullpage}
\usepackage{titlesec}
\usepackage{marvosym}
\usepackage[usenames,dvipsnames]{color}
\usepackage{verbatim}
\usepackage{enumitem}
\usepackage{hyperref}
\usepackage{fancyhdr}

\pagestyle{fancy}
\fancyhf{}
\fancyfoot{}
\renewcommand{\headrulewidth}{0pt}
\renewcommand{\footrulewidth}{0pt}

\addtolength{\oddsidemargin}{-0.530in}
\addtolength{\evensidemargin}{-0.375in}
\addtolength{\textwidth}{1in}
\addtolength{\topmargin}{-.45in}
\addtolength{\textheight}{1in}

\urlstyle{rm}
\raggedbottom
\raggedright
\setlength{\tabcolsep}{0in}

\titleformat{\section}{
  \vspace{-10pt}\scshape\raggedright\large
}{}{0em}{}[\color{black}\titlerule \vspace{-6pt}]

\newcommand{\resumeItem}[2]{
  \item\small{ \textbf{#1}{: #2 \vspace{-2pt}} }
}
\newcommand{\resumeSubheading}[4]{
  \vspace{-1pt}\item
    \begin{tabular*}{0.97\textwidth}{l@{\extracolsep{\fill}}r}
      \textbf{#1} & #2 \\
      \textit{#3} & \textit{#4} \\
    \end{tabular*}\vspace{-5pt}
}
\newcommand{\resumeSubItem}[2]{\resumeItem{#1}{#2}\vspace{-3pt}}
\renewcommand{\labelitemii}{$\circ$}
\newcommand{\resumeSubHeadingListStart}{\begin{itemize}[leftmargin=*]}
\newcommand{\resumeSubHeadingListEnd}{\end{itemize}}
\newcommand{\resumeItemListStart}{\begin{itemize}}
\newcommand{\resumeItemListEnd}{\end{itemize}\vspace{-5pt}}
`;

function buildHeader(resume: AppResume): string {
  const { personalInfo } = resume;
  const contactLines: string[] = [];

  contactLines.push(
    `Email: \\href{mailto:${escapeLatex(personalInfo.email)}}{${escapeLatex(personalInfo.email)}}`,
  );
  if (personalInfo.phone) {
    contactLines.push(`Mobile:~~~${escapeLatex(personalInfo.phone)}`);
  }

  const linkLines: string[] = [];
  if (personalInfo.linkedin) {
    linkLines.push(
      `\\href{https://${escapeLatex(personalInfo.linkedin.replace(/^https?:\/\//, ""))}}{LinkedIn: ${escapeLatex(personalInfo.linkedin)}}`,
    );
  }
  if (personalInfo.github) {
    linkLines.push(
      `\\href{https://${escapeLatex(personalInfo.github.replace(/^https?:\/\//, ""))}}{Github: ${escapeLatex(personalInfo.github)}}`,
    );
  }
  if (personalInfo.portfolio) {
    linkLines.push(
      `\\href{https://${escapeLatex(personalInfo.portfolio.replace(/^https?:\/\//, ""))}}{Portfolio: ${escapeLatex(personalInfo.portfolio)}}`,
    );
  }

  return String.raw`\begin{tabular*}{\textwidth}{l@{\extracolsep{\fill}}r}
  \textbf{{\LARGE ${escapeLatex(personalInfo.fullName)}}} & ${contactLines.join(" \\\\\n  & ")} \\
  ${linkLines.join(" \\\\\n  ")}
\end{tabular*}`;
}

function buildExperience(resume: AppResume): string {
  if (resume.experience.length === 0) return "";

  const entries = resume.experience
    .map((exp) => {
      const bullets = exp.achievements
        .filter((a) => a && a.trim())
        .map((a) => `\\resumeItem{Highlight}{${escapeLatex(a)}}`)
        .join("\n");

      return String.raw`\resumeSubheading{${escapeLatex(exp.company)}}{${escapeLatex(exp.location)}}
{${escapeLatex(exp.position)}}{${formatDateRange(exp.startDate, exp.endDate)}}
${exp.description ? `\\resumeItemListStart\n\\resumeItem{Overview}{${escapeLatex(exp.description)}}\n${bullets}\n\\resumeItemListEnd` : bullets ? `\\resumeItemListStart\n${bullets}\n\\resumeItemListEnd` : ""}`;
    })
    .join("\n\\vspace{0pt}\n\n");

  return `\\section{Experience}\n\\resumeSubHeadingListStart\n\n${entries}\n\n\\resumeSubHeadingListEnd`;
}

function buildEducation(resume: AppResume): string {
  if (resume.education.length === 0) return "";

  const entries = resume.education
    .map((edu) => {
      const detail = edu.gpa
        ? `GPA: ${escapeLatex(edu.gpa)}`
        : edu.achievements?.[0]
          ? escapeLatex(edu.achievements[0])
          : "";
      const detailLine = detail
        ? `\n\\resumeItemListStart\n\\resumeItem{Note}{${detail}}\n\\resumeItemListEnd`
        : "";
      return String.raw`\resumeSubheading{${escapeLatex(edu.institution)}}{${escapeLatex(edu.location)}}
{${escapeLatex(edu.degree)}, ${escapeLatex(edu.field)}}{${formatDateRange(edu.startDate, edu.endDate)}}${detailLine}`;
    })
    .join("\n");

  return `\\section{Education}\n\\resumeSubHeadingListStart\n${entries}\n\\resumeSubHeadingListEnd`;
}

function buildSkills(resume: AppResume): string {
  if (resume.skills.length === 0) return "";

  const entries = resume.skills
    .filter((s) => s.category && s.items.length > 0)
    .map(
      (s) =>
        `\\resumeSubItem{${escapeLatex(s.category)}}{${s.items.map(escapeLatex).join(", ")}}`,
    )
    .join("\n");

  return `\\section{Skills Summary}\n\\resumeSubHeadingListStart\n${entries}\n\\resumeSubHeadingListEnd`;
}

function buildProjects(resume: AppResume): string {
  if (resume.projects.length === 0) return "";

  const entries = resume.projects
    .map((proj) => {
      const link = proj.github
        ? `\n\\href{https://${escapeLatex(proj.github.replace(/^https?:\/\//, ""))}}{[GitHub]}`
        : "";
      const highlightLines = proj.highlights
        .filter((h) => h && h.trim())
        .map((h) => `\\textbullet~${escapeLatex(h)}\\\\`)
        .join("\n");
      const tech = proj.technologies.length
        ? `\\textbf{Tech Stack:} ${proj.technologies.map(escapeLatex).join(", ")}`
        : "";

      return `\\resumeSubItem{${escapeLatex(proj.name)}${link}}{\n${escapeLatex(proj.description)}\\\\\n${highlightLines}\n${tech}\n}`;
    })
    .join("\n\n\\vspace{5pt}\n\n");

  return `\\section{Projects}\n\\resumeSubHeadingListStart\n\n${entries}\n\\resumeSubHeadingListEnd`;
}

function buildAchievements(resume: AppResume): string {
  const items = (resume.achievements ?? [])
    .filter((a) => !!a)
    .map((a) => {
      const title = a.title ? escapeLatex(a.title) : "";
      const description = a.description ? escapeLatex(a.description) : "";
      return `\\resumeSubItem{${title}}{${description}}`;
    })
    .join("\n");

  if (!items) return "";
  return `\\section{Achievements}\n\\resumeSubHeadingListStart\n${items}\n\\resumeSubHeadingListEnd`;
}

// User-defined sections beyond the fixed set — same visual vocabulary as
// Projects (bold heading, italic subheading, paragraph, bullets) so an
// arbitrary section name still renders consistently.
function buildCustomSections(resume: AppResume): string {
  return (resume.customSections ?? [])
    .filter((section) => section.title && section.items.length > 0)
    .map((section) => {
      const entries = section.items
        .map((item) => {
          const headingLine = item.heading
            ? `\\textbf{${escapeLatex(item.heading)}}`
            : "";
          const subheadingLine = item.subheading
            ? ` \\textit{${escapeLatex(item.subheading)}}`
            : "";
          const descriptionLine = item.description
            ? `\\\\\n${escapeLatex(item.description)}`
            : "";
          const bulletLines = (item.bullets ?? [])
            .filter((b) => b && b.trim())
            .map((b) => `\\textbullet~${escapeLatex(b)}\\\\`)
            .join("\n");

          return `\\item\\small{${headingLine}${subheadingLine}${descriptionLine}\n${bulletLines}\n}`;
        })
        .join("\n");

      return `\\section{${escapeLatex(section.title)}}\n\\resumeItemListStart\n${entries}\n\\resumeItemListEnd`;
    })
    .join("\n\n");
}

// Renders the current structured resume (personalInfo/experience/education/
// skills/projects/achievements) into a compilable .tex document. This is
// the "Form -> LaTeX" direction of the sync — always safe to regenerate,
// unlike the reverse.
export function generateLatexFromResume(rawResume: AppResume): string {
  const resume = normalize(rawResume);
  const sections = [
    "\\vspace{-2pt}\n\\section{Professional Summary}\n\\vspace{2pt}\n" +
      escapeLatex(resume.summary),
    buildSkills(resume),
    buildExperience(resume),
    buildProjects(resume),
    buildEducation(resume),
    buildAchievements(resume),
    buildCustomSections(resume),
  ].filter(Boolean);

  return `${PREAMBLE}
\\begin{document}

%----------HEADING-----------------
${buildHeader(resume)}

${sections.join("\n\n")}

\\end{document}
`;
}
