"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import Editor from "@monaco-editor/react";

export default function LatexEditorPage() {
  const [latexCode, setLatexCode] =
    useState(`\\documentclass[a4paper,20pt]{article}

\\usepackage{latexsym}
\\usepackage[empty]{fullpage}
\\usepackage{titlesec}
\\usepackage{marvosym}
\\usepackage[usenames,dvipsnames]{color}
\\usepackage{verbatim}
\\usepackage{enumitem}
\\usepackage[pdftex]{hyperref}
\\usepackage{fancyhdr}

\\pagestyle{fancy}
\\fancyhf{}
\\fancyfoot{}
\\renewcommand{\\headrulewidth}{0pt}
\\renewcommand{\\footrulewidth}{0pt}

\\addtolength{\\oddsidemargin}{-0.530in}
\\addtolength{\\evensidemargin}{-0.375in}
\\addtolength{\\textwidth}{1in}
\\addtolength{\\topmargin}{-.45in}
\\addtolength{\\textheight}{1in}

\\urlstyle{rm}
\\raggedbottom
\\raggedright
\\setlength{\\tabcolsep}{0in}

\\titleformat{\\section}{
  \\vspace{-10pt}\\scshape\\raggedright\\large
}{}{0em}{}[\\color{black}\\titlerule \\vspace{-6pt}]

\\newcommand{\\resumeItem}[2]{
  \\item\\small{
    \\textbf{#1}{: #2 \\vspace{-2pt}}
  }
}

\\newcommand{\\resumeSubheading}[4]{
  \\vspace{-1pt}\\item
    \\begin{tabular*}{0.97\\textwidth}{l@{\\extracolsep{\\fill}}r}
      \\textbf{#1} & #2 \\\\
      \\textit{#3} & \\textit{#4} \\\\
    \\end{tabular*}\\vspace{-5pt}
}

\\newcommand{\\resumeSubItem}[2]{\\resumeItem{#1}{#2}\\vspace{-3pt}}
\\newcommand{\\resumeSubHeadingListStart}{\\begin{itemize}[leftmargin=*]}
\\newcommand{\\resumeSubHeadingListEnd}{\\end{itemize}}
\\newcommand{\\resumeItemListStart}{\\begin{itemize}}
\\newcommand{\\resumeItemListEnd}{\\end{itemize}\\vspace{-5pt}}

\\begin{document}

\\begin{tabular*}{\\textwidth}{l@{\\extracolsep{\\fill}}r}
  \\textbf{{\\LARGE Akash Patel}} & Email: akashpatel20606@gmail.com\\\\
  LinkedIn: linkedin.com/in/akash-patel & Mobile: +91-9369201975 \\\\
  Github: github.com/akashpatelknit \\\\
\\end{tabular*}

\\vspace{-5pt}
\\section{Professional Summary}
Full Stack Developer with 3+ years of experience building end-to-end web applications using React, Node.js, and modern JavaScript technologies.

\\section{Skills Summary}
\\resumeSubHeadingListStart
\\resumeSubItem{Frontend}{React.js, Next.js, Redux, TypeScript, JavaScript}
\\resumeSubItem{Backend}{Node.js, Express.js, Spring Boot, RESTful APIs}
\\resumeSubItem{Databases}{MongoDB, PostgreSQL, Redis, SQL}
\\resumeSubHeadingListEnd

\\section{Experience}
\\resumeSubHeadingListStart
\\resumeSubheading{Tata Consultancy Services}{Remote / India}
{Full Stack Developer}{May 2023 - Present}
\\resumeItemListStart
\\resumeItem{Development}{Delivered 15+ full-stack features using React.js and TypeScript}
\\resumeItem{Performance}{Optimized queries reducing execution time by 60\\%}
\\resumeItemListEnd
\\resumeSubHeadingListEnd

\\end{document}`);

  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<"vs-dark" | "light">("vs-dark");

  const compileLaTeX = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/compile-latex", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ latexCode }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);

        if (pdfUrl) {
          window.URL.revokeObjectURL(pdfUrl);
        }

        setPdfUrl(url);
      } else {
        setError("Failed to compile LaTeX");
      }
    } catch (err) {
      setError("Error compiling LaTeX: " + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = () => {
    if (pdfUrl) {
      const a = document.createElement("a");
      a.href = pdfUrl;
      a.download = "resume.pdf";
      a.click();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">LaTeX Resume Editor</h1>
          <div className="flex gap-2">
            <Button
              onClick={() =>
                setTheme(theme === "vs-dark" ? "light" : "vs-dark")
              }
              variant="outline"
              size="sm"
            >
              {theme === "vs-dark" ? "☀️ Light" : "🌙 Dark"}
            </Button>
            <Button onClick={compileLaTeX} disabled={loading}>
              {loading ? "Compiling..." : "▶ Compile & Preview"}
            </Button>
            {pdfUrl && (
              <Button onClick={downloadPDF} variant="outline">
                ⬇ Download PDF
              </Button>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-700">
            ❌ {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Left: Monaco Code Editor */}
          <Card className="p-4">
            <h2 className="text-lg font-semibold mb-3">LaTeX Code</h2>
            <div className="border rounded overflow-hidden h-[calc(100vh-200px)]">
              <Editor
                height="100%"
                defaultLanguage="latex"
                theme={theme}
                value={latexCode}
                onChange={(value) => setLatexCode(value || "")}
                options={{
                  minimap: { enabled: false },
                  fontSize: 13,
                  lineNumbers: "on",
                  scrollBeyondLastLine: false,
                  wordWrap: "on",
                  automaticLayout: true,
                  tabSize: 2,
                  fontFamily: "Fira Code, Consolas, monospace",
                  fontLigatures: true,
                  formatOnPaste: true,
                  formatOnType: true,
                }}
              />
            </div>
          </Card>

          {/* Right: PDF Preview */}
          <Card className="p-4">
            <h2 className="text-lg font-semibold mb-3">PDF Preview</h2>
            <div className="border rounded bg-white h-[calc(100vh-200px)] overflow-hidden">
              {pdfUrl ? (
                <iframe
                  src={pdfUrl}
                  className="w-full h-full"
                  title="PDF Preview"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <div className="text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-300"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <p className="mt-2">Click "Compile & Preview" to see PDF</p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
