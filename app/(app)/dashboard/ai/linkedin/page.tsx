"use client";
import { useEffect, useState } from "react";
import {
  Linkedin,
  Mail,
  Users,
  MessageSquare,
  Sparkles,
  Copy,
  RefreshCw,
  BookmarkPlus,
  ChevronDown,
  FileText,
  CheckCircle,
  Lightbulb,
  User,
  Building2,
  Briefcase,
  ArrowRight,
  Wand2,
} from "lucide-react";

const TONES = ["Professional", "Friendly", "Direct"];

const OUTPUT_TABS = [
  { id: "connect", label: "Connect Request", icon: Linkedin, charLimit: 300 },
  { id: "inmail", label: "InMail", icon: Mail, charLimit: 2000 },
  { id: "referral", label: "Referral", icon: Users, charLimit: 1000 },
  { id: "followup", label: "Follow-up", icon: MessageSquare, charLimit: 500 },
];

const SAMPLE_RESUMES = [
  { id: "1", title: "Full Stack Developer Resume" },
  { id: "2", title: "Senior Frontend Engineer" },
  { id: "3", title: "Product Manager Resume" },
];

const TIPS = {
  connect: [
    "Keep it under 300 characters",
    "Mention a specific detail about their work",
    "End with a clear reason for connecting",
  ],
  inmail: [
    "Personalize the subject line",
    "Reference their specific achievements",
    "End with a clear call to action",
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

const SAMPLE_OUTPUTS = {
  connect:
    "Hi Sarah! I came across the Senior Dev role at Google and was impressed by your team's work. As a Full Stack Developer with 5 years of experience, I'd love to connect and learn more about the opportunity.",
  inmail:
    "Subject: Senior Developer Role – Full Stack Engineer\n\nHi Sarah,\n\nI recently came across the Senior Developer position at Google and felt compelled to reach out. Your team's work on scalable infrastructure particularly caught my attention.\n\nWith 5 years of experience building production-grade applications using React, Node.js, and cloud platforms, I believe I could contribute meaningfully to Google's mission.\n\nI'd love the opportunity to discuss how my background aligns with what you're looking for. Would you be open to a brief 15-minute call this week?\n\nBest regards,\nAlex Chen",
  referral:
    "Hi Marcus,\n\nI hope you're doing well! I noticed Google is hiring for a Senior Developer role on your team and thought I'd reach out given our time working together at StartupCo.\n\nI've been following Google's engineering blog and I'm genuinely excited about the direction your team is heading. Would you be comfortable referring me for this position?\n\nThanks so much – truly appreciate it!",
  followup:
    "Hi Sarah, following up on my message from last week regarding the Senior Developer role at Google. I've since completed a project directly aligned with your team's focus on distributed systems. Would love to share more if you have a moment!",
};

export default function LinkedInMessageGenerator() {
  const [inputMode, setInputMode] = useState("jd");
  const [activeOutputTab, setActiveOutputTab] = useState("connect");
  const [selectedResume, setSelectedResume] = useState(SAMPLE_RESUMES[0]);
  const [tone, setTone] = useState("Professional");
  const [jobDescription, setJobDescription] = useState("");
  const [manualInputs, setManualInputs] = useState({
    targetName: "",
    targetRole: "",
    company: "",
  });

  const [generated, setGenerated] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showResumeDropdown, setShowResumeDropdown] = useState(false);
  const [currentOutput, setCurrentOutput] = useState({
    connect: "",
    inmail: "",
    referral: "",
    followup: "",
  });

  const activeTab = OUTPUT_TABS.find((t) => t.id === activeOutputTab);

  const charCount =
    currentOutput[activeOutputTab as keyof typeof currentOutput]?.length || 0;
  const charLimit = activeTab?.charLimit || 300;
  const charPercent = Math.min((charCount / charLimit) * 100, 100);

  const getCharColor = () => {
    if (charPercent < 70) return "#16a34a";
    if (charPercent < 90) return "#d97706";
    return "#dc2626";
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    await fetchOutput(activeOutputTab);
    setGenerated(true);
    setIsGenerating(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(
      currentOutput[activeOutputTab as keyof typeof currentOutput] || "",
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegenerate = async () => {
    setIsGenerating(true);
    await fetchOutput(activeOutputTab);
    setIsGenerating(false);
  };

  const fetchOutput = async (activeOutputTab: string) => {
    setIsGenerating(true);

    const response = await fetch("/api/ai/linkedin", {
      method: "POST",
      body: JSON.stringify({
        tool: activeOutputTab,
        resume: {
          name: "Akash Patel",
          role: "Full Stack Developer",
          experience_years: 2,
          location: "Bengaluru, India",

          skills: [
            "React.js",
            "Next.js",
            "TypeScript",
            "JavaScript (ES6+)",
            "Node.js",
            "Express.js",
            "Spring Boot",
            "MongoDB",
            "PostgreSQL",
            "Redis",
            "Tailwind CSS",
            "Redux",
            "GraphQL",
            "Docker",
            "AWS",
            "REST APIs",
            "JWT Authentication",
            "Microservices",
          ],

          summary:
            "Full Stack Developer with 2+ years of experience building end-to-end web applications using React, Node.js, and modern JavaScript technologies. Skilled in developing responsive UIs, scalable backend APIs, database architecture, and deploying production-ready applications.",

          experience: [
            {
              company: "Tata Consultancy Services (TCS)",
              role: "Full Stack Developer",
              duration: "Mar 2025 - Present",
              achievements: [
                "Delivered 15+ full-stack features improving user engagement by 35%",
                "Built reusable React components reducing code duplication by 40%",
                "Developed scalable APIs handling 100K+ daily requests",
                "Optimized PostgreSQL queries reducing execution time by 60%",
                "Deployed AWS services using Docker and CI/CD reducing deployment time by 70%",
              ],
            },
            {
              company: "Flabs - Pathology Lab Software",
              role: "Full Stack Developer",
              duration: "Jan 2024 - Feb 2025",
              achievements: [
                "Built healthcare SaaS features serving 200+ labs",
                "Developed REST APIs handling 50K+ daily requests",
                "Implemented WebSocket updates reducing latency by 80%",
                "Designed optimized MongoDB schemas improving query performance by 45%",
                "Implemented JWT authentication with RBAC",
              ],
            },
          ],

          projects: [
            {
              name: "Homekrew - Full Stack Home Services Marketplace",
              description:
                "Developed a complete service marketplace including customer app, vendor dashboard, and admin panel with secure authentication and payment integration.",
              skills: [
                "React.js",
                "Next.js",
                "Redux",
                "TypeScript",
                "Tailwind CSS",
                "Node.js",
                "Express.js",
                "MongoDB",
                "Redis",
                "Socket.io",
                "JWT",
                "AWS",
                "Docker",
                "Razorpay",
                "Stripe",
              ],
            },
            {
              name: "E-Commerce Platform with Admin CMS",
              description:
                "Built a full-featured e-commerce system with product catalog, cart, checkout, order management, and admin CMS.",
              skills: [
                "React.js",
                "Node.js",
                "Express.js",
                "MongoDB",
                "JWT",
                "Stripe API",
                "Tailwind CSS",
                "Redux",
                "Axios",
                "Nodemailer",
              ],
            },
          ],

          education: "B.Tech Computer Science",
        },
        jobDescription,
        tone,
      }),
    });

    const data = await response.json();
    setGenerated(true);
    setIsGenerating(false);
    setCurrentOutput((prev) => ({
      ...prev,
      [activeOutputTab]: data.result,
    }));
  };

  useEffect(() => {
    if (currentOutput[activeOutputTab as keyof typeof currentOutput] === "") {
      fetchOutput(activeOutputTab);
    }
  }, [activeOutputTab]);

  return (
    <div className=" bg-gray-50 p-0">
      {/* Header */}
      {/* <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-200">
            <Linkedin className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              LinkedIn Message Generator
            </h1>
            <p className="text-sm text-gray-500">
              AI-powered outreach that gets responses
            </p>
          </div>
        </div>
      </div> */}

      {/* Two Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-5 items-start">
        {/* ── LEFT PANEL ── */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-visible">
          {/* Resume Selector */}
          <div className="p-5 border-b border-gray-100">
            <label className="text-xs font-semibold text-purple-600 uppercase tracking-wider block mb-2">
              Your Resume
            </label>
            <div className="relative">
              <button
                onClick={() => setShowResumeDropdown(!showResumeDropdown)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 flex items-center gap-3 cursor-pointer hover:border-purple-300 transition-colors text-left"
              >
                <FileText className="w-4 h-4 text-purple-600 shrink-0" />
                <span className="flex-1 text-sm text-gray-700 font-medium">
                  {selectedResume.title}
                </span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>

              {showResumeDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-20">
                  {SAMPLE_RESUMES.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => {
                        setSelectedResume(r);
                        setShowResumeDropdown(false);
                      }}
                      className={`w-full px-4 py-2.5 flex items-center gap-3 text-left text-sm cursor-pointer border-none transition-colors
                        ${
                          selectedResume.id === r.id
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
          </div>

          {/* Input Mode Toggle */}
          <div className="px-5 pt-4">
            <div className="grid grid-cols-2 bg-gray-100 rounded-xl p-1">
              {[
                { id: "jd", label: "Job Description", icon: FileText },
                { id: "manual", label: "Manual Input", icon: User },
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
                  className="w-full h-44 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 resize-none outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all leading-relaxed placeholder:text-gray-400"
                />
                {jobDescription && (
                  <div className="mt-3 px-3 py-2.5 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
                    <span className="text-xs text-green-700">
                      AI detected: <strong>Google</strong> · Senior Developer ·
                      Full-time
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {[
                  {
                    key: "targetName",
                    label: "Their Name",
                    icon: User,
                    placeholder: "e.g. Sarah Johnson",
                  },
                  {
                    key: "targetRole",
                    label: "Their Role",
                    icon: Briefcase,
                    placeholder: "e.g. Engineering Manager",
                  },
                  {
                    key: "company",
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
                          value={
                            manualInputs[field.key as keyof typeof manualInputs]
                          }
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
          <div className="px-5 pb-4 border-t border-gray-100 pt-4">
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

          {/* Generate Button */}
          <div className="px-5 pb-5">
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className={`w-full py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2.5 transition-all border-none
                ${
                  isGenerating
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-linear-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-200 hover:shadow-xl hover:shadow-purple-300 hover:-translate-y-0.5 cursor-pointer"
                }`}
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Generating all messages...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Message
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Output Tabs */}
          <div className="flex border-b border-gray-100 bg-gray-50/50 px-2 overflow-x-auto">
            {OUTPUT_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeOutputTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveOutputTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-4 text-sm font-semibold cursor-pointer border-none bg-transparent transition-all whitespace-nowrap
                    ${
                      isActive
                        ? "text-purple-700 border-b-2 border-purple-600 -mb-px"
                        : "text-gray-500 hover:text-gray-700 border-b-2 border-transparent"
                    }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                  {isActive && generated && (
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block ml-0.5" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Output Body */}
          <div className="p-6">
            {!generated ? (
              /* Empty State */
              <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center">
                  <Wand2 className="w-7 h-7 text-purple-500" />
                </div>
                <div>
                  <p className="text-base font-semibold text-gray-800 mb-1">
                    Ready to generate your messages
                  </p>
                  <p className="text-sm text-gray-400 max-w-xs mx-auto leading-relaxed">
                    {inputMode === "jd"
                      ? "Paste a job description on the left and click Generate All"
                      : "Fill in the contact details and click Generate All"}
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2 mt-1">
                  {OUTPUT_TABS.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <div
                        key={tab.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-400"
                      >
                        <Icon className="w-3 h-3" />
                        {tab.label}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <>
                {/* Generated Message */}
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-4 min-h-40">
                  {isGenerating ? (
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
                        Regenerating...
                      </span>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                      {
                        currentOutput[
                          activeOutputTab as keyof typeof currentOutput
                        ]
                      }
                    </p>
                  )}
                </div>

                {/* Char Counter + Actions Row */}
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2.5">
                    <div className="relative w-9 h-9 shrink-0">
                      <svg
                        width="36"
                        height="36"
                        style={{ transform: "rotate(-90deg)" }}
                      >
                        <circle
                          cx="18"
                          cy="18"
                          r="13"
                          fill="none"
                          stroke="#f3f4f6"
                          strokeWidth="3"
                        />
                        <circle
                          cx="18"
                          cy="18"
                          r="13"
                          fill="none"
                          stroke={getCharColor()}
                          strokeWidth="3"
                          strokeDasharray={`${charPercent * 0.816} 81.6`}
                          strokeLinecap="round"
                          style={{ transition: "stroke-dasharray 0.3s ease" }}
                        />
                      </svg>
                    </div>
                    <span className="text-xs text-gray-500">
                      <span
                        className="font-semibold"
                        style={{ color: getCharColor() }}
                      >
                        {charCount}
                      </span>
                      <span className="text-gray-400">/{charLimit} chars</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleRegenerate}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-gray-200 bg-white text-gray-500 text-xs font-medium hover:border-gray-300 hover:text-gray-700 transition-all cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Regenerate
                    </button>
                    <button
                      onClick={handleCopy}
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
                    <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-linear-to-r from-purple-600 to-blue-600 text-white text-xs font-semibold shadow-md shadow-purple-200 hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer border-none">
                      <BookmarkPlus className="w-3.5 h-3.5" />
                      Save
                    </button>
                  </div>
                </div>

                {/* Tips Card */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Lightbulb className="w-4 h-4 text-amber-600" />
                    <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
                      Tips for {activeTab?.label}
                    </span>
                  </div>
                  <ul className="space-y-1.5">
                    {TIPS[activeOutputTab as keyof typeof TIPS]?.map(
                      (tip, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-xs text-amber-700"
                        >
                          <span className="text-amber-500 mt-0.5 shrink-0">
                            •
                          </span>
                          {tip}
                        </li>
                      ),
                    )}
                  </ul>
                </div>
              </>
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
