// Seed .tex content for a brand-new LaTeX resume document.
export const DEFAULT_LATEX_SOURCE = String.raw`\documentclass[11pt,letterpaper]{article}
\usepackage[margin=1in]{geometry}
\usepackage{enumitem}
\pagestyle{empty}

\begin{document}

\begin{center}
  {\LARGE \textbf{Your Name}} \\
  \vspace{2pt}
  your.email@example.com \textbar\ (555) 123-4567 \textbar\ City, State
\end{center}

\section*{Experience}
\textbf{Company Name} \hfill Month Year -- Present \\
\textit{Job Title}
\begin{itemize}[leftmargin=*, itemsep=0pt]
  \item Describe an accomplishment with measurable impact.
  \item Describe another accomplishment.
\end{itemize}

\section*{Education}
\textbf{University Name} \hfill Month Year \\
Degree, Field of Study

\section*{Skills}
Languages, frameworks, and tools go here.

\end{document}
`;
