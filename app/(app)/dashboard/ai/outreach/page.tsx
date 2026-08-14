"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Linkedin,
  Mail,
  Users,
  MessageSquare,
  Sparkles,
  Copy,
  RefreshCw,
  ChevronDown,
  FileText,
  CheckCircle,
  Lightbulb,
  User,
  Building2,
  Briefcase,
  ArrowRight,
  Wand2,
  Clock,
  AlertCircle,
  PlusCircle,
} from "lucide-react";
import { mapResumeFromDB } from "@/mapper/mapResumeFromDB";
import type { AppResume } from "@/types/resume";
import AddToTrackerPrompt from "@/components/shared/AddToTrackerPrompt";

const TONES = ["Professional", "Friendly", "Direct"];

// The three LinkedIn message types share one endpoint (/api/ai/linkedin,
// differentiated by `tool`) and a character-limit/tips shape; Cold Email
// and Cover Letter are appended as two more tabs on the same bar, each
// hitting their own endpoint.
const LINKEDIN_TABS = [
  { id: "connect", label: "Connect Request", icon: Linkedin, charLimit: 300 },
  { id: "referral", label: "Referral", icon: Users, charLimit: 1000 },
  { id: "followup", label: "Follow-up", icon: MessageSquare, charLimit: 500 },
] as const;

const ALL_TABS = [
  ...LINKEDIN_TABS,
  { id: "coldEmail", label: "Cold Email", icon: Mail },
  { id: "coverLetter", label: "Cover Letter", icon: FileText },
] as const;

type TabId = (typeof ALL_TABS)[number]["id"];

const TIPS: Record<string, string[]> = {
  connect: [
    "Keep it under 300 characters",
    "Mention a specific detail about their work",
    "End with a clear reason for connecting",
  ],
  referral: [
    "Mention how you know them",
    "Be specific about the role you want",
    "Keep it concise and respectful",
  ],
  followup: [
    "Reference your previous message",
    "Add new value in each follow-up",
    "Don't follow up more than 3 times",
  ],
};

const EMAIL_TYPES = [
  { id: "job", label: "Job Application" },
  { id: "networking", label: "Networking" },
  { id: "followup", label: "Follow-up on Application" },
  { id: "cold", label: "Cold Outreach" },
];

const SEQUENCE_OPTIONS = [
  { value: 2, label: "2 Emails (Initial + 1 Follow-up)" },
  { value: 3, label: "3 Emails (Initial + 2 Follow-ups)" },
  { value: 4, label: "4 Emails (Full Sequence)" },
];

const FOLLOWUP_DAYS = [
  { email: 2, options: [3, 5, 7] },
  { email: 3, options: [7, 10, 14] },
  { email: 4, options: [14, 21, 30] },
];

interface ColdEmailEntry {
  day: number;
  label: string;
  subject: string;
  body: string;
}
interface ColdEmailResult {
  subjects: string[];
  emails: ColdEmailEntry[];
}

// Each tab tracks its own generation lifecycle independently so switching
// tabs never loses or overwrites another tab's result, and a regenerate on
// one tab never spins the others. `result` shape differs per tab (plain
// string for the three LinkedIn tabs + cover letter, ColdEmailResult for
// cold email) — kept loose here and narrowed at render time, since this is
// page-local UI state, not a shared API contract.
interface TabState {
  status: "idle" | "loading" | "success" | "error";
  result: string | ColdEmailResult | null;
  error?: string;
}

const initialTabState: Record<TabId, TabState> = {
  connect: { status: "idle", result: null },
  referral: { status: "idle", result: null },
  followup: { status: "idle", result: null },
  coldEmail: { status: "idle", result: null },
  coverLetter: { status: "idle", result: null },
};

// The "Track this application?" suggestion, scoped per tab so switching
// tabs never carries a stale suggestion from a different generation, and
// `nonce` forces a fresh AddToTrackerPrompt mount on every new generation
// (so a dismissal only suppresses that one generation's prompt, never the
// next regenerate's).
interface TrackerSuggestion {
  companyName: string;
  roleTitle: string;
  jobDescription: string;
  nonce: number;
}

const initialTrackerSuggestions: Record<TabId, TrackerSuggestion | null> = {
  connect: null,
  referral: null,
  followup: null,
  coldEmail: null,
  coverLetter: null,
};

export default function AIOutreachPage() {
  // Resume selector — real saved resumes for the signed-in user, not sample data.
  const [resumes, setResumes] = useState<AppResume[]>([]);
  const [resumesLoading, setResumesLoading] = useState(true);
  const [resumesError, setResumesError] = useState<string | null>(null);
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(
    null,
  );
  const [showResumeDropdown, setShowResumeDropdown] = useState(false);

  const [inputMode, setInputMode] = useState<"jd" | "manual">("jd");
  const [jobDescription, setJobDescription] = useState("");
  const [tone, setTone] = useState("Professional");
  const [manualInputs, setManualInputs] = useState({
    targetName: "",
    targetRole: "",
    company: "",
  });

  const [activeTab, setActiveTab] = useState<TabId>("connect");
  const [tabState, setTabState] =
    useState<Record<TabId, TabState>>(initialTabState);

  const [trackerSuggestions, setTrackerSuggestions] = useState<
    Record<TabId, TrackerSuggestion | null>
  >(initialTrackerSuggestions);
  const trackerNonceRef = useRef(0);
  // Company/role extracted per unique JD text — avoids re-hitting
  // /api/ai/extract-job-identity on every regenerate of the same JD.
  const jdIdentityCache = useRef<Map<string, { companyName: string; roleTitle: string }>>(
    new Map(),
  );

  // Cold Email tab's own settings — scoped to that tab, not the shared panel.
  const [emailType, setEmailType] = useState("job");
  const [sequenceLength, setSequenceLength] = useState(3);
  const [followupSchedule, setFollowupSchedule] = useState<
    Record<number, number>
  >({ 2: 3, 3: 7, 4: 14 });

  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch("/api/resumes");
        const data = await res.json();

        if (!res.ok || !Array.isArray(data)) {
          throw new Error((data && data.error) || "Failed to load resumes");
        }

        if (cancelled) return;

        const mapped = data.map((r: unknown) =>
          mapResumeFromDB(r as Parameters<typeof mapResumeFromDB>[0]),
        );
        setResumes(mapped);
        setSelectedResumeId(mapped[0]?.id ?? null);
      } catch (err) {
        if (!cancelled) {
          setResumesError(
            err instanceof Error ? err.message : "Failed to load resumes",
          );
        }
      } finally {
        if (!cancelled) setResumesLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const selectedResume =
    resumes.find((r) => r.id === selectedResumeId) ?? null;

  const activeLinkedInTab = LINKEDIN_TABS.find((t) => t.id === activeTab);
  const activeState = tabState[activeTab];

  const charCount =
    activeLinkedInTab && typeof activeState.result === "string"
      ? activeState.result.length
      : 0;
  const charLimit = activeLinkedInTab?.charLimit ?? 300;
  const charPercent = Math.min((charCount / charLimit) * 100, 100);
  const getCharColor = () => {
    if (charPercent < 70) return "#16a34a";
    if (charPercent < 90) return "#d97706";
    return "#dc2626";
  };

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  // Only called after a successful generation. Manual Input mode already
  // has a structured, user-typed company — no AI needed. JD mode calls the
  // dedicated extraction endpoint (not the generation prompt itself, which
  // for the LinkedIn tabs returns plain text) and shows nothing if no
  // company name comes back confidently.
  const suggestTrackerEntry = async (tab: TabId) => {
    let companyName = "";
    let roleTitle = "";

    if (inputMode === "manual") {
      companyName = manualInputs.company.trim();
      roleTitle = manualInputs.targetRole.trim();
    } else {
      const jd = jobDescription.trim();
      if (jd) {
        const cached = jdIdentityCache.current.get(jd);
        if (cached) {
          companyName = cached.companyName;
          roleTitle = cached.roleTitle;
        } else {
          try {
            const res = await fetch("/api/ai/extract-job-identity", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ jobDescription: jd }),
            });
            const data = await res.json();
            if (res.ok && data?.result) {
              companyName = data.result.companyName ?? "";
              roleTitle = data.result.roleTitle ?? "";
              jdIdentityCache.current.set(jd, { companyName, roleTitle });
            }
          } catch {
            // Extraction failing just means no prompt — never guess.
          }
        }
      }
    }

    if (!companyName) {
      setTrackerSuggestions((prev) => ({ ...prev, [tab]: null }));
      return;
    }

    trackerNonceRef.current += 1;
    setTrackerSuggestions((prev) => ({
      ...prev,
      [tab]: {
        companyName,
        roleTitle,
        jobDescription: jobDescription.trim(),
        nonce: trackerNonceRef.current,
      },
    }));
  };

  const runGeneration = async (tab: TabId) => {
    if (!selectedResume) return;

    setTabState((prev) => ({
      ...prev,
      [tab]: { ...prev[tab], status: "loading", error: undefined },
    }));

    try {
      let endpoint: string;
      let payload: Record<string, unknown>;

      if (tab === "connect" || tab === "referral" || tab === "followup") {
        endpoint = "/api/ai/linkedin";
        payload = {
          tool: tab,
          resume: selectedResume,
          jobDescription,
          manualInputs,
          tone,
        };
      } else if (tab === "coldEmail") {
        endpoint = "/api/ai/cold-email";
        payload = {
          emailType,
          tone,
          sequenceLength,
          followupSchedule,
          jobDescription,
          resume: selectedResume,
        };
      } else {
        endpoint = "/api/ai/generate-cover-letter";
        payload = { resume: selectedResume, jobDescription, tone };
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Generation failed");
      }

      setTabState((prev) => ({
        ...prev,
        [tab]: { status: "success", result: data.result },
      }));
      void suggestTrackerEntry(tab);
    } catch (err) {
      setTabState((prev) => ({
        ...prev,
        [tab]: {
          ...prev[tab],
          status: "error",
          error: err instanceof Error ? err.message : "Generation failed",
        },
      }));
    }
  };

  // ─── No resumes yet ───
  if (!resumesLoading && resumes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center gap-4 bg-white rounded-2xl border border-gray-200 shadow-sm">
        <div className="w-16 h-16 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center">
          <FileText className="w-7 h-7 text-purple-500" />
        </div>
        <div>
          <p className="text-base font-semibold text-gray-800 mb-1">
            Create a resume first
          </p>
          <p className="text-sm text-gray-400 max-w-xs mx-auto leading-relaxed">
            LinkedIn messages, cold emails, and cover letters are generated
            from your saved resume — add one to get started.
          </p>
        </div>
        <Link
          href="/dashboard/resumes"
          className="mt-2 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-linear-to-r from-purple-600 to-blue-600 text-white text-sm font-semibold shadow-lg shadow-purple-200 hover:shadow-xl hover:-translate-y-0.5 transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          Go to My Resumes
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 p-0">
      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-5 items-start">
        {/* ── LEFT PANEL (shared across every tab) ── */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-visible">
          {/* Resume Selector */}
          <div className="p-5 border-b border-gray-100">
            <label className="text-xs font-semibold text-purple-600 uppercase tracking-wider block mb-2">
              Your Resume
            </label>
            <div className="relative">
              <button
                onClick={() => setShowResumeDropdown(!showResumeDropdown)}
                disabled={resumesLoading}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 flex items-center gap-3 cursor-pointer hover:border-purple-300 transition-colors text-left disabled:cursor-not-allowed disabled:opacity-60"
              >
                <FileText className="w-4 h-4 text-purple-600 shrink-0" />
                <span className="flex-1 text-sm text-gray-700 font-medium truncate">
                  {resumesLoading
                    ? "Loading resumes..."
                    : (selectedResume?.title ?? "Select a resume")}
                </span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>

              {showResumeDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-20 max-h-64 overflow-y-auto">
                  {resumes.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => {
                        setSelectedResumeId(r.id);
                        setShowResumeDropdown(false);
                      }}
                      className={`w-full px-4 py-2.5 flex items-center gap-3 text-left text-sm cursor-pointer border-none transition-colors
                        ${
                          selectedResumeId === r.id
                            ? "bg-purple-50 text-purple-700"
                            : "bg-white text-gray-700 hover:bg-gray-50"
                        }`}
                    >
                      <FileText className="w-4 h-4 shrink-0" />
                      {r.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {resumesError && (
              <p className="text-xs text-red-600 mt-2">{resumesError}</p>
            )}
          </div>

          {/* Input Mode Toggle */}
          <div className="px-5 pt-4">
            <div className="grid grid-cols-2 bg-gray-100 rounded-xl p-1">
              {[
                { id: "jd" as const, label: "Job Description", icon: FileText },
                { id: "manual" as const, label: "Manual Input", icon: User },
              ].map((mode) => {
                const Icon = mode.icon;
                return (
                  <button
                    key={mode.id}
                    onClick={() => setInputMode(mode.id)}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-all cursor-pointer border-none
                      ${
                        inputMode === mode.id
                          ? "bg-white text-purple-700 shadow-sm"
                          : "bg-transparent text-gray-500 hover:text-gray-700"
                      }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {mode.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Input Content */}
          <div className="p-5">
            {inputMode === "jd" ? (
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">
                  Paste Job Description
                </label>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the job description here... AI will extract company, role, and key details automatically."
                  className="w-full h-56 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 resize-none outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all leading-relaxed placeholder:text-gray-400"
                />
              </div>
            ) : (
              <div className="space-y-4">
                {[
                  {
                    key: "targetName" as const,
                    label: "Their Name",
                    icon: User,
                    placeholder: "e.g. Sarah Johnson",
                  },
                  {
                    key: "targetRole" as const,
                    label: "Their Role",
                    icon: Briefcase,
                    placeholder: "e.g. Engineering Manager",
                  },
                  {
                    key: "company" as const,
                    label: "Company",
                    icon: Building2,
                    placeholder: "e.g. Google",
                  },
                ].map((field) => {
                  const Icon = field.icon;
                  return (
                    <div key={field.key}>
                      <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1.5">
                        {field.label}
                      </label>
                      <div className="relative">
                        <Icon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          value={manualInputs[field.key]}
                          onChange={(e) =>
                            setManualInputs({
                              ...manualInputs,
                              [field.key]: e.target.value,
                            })
                          }
                          placeholder={field.placeholder}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-700 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all placeholder:text-gray-400"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Tone Selector */}
          <div className="px-5 pb-5 border-t border-gray-100 pt-4">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">
              Tone
            </label>
            <div className="flex gap-2">
              {TONES.map((t) => (
                <button
                  key={t}
                  onClick={() => setTone(t)}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all border
                    ${
                      tone === t
                        ? "bg-linear-to-r from-purple-600 to-blue-600 text-white border-transparent shadow-md shadow-purple-200"
                        : "bg-white text-gray-500 border-gray-200 hover:border-purple-300 hover:text-purple-600"
                    }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Tab Bar */}
          <div className="flex border-b border-gray-100 bg-gray-50/50 px-2 overflow-x-auto">
            {ALL_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              const state = tabState[tab.id];
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-4 text-sm font-semibold cursor-pointer border-none bg-transparent transition-all whitespace-nowrap
                    ${
                      isActive
                        ? "text-purple-700 border-b-2 border-purple-600 -mb-px"
                        : "text-gray-500 hover:text-gray-700 border-transparent"
                    }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                  {state.status === "success" && (
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block ml-0.5" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="p-6">
            {!selectedResume ? (
              <div className="flex flex-col items-center justify-center py-16 text-center gap-2 text-sm text-gray-400">
                Select a resume on the left to generate content.
              </div>
            ) : activeTab === "coldEmail" ? (
              <ColdEmailTabBody
                state={activeState}
                emailType={emailType}
                setEmailType={setEmailType}
                sequenceLength={sequenceLength}
                setSequenceLength={setSequenceLength}
                followupSchedule={followupSchedule}
                setFollowupSchedule={setFollowupSchedule}
                onGenerate={() => runGeneration("coldEmail")}
                copied={copied}
                onCopy={handleCopy}
              />
            ) : activeTab === "coverLetter" ? (
              <TextTabBody
                state={activeState}
                emptyTitle="Ready to generate your cover letter"
                emptyDescription="Fill in the panel on the left and click Generate."
                onGenerate={() => runGeneration("coverLetter")}
                copied={copied === "coverLetter"}
                onCopy={() =>
                  handleCopy(
                    "coverLetter",
                    typeof activeState.result === "string"
                      ? activeState.result
                      : "",
                  )
                }
              />
            ) : (
              <>
                <TextTabBody
                  state={activeState}
                  emptyTitle="Ready to generate your message"
                  emptyDescription={
                    inputMode === "jd"
                      ? "Paste a job description on the left and click Generate."
                      : "Fill in the contact details and click Generate."
                  }
                  onGenerate={() => runGeneration(activeTab)}
                  copied={copied === activeTab}
                  onCopy={() =>
                    handleCopy(
                      activeTab,
                      typeof activeState.result === "string"
                        ? activeState.result
                        : "",
                    )
                  }
                  charInfo={{
                    count: charCount,
                    limit: charLimit,
                    percent: charPercent,
                    color: getCharColor(),
                  }}
                />

                {activeState.status === "success" && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Lightbulb className="w-4 h-4 text-amber-600" />
                      <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
                        Tips for {activeLinkedInTab?.label}
                      </span>
                    </div>
                    <ul className="space-y-1.5">
                      {TIPS[activeTab]?.map((tip, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-xs text-amber-700"
                        >
                          <span className="text-amber-500 mt-0.5 shrink-0">
                            •
                          </span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}

            {selectedResume && trackerSuggestions[activeTab] && (
              <AddToTrackerPrompt
                key={`${activeTab}-${trackerSuggestions[activeTab]!.nonce}`}
                source="outreach"
                companyName={trackerSuggestions[activeTab]!.companyName}
                roleTitle={trackerSuggestions[activeTab]!.roleTitle}
                jobDescription={trackerSuggestions[activeTab]!.jobDescription}
                onDismiss={() =>
                  setTrackerSuggestions((prev) => ({ ...prev, [activeTab]: null }))
                }
              />
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes dotBounce {
          0%, 100% { transform: translateY(0); opacity: 0.4; }
          50% { transform: translateY(-5px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

// Shared body for the four tabs whose result is plain text (the three
// LinkedIn message types + cover letter): empty/loading/error/success
// states, copy, and a regenerate icon that only appears once content exists.
function TextTabBody({
  state,
  emptyTitle,
  emptyDescription,
  onGenerate,
  copied,
  onCopy,
  charInfo,
}: {
  state: TabState;
  emptyTitle: string;
  emptyDescription: string;
  onGenerate: () => void;
  copied: boolean;
  onCopy: () => void;
  charInfo?: { count: number; limit: number; percent: number; color: string };
}) {
  const text = typeof state.result === "string" ? state.result : "";
  // A prior successful generation's text survives a failed regenerate (the
  // catch branch spreads prev[tab] rather than clearing it), so "has a
  // result to show" is broader than "the latest attempt succeeded".
  const hasResult = state.status !== "idle" && text.length > 0;

  if (state.status === "idle") {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center">
          <Wand2 className="w-7 h-7 text-purple-500" />
        </div>
        <div>
          <p className="text-base font-semibold text-gray-800 mb-1">
            {emptyTitle}
          </p>
          <p className="text-sm text-gray-400 max-w-xs mx-auto leading-relaxed">
            {emptyDescription}
          </p>
        </div>
        <button
          onClick={onGenerate}
          className="flex items-center gap-2.5 px-6 py-3 rounded-xl text-sm font-semibold bg-linear-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-200 hover:shadow-xl hover:shadow-purple-300 hover:-translate-y-0.5 transition-all cursor-pointer border-none"
        >
          <Sparkles className="w-4 h-4" />
          Generate
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  if (state.status === "error" && !hasResult) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center">
          <AlertCircle className="w-7 h-7 text-red-500" />
        </div>
        <div>
          <p className="text-base font-semibold text-gray-800 mb-1">
            Generation failed
          </p>
          <p className="text-sm text-gray-400 max-w-xs mx-auto leading-relaxed">
            {state.error}
          </p>
        </div>
        <button
          onClick={onGenerate}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all cursor-pointer border-none"
        >
          <RefreshCw className="w-4 h-4" />
          Retry
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-4 min-h-40">
        {state.status === "loading" ? (
          <div className="flex items-center gap-3 py-10 justify-center">
            <div className="flex gap-1.5">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full bg-purple-400"
                  style={{
                    animation: `dotBounce 1s ease-in-out ${i * 0.15}s infinite`,
                  }}
                />
              ))}
            </div>
            <span className="text-sm text-gray-400">
              {hasResult ? "Regenerating..." : "Generating..."}
            </span>
          </div>
        ) : (
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
            {text}
          </p>
        )}
      </div>

      {state.status === "error" && hasResult && (
        <div className="flex items-center gap-2 text-xs text-red-600 mb-3">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          {state.error} — showing the last successful result.
        </div>
      )}

      <div className="flex items-center justify-between">
        {charInfo ? (
          <div className="flex items-center gap-2.5">
            <div className="relative w-9 h-9 shrink-0">
              <svg width="36" height="36" style={{ transform: "rotate(-90deg)" }}>
                <circle cx="18" cy="18" r="13" fill="none" stroke="#f3f4f6" strokeWidth="3" />
                <circle
                  cx="18"
                  cy="18"
                  r="13"
                  fill="none"
                  stroke={charInfo.color}
                  strokeWidth="3"
                  strokeDasharray={`${charInfo.percent * 0.816} 81.6`}
                  strokeLinecap="round"
                  style={{ transition: "stroke-dasharray 0.3s ease" }}
                />
              </svg>
            </div>
            <span className="text-xs text-gray-500">
              <span className="font-semibold" style={{ color: charInfo.color }}>
                {charInfo.count}
              </span>
              <span className="text-gray-400">/{charInfo.limit} chars</span>
            </span>
          </div>
        ) : (
          <div />
        )}

        <div className="flex items-center gap-2">
          <button
            onClick={onGenerate}
            disabled={state.status === "loading"}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-gray-200 bg-white text-gray-500 text-xs font-medium hover:border-gray-300 hover:text-gray-700 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${state.status === "loading" ? "animate-spin" : ""}`}
            />
            Regenerate
          </button>
          <button
            onClick={onCopy}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg border text-xs font-medium transition-all cursor-pointer
              ${
                copied
                  ? "border-green-200 bg-green-50 text-green-700"
                  : "border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:text-gray-700"
              }`}
          >
            {copied ? (
              <CheckCircle className="w-3.5 h-3.5" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>
    </>
  );
}

// Cold Email tab: settings row (email purpose, sequence length, follow-up
// days) scoped to this tab, plus subject-line options and the generated
// email timeline. Kept separate from TextTabBody since its result shape
// (subjects + a list of emails) doesn't fit the plain-text case.
function ColdEmailTabBody({
  state,
  emailType,
  setEmailType,
  sequenceLength,
  setSequenceLength,
  followupSchedule,
  setFollowupSchedule,
  onGenerate,
  copied,
  onCopy,
}: {
  state: TabState;
  emailType: string;
  setEmailType: (v: string) => void;
  sequenceLength: number;
  setSequenceLength: (v: number) => void;
  followupSchedule: Record<number, number>;
  setFollowupSchedule: (v: Record<number, number>) => void;
  onGenerate: () => void;
  copied: string | null;
  onCopy: (key: string, text: string) => void;
}) {
  const result =
    state.result && typeof state.result === "object"
      ? (state.result as ColdEmailResult)
      : null;
  const [selectedSubject, setSelectedSubject] = useState(0);

  return (
    <div className="space-y-5">
      {/* Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">
            Email Purpose
          </label>
          <div className="grid grid-cols-2 gap-2">
            {EMAIL_TYPES.map((type) => (
              <button
                key={type.id}
                onClick={() => setEmailType(type.id)}
                className={`py-2 px-3 rounded-lg text-xs font-medium cursor-pointer transition-all border
                  ${
                    emailType === type.id
                      ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200"
                      : "bg-white text-gray-500 border-gray-200 hover:border-blue-300 hover:text-blue-600"
                  }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">
            Sequence Length
          </label>
          <select
            value={sequenceLength}
            onChange={(e) => setSequenceLength(Number(e.target.value))}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 cursor-pointer"
          >
            {SEQUENCE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <div className="mt-3 space-y-2">
            {FOLLOWUP_DAYS.slice(0, sequenceLength - 1).map((schedule) => (
              <div key={schedule.email} className="flex items-center gap-3">
                <span className="text-xs text-gray-500 w-16">
                  Email {schedule.email}:
                </span>
                <select
                  value={followupSchedule[schedule.email]}
                  onChange={(e) =>
                    setFollowupSchedule({
                      ...followupSchedule,
                      [schedule.email]: Number(e.target.value),
                    })
                  }
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-700 outline-none focus:border-blue-400 cursor-pointer"
                >
                  {schedule.options.map((day) => (
                    <option key={day} value={day}>
                      Day {day}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
      </div>

      {state.status === "idle" ? (
        <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center">
            <Wand2 className="w-7 h-7 text-blue-500" />
          </div>
          <p className="text-base font-semibold text-gray-800">
            Ready to generate your email sequence
          </p>
          <button
            onClick={onGenerate}
            className="flex items-center gap-2.5 px-6 py-3 rounded-xl text-sm font-semibold bg-linear-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-200 hover:shadow-xl hover:-translate-y-0.5 transition-all cursor-pointer border-none"
          >
            <Sparkles className="w-4 h-4" />
            Generate Email Sequence
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : state.status === "error" && !result ? (
        <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center">
            <AlertCircle className="w-7 h-7 text-red-500" />
          </div>
          <p className="text-sm text-gray-500">{state.error}</p>
          <button
            onClick={onGenerate}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all cursor-pointer border-none"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      ) : state.status === "loading" && !result ? (
        <div className="flex items-center gap-3 py-16 justify-center">
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-blue-400"
                style={{
                  animation: `dotBounce 1s ease-in-out ${i * 0.15}s infinite`,
                }}
              />
            ))}
          </div>
          <span className="text-sm text-gray-400">Generating...</span>
        </div>
      ) : (
        result && (
          <div className="space-y-6">
            {state.status === "error" && (
              <div className="flex items-center gap-2 text-xs text-red-600">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {state.error} — showing the last successful result.
              </div>
            )}
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                Subject Line Options
              </h3>
              <button
                onClick={onGenerate}
                disabled={state.status === "loading"}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-500 text-xs font-medium hover:border-gray-300 hover:text-gray-700 transition-all cursor-pointer disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${state.status === "loading" ? "animate-spin" : ""}`}
                />
                Regenerate
              </button>
            </div>

            <div className="space-y-2">
              {result.subjects.map((subject, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedSubject(i)}
                  className={`w-full text-left px-4 py-3 rounded-xl border transition-all cursor-pointer
                    ${
                      selectedSubject === i
                        ? "border-blue-300 bg-blue-50 text-blue-700"
                        : "border-gray-200 bg-gray-50 text-gray-700 hover:border-blue-200 hover:bg-blue-50/50"
                    }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-medium leading-relaxed flex-1">
                      {subject}
                    </p>
                    {selectedSubject === i && (
                      <CheckCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    )}
                  </div>
                </button>
              ))}
            </div>

            <div className="space-y-5">
              {result.emails.map((email, index) => (
                <div key={index} className="relative">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-linear-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-md shadow-blue-200">
                      <span className="text-xs font-bold text-white">
                        {index + 1}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-gray-800">
                        {email.label}
                      </h4>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        {email.day === 0
                          ? "Send immediately"
                          : `Day ${email.day}`}
                      </div>
                    </div>
                  </div>

                  <div className="ml-11 bg-gray-50 border border-gray-200 rounded-xl p-4">
                    <div className="mb-3 pb-3 border-b border-gray-200">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                        Subject:
                      </p>
                      <p className="text-sm text-gray-800 font-medium">
                        {email.subject}
                      </p>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                      {email.body}
                    </p>
                  </div>

                  <div className="ml-11 mt-3">
                    <button
                      onClick={() =>
                        onCopy(
                          `email-${index}`,
                          `${email.subject}\n\n${email.body}`,
                        )
                      }
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer
                        ${
                          copied === `email-${index}`
                            ? "border-green-200 bg-green-50 text-green-700"
                            : "border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:text-gray-700"
                        }`}
                    >
                      {copied === `email-${index}` ? (
                        <>
                          <CheckCircle className="w-3 h-3" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      )}
    </div>
  );
}
