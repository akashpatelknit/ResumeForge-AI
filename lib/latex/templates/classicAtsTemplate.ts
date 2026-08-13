// Original layout/macros: Anubhav Singh (https://github.com/xprilion), MIT licensed
// — license header preserved below as required by the MIT license.
// Content (name, experience, projects, etc.) filled in as a working example.
export const CLASSIC_ATS_LATEX_SOURCE = String.raw`%------------------------
% Resume Template
% Author : Anubhav Singh
% Github : https://github.com/xprilion
% License : MIT
%------------------------

\documentclass[a4paper,20pt]{article}

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
  \item\small{
    \textbf{#1}{: #2 \vspace{-2pt}}
  }
}

\newcommand{\resumeItemWithoutTitle}[1]{
  \item\small{
    {\vspace{-2pt}}
  }
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

%-----------------------------
%%%%%%  CV STARTS HERE  %%%%%%

\begin{document}

%----------HEADING-----------------
\begin{tabular*}{\textwidth}{l@{\extracolsep{\fill}}r}
  \textbf{{\LARGE Your Name}} & Email: \href{mailto:you@example.com}{you@example.com}\\
  \href{https://www.linkedin.com/in/yourprofile/}{LinkedIn: linkedin.com/in/yourprofile} & Mobile:~~~+1 (555) 123-4567 \\
  \href{https://github.com/yourusername}{Github: ~~github.com/yourusername} \\
\end{tabular*}

%-----------PROFESSIONAL SUMMARY-----------------
\vspace{-2pt}
\section{Professional Summary}
\vspace{2pt}
One or two sentences summarizing your experience, focus area, and what you're looking for.

\vspace{-2pt}
\section{Skills Summary}
\resumeSubHeadingListStart
\resumeSubItem{Category One}{Skill, Skill, Skill, Skill}
\resumeSubItem{Category Two}{Skill, Skill, Skill, Skill}
\resumeSubItem{Category Three}{Skill, Skill, Skill, Skill}
\resumeSubHeadingListEnd
\vspace{-2pt}

\section{Experience}
\resumeSubHeadingListStart

\resumeSubheading{Company Name}{City / Country}
{Job Title}{Month Year -- Present}
\resumeItemListStart
\resumeItem{Highlight Title}
{Describe an accomplishment with measurable impact.}

\resumeItem{Highlight Title}
{Describe another accomplishment with measurable impact.}
\resumeItemListEnd

\vspace{0pt}

\resumeSubheading{Previous Company}{City / Country}
{Job Title}{Month Year -- Month Year}
\resumeItemListStart
\resumeItem{Highlight Title}
{Describe an accomplishment with measurable impact.}
\resumeItemListEnd

\resumeSubHeadingListEnd
\vspace{-2pt}
\section{Projects}
\resumeSubHeadingListStart

\resumeSubItem{Project Name
\href{https://github.com/yourusername/project}{[GitHub]}}{
One-line project description.\\
\textbullet~A notable detail about what you built or solved.\\
\textbf{Tech Stack:} Tech, Tech, Tech
}

\resumeSubHeadingListEnd
\vspace{-2pt}

%-----------EDUCATION-----------------
\section{Education}
\resumeSubHeadingListStart
\resumeSubheading{Degree, Field}{Institution Name}
{Relevant Coursework}
{Start Year -- End Year}
\resumeSubHeadingListEnd

\vspace{-2pt}
\section{Achievements}
\resumeSubHeadingListStart
\resumeSubItem{Achievement Title}{Brief description of the achievement.}
\resumeSubHeadingListEnd

\end{document}
`;
