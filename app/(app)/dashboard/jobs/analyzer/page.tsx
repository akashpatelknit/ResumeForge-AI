"use client";

import { useState, useRef } from "react";
import {
  Search,
  Briefcase,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Sparkles,
  Copy,
  Save,
  Zap,
  ChevronDown,
  Tag,
  TrendingUp,
  Clock,
  Plus,
  ArrowRight,
  FileText,
  BarChart2,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { generateText } from "@/lib/gemini";

// ─── Types ────────────────────────────────────────────────────────────────────

type Priority = "High" | "Medium" | "Low";

interface Skill {
  name: string;
  inResume: boolean;
}

interface MissingSkill {
  name: string;
  priority: Priority;
}

interface Keyword {
  word: string;
  frequency: number;
  inResume: boolean;
}

interface Suggestion {
  id: string;
  text: string;
}

interface AnalysisResult {
  score: number;
  requiredSkills: Skill[];
  missingSkills: MissingSkill[];
  keywords: Keyword[];
  experienceRequired: string;
  experienceYours: string;
  experienceMatch: boolean;
  suggestions: Suggestion[];
}

// ─── Sample Data ──────────────────────────────────────────────────────────────

const SAMPLE_RESUMES = [
  { id: "1", label: "Software Engineer Resume" },
  { id: "2", label: "Full Stack Developer CV" },
  { id: "3", label: "Backend Engineer Resume" },
];

const SAMPLE_ANALYSIS: AnalysisResult = {
  score: 78,
  requiredSkills: [
    { name: "React", inResume: true },
    { name: "TypeScript", inResume: true },
    { name: "Node.js", inResume: true },
    { name: "AWS", inResume: true },
    { name: "Docker", inResume: true },
    { name: "Kubernetes", inResume: false },
    { name: "GraphQL", inResume: false },
  ],
  missingSkills: [
    { name: "Kubernetes", priority: "High" },
    { name: "GraphQL", priority: "Medium" },
  ],
  keywords: [
    { word: "scalable", frequency: 4, inResume: true },
    { word: "microservices", frequency: 3, inResume: false },
    { word: "agile", frequency: 2, inResume: true },
    { word: "team player", frequency: 2, inResume: true },
    { word: "CI/CD", frequency: 2, inResume: false },
    { word: "distributed systems", frequency: 1, inResume: true },
  ],
  experienceRequired: "5+ years",
  experienceYours: "6 years",
  experienceMatch: true,
  suggestions: [
    {
      id: "s1",
      text: 'Add quantifiable metrics to your bullet points (e.g., "Reduced load time by 40%")',
    },
    {
      id: "s2",
      text: "Include React experience prominently in your summary section",
    },
    {
      id: "s3",
      text: 'Add "microservices" and "Kubernetes" to your skills section',
    },
    {
      id: "s4",
      text: "Mention CI/CD pipeline experience in your DevOps bullet points",
    },
  ],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getScoreColors(score: number) {
  if (score >= 90)
    return {
      ring: "#22c55e",
      bar: "from-green-400 to-green-500",
      badge: "bg-green-100 text-green-700",
      label: "Excellent Match",
    };
  if (score >= 70)
    return {
      ring: "#3b82f6",
      bar: "from-blue-500 to-purple-600",
      badge: "bg-blue-100 text-blue-700",
      label: "Good Match",
    };
  if (score >= 50)
    return {
      ring: "#f59e0b",
      bar: "from-amber-400 to-amber-500",
      badge: "bg-amber-100 text-amber-700",
      label: "Fair Match",
    };
  return {
    ring: "#ef4444",
    bar: "from-red-400 to-red-500",
    badge: "bg-red-100 text-red-700",
    label: "Needs Work",
  };
}

function getPriorityStyle(p: Priority) {
  if (p === "High") return "bg-red-100 text-red-600";
  if (p === "Medium") return "bg-amber-100 text-amber-600";
  return "bg-gray-100 text-gray-500";
}

// ─── Circular Progress ────────────────────────────────────────────────────────

function CircularProgress({ score }: { score: number }) {
  const { ring } = getScoreColors(score);
  const r = 48;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;

  return (
    <div
      className="relative flex items-center justify-center shrink-0"
      style={{ width: 120, height: 120 }}
    >
      <svg
        width="120"
        height="120"
        className="-rotate-90"
        viewBox="0 0 120 120"
      >
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="9"
        />
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke={ring}
          strokeWidth="9"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1s ease" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center leading-none">
        <span className="text-2xl font-bold text-gray-900">{score}</span>
        <span className="text-[11px] text-gray-400 font-medium mt-0.5">
          / 100
        </span>
      </div>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center px-8">
      <div className="relative mb-5">
        <div className="w-20 h-20 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center">
          <BarChart2 className="w-9 h-9 text-blue-400" />
        </div>
        <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-md shadow-blue-200">
          <Sparkles className="w-3.5 h-3.5 text-white" />
        </div>
      </div>
      <h3 className="text-base font-bold text-gray-900 mb-1.5">
        Ready to Analyze
      </h3>
      <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
        Paste a job description on the left and click{" "}
        <span className="font-semibold text-blue-600">Analyze Job</span> to get
        your personalized match report.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {["Match Score", "Skills Gap", "Keywords", "AI Tips"].map((label) => (
          <span
            key={label}
            className="px-3 py-1.5 rounded-lg bg-gray-100 text-xs text-gray-500 font-medium border border-gray-200"
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Analysis Panel ───────────────────────────────────────────────────────────

function AnalysisPanel({
  result,
  onCopy,
  onSave,
}: {
  result: AnalysisResult;
  onCopy: () => void;
  onSave: () => void;
}) {
  const scoreStyle = getScoreColors(result.score);
  const [appliedSkills, setAppliedSkills] = useState<Set<string>>(new Set());
  const [appliedSuggestions, setAppliedSuggestions] = useState<Set<string>>(
    new Set(),
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Match Score */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <div className="flex items-center gap-4">
          <CircularProgress score={result.score} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h3 className="text-base font-bold text-gray-900">Match Score</h3>
              <span
                className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${scoreStyle.badge}`}
              >
                {scoreStyle.label}
              </span>
            </div>
            <p className="text-xs text-gray-500 mb-3">
              Your resume matches most requirements. Close the skills gap to
              improve your score.
            </p>
            <div className="w-full bg-gray-100 rounded-full h-1.5">
              <div
                className={`h-1.5 rounded-full bg-gradient-to-r ${scoreStyle.bar} transition-all duration-1000`}
                style={{ width: `${result.score}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Three-column grid — stacks on small screens */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Required Skills */}
        <div className="bg-white rounded-xl border border-green-200 shadow-sm overflow-hidden">
          <div className="px-4 pt-3 pb-2.5 border-b border-green-100 bg-green-50">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
              <span className="text-xs font-bold text-green-700 uppercase tracking-wide">
                Required Skills
              </span>
            </div>
          </div>
          <ul className="divide-y divide-gray-50 px-4 py-1">
            {result.requiredSkills.map((skill) => (
              <li
                key={skill.name}
                className="flex items-center justify-between py-2"
              >
                <span className="text-sm text-gray-700 font-medium">
                  {skill.name}
                </span>
                {skill.inResume ? (
                  <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Missing Skills */}
        <div className="bg-white rounded-xl border border-amber-200 shadow-sm overflow-hidden">
          <div className="px-4 pt-3 pb-2.5 border-b border-amber-100 bg-amber-50">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
              <span className="text-xs font-bold text-amber-700 uppercase tracking-wide">
                Missing Skills
              </span>
            </div>
          </div>
          <ul className="divide-y divide-gray-50 px-4 py-1">
            {result.missingSkills.map((skill) => (
              <li key={skill.name} className="py-2.5">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-gray-700 font-medium">
                    {skill.name}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${getPriorityStyle(skill.priority)}`}
                  >
                    {skill.priority}
                  </span>
                </div>
                {appliedSkills.has(skill.name) ? (
                  <span className="inline-flex items-center gap-1 text-[11px] text-green-600 font-semibold">
                    <CheckCircle2 className="w-3 h-3" /> Added
                  </span>
                ) : (
                  <button
                    onClick={() =>
                      setAppliedSkills((p) => new Set([...p, skill.name]))
                    }
                    className="inline-flex items-center gap-1 text-[11px] text-blue-600 font-semibold hover:text-blue-800 transition-colors cursor-pointer border-none bg-transparent p-0"
                  >
                    <Plus className="w-3 h-3" /> Add to Resume
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* ATS Keywords */}
        <div className="bg-white rounded-xl border border-blue-200 shadow-sm overflow-hidden">
          <div className="px-4 pt-3 pb-2.5 border-b border-blue-100 bg-blue-50">
            <div className="flex items-center gap-2">
              <Tag className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-xs font-bold text-blue-700 uppercase tracking-wide">
                ATS Keywords
              </span>
            </div>
          </div>
          <ul className="divide-y divide-gray-50 px-4 py-1">
            {result.keywords.map((kw) => (
              <li
                key={kw.word}
                className="flex items-center justify-between py-2"
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <div
                    className={`w-2 h-2 rounded-full shrink-0 ${kw.inResume ? "bg-green-400" : "bg-gray-300"}`}
                  />
                  <span
                    className={`text-sm truncate ${kw.inResume ? "text-gray-700 font-medium" : "text-gray-400"}`}
                  >
                    {kw.word}
                  </span>
                </div>
                <span className="text-[11px] text-gray-400 font-mono ml-2 shrink-0">
                  ×{kw.frequency}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Experience */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-4 h-4 text-blue-500" />
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Experience Match
          </h3>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <p className="text-xs text-gray-400 mb-1 font-medium">Required</p>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 text-sm font-semibold">
              <Briefcase className="w-3.5 h-3.5" />
              {result.experienceRequired}
            </span>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-300 shrink-0 mt-4" />
          <div>
            <p className="text-xs text-gray-400 mb-1 font-medium">
              Your Resume
            </p>
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold ${result.experienceMatch ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              {result.experienceYours}
            </span>
          </div>
          <div className="mt-4">
            {result.experienceMatch ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-50 text-green-600 text-xs font-semibold border border-green-200">
                <CheckCircle2 className="w-3.5 h-3.5" /> You qualify
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-semibold border border-red-200">
                <XCircle className="w-3.5 h-3.5" /> Under requirement
              </span>
            )}
          </div>
        </div>
      </div>

      {/* AI Suggestions */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-4 pt-4 pb-3 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <h3 className="text-sm font-bold text-gray-800">AI Suggestions</h3>
            <span className="ml-auto text-xs text-gray-400">
              {result.suggestions.length} improvements
            </span>
          </div>
        </div>
        <ul className="divide-y divide-gray-50">
          {result.suggestions.map((s) => (
            <li key={s.id} className="flex items-start gap-3 px-4 py-3">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 shrink-0" />
              <p className="text-sm text-gray-600 flex-1 leading-relaxed">
                {s.text}
              </p>
              {appliedSuggestions.has(s.id) ? (
                <span className="shrink-0 text-xs text-green-600 font-semibold flex items-center gap-1 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Applied
                </span>
              ) : (
                <button
                  onClick={() =>
                    setAppliedSuggestions((p) => new Set([...p, s.id]))
                  }
                  className="shrink-0 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors mt-0.5 px-2 py-1 rounded-lg hover:bg-blue-50 cursor-pointer border-none bg-transparent"
                >
                  Apply
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-2 pt-1 pb-2">
        <button
          onClick={onCopy}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-600 text-sm font-medium hover:border-gray-300 hover:bg-gray-50 transition-all cursor-pointer"
        >
          <Copy className="w-4 h-4" /> Copy Analysis
        </button>
        <button
          onClick={onSave}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-600 text-sm font-medium hover:border-gray-300 hover:bg-gray-50 transition-all cursor-pointer"
        >
          <Save className="w-4 h-4" /> Save Report
        </button>
        <button className="ml-auto flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold shadow-md shadow-blue-200 hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer border-none">
          <Zap className="w-4 h-4" /> Optimize Resume
        </button>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function JobAnalyzer() {
  const [jobDescription, setJobDescription] = useState("");
  const [selectedResume, setSelectedResume] = useState(SAMPLE_RESUMES[0].id);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [copied, setCopied] = useState(false);
  const rightPanelRef = useRef<HTMLDivElement>(null);

  const charLimit = 5000;

  const handleAnalyze = async () => {
    if (!jobDescription.trim()) return;
    setIsAnalyzing(true);
    await new Promise((r) => setTimeout(r, 1600));
    setResult(SAMPLE_ANALYSIS);
    setIsAnalyzing(false);
    setTimeout(
      () => rightPanelRef.current?.scrollTo({ top: 0, behavior: "smooth" }),
      100,
    );
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(
      `Job Analysis Report\nMatch Score: ${SAMPLE_ANALYSIS.score}/100\nStatus: ${getScoreColors(SAMPLE_ANALYSIS.score).label}`,
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const testApi = async () => {
    fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization:
          "Bearer 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",
        "HTTP-Referer": "http://localhost:3000/", // Optional. Site URL for rankings on openrouter.ai.
        "X-Title": "ResumeForge AI", // Optional. Site title for rankings on openrouter.ai.
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-5.2",
        messages: [
          {
            role: "user",
            content: "What is the meaning of life?",
          },
        ],
      }),
    });
  };

  const text = async () => {
    const response = await generateText("What is the meaning of life?");
    console.log(response);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header — matches ApplicationTracker exactly */}

      {/* <div className="mb-4 sm:mb-6">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-200 shrink-0">
              <Search className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">
                Job Analyzer
              </h1>
              <p className="text-xs text-gray-500 hidden sm:block">
                Paste any job description for an instant AI-powered match
                report.
              </p>
            </div>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold shrink-0">
            AI Powered
          </span>
        </div>
      </div> */}

      {/* Split layout — stacks on mobile, side-by-side on lg+ */}
      <div className="flex flex-col lg:grid lg:grid-cols-2 gap-4 lg:gap-6 lg:h-[calc(100vh-140px)]">
        {/* ── LEFT: Input Panel ── */}
        <div className="flex flex-col gap-4 lg:overflow-y-auto lg:pr-1">
          {/* Resume Selector */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              Select Resume
            </label>
            <div className="relative w-full">
              <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />

              <Select
                value={selectedResume}
                onValueChange={(value) => setSelectedResume(value)}
              >
                <SelectTrigger className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-9 py-2.5 text-sm font-medium text-gray-700 focus:ring-2 focus:ring-blue-400">
                  <SelectValue placeholder="Select Resume" />
                </SelectTrigger>

                <SelectContent>
                  {SAMPLE_RESUMES.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Textarea */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-col flex-1">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Job Description
              </label>
              <span
                className={`text-xs font-mono ${jobDescription.length > charLimit * 0.9 ? "text-red-400" : "text-gray-400"}`}
              >
                {jobDescription.length.toLocaleString()} /{" "}
                {charLimit.toLocaleString()}
              </span>
            </div>

            <textarea
              value={jobDescription}
              onChange={(e) =>
                setJobDescription(e.target.value.slice(0, charLimit))
              }
              placeholder={
                "Paste the job description here...\n\ne.g. We are looking for a Senior Software Engineer with 5+ years of experience in React, TypeScript, and Node.js..."
              }
              className="flex-1 min-h-[260px] sm:min-h-[320px] resize-none bg-gray-50 rounded-lg border border-gray-200 p-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent leading-relaxed"
            />

            {jobDescription.length > 0 && (
              <div className="mt-2.5 w-full bg-gray-100 rounded-full h-1">
                <div
                  className="h-1 rounded-full transition-all"
                  style={{
                    width: `${Math.min((jobDescription.length / charLimit) * 100, 100)}%`,
                    background:
                      jobDescription.length > charLimit * 0.9
                        ? "#ef4444"
                        : "linear-gradient(to right, #2563eb, #7c3aed)",
                  }}
                />
              </div>
            )}

            <button
              onClick={handleAnalyze}
              disabled={!jobDescription.trim() || isAnalyzing}
              className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold shadow-md shadow-blue-200 hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-md cursor-pointer border-none"
            >
              {isAnalyzing ? (
                <>
                  <svg
                    className="animate-spin w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="white"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="white"
                      d="M4 12a8 8 0 018-8v8z"
                    />
                  </svg>
                  Analyzing…
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Analyze Job
                </>
              )}
            </button>
          </div>
        </div>

        {/* ── RIGHT: Results Panel ── */}
        <div ref={rightPanelRef} className="lg:overflow-y-auto lg:pr-1">
          {result ? (
            <AnalysisPanel
              result={result}
              onCopy={handleCopy}
              onSave={() => alert("Report saved!")}
            />
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm h-full">
              <EmptyState />
            </div>
          )}
        </div>
      </div>

      {/* Copy toast */}
      {copied && (
        <div className="fixed bottom-6 right-6 flex items-center gap-2 bg-gray-900 text-white text-sm font-medium px-4 py-2.5 rounded-xl shadow-xl z-50">
          <CheckCircle2 className="w-4 h-4 text-green-400" />
          Analysis copied to clipboard
        </div>
      )}
    </div>
  );
}
