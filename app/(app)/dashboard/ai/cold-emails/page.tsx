"use client";
import { useState } from "react";
import {
  Mail,
  Sparkles,
  Copy,
  RefreshCw,
  BookmarkPlus,
  ChevronDown,
  FileText,
  CheckCircle,
  User,
  Building2,
  Briefcase,
  ArrowRight,
  Wand2,
  Clock,
  ExternalLink,
  Search,
  Lightbulb,
  Send,
  Edit3,
} from "lucide-react";

const TONES = ["Professional", "Friendly", "Direct"];

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

const SAMPLE_RESUMES = [
  { id: "1", title: "Full Stack Developer Resume" },
  { id: "2", title: "Senior Frontend Engineer" },
  { id: "3", title: "Product Manager Resume" },
];

const SAMPLE_SUBJECTS = [
  "Quick question about Senior Developer role at Google",
  "Following your work on scalable infrastructure",
  "Marcus Johnson suggested I reach out",
];

const SAMPLE_EMAILS = [
  {
    day: 0,
    label: "Initial Email",
    subject: "Quick question about Senior Developer role at Google",
    body: `Hi Sarah,

          I came across the Senior Developer opening at Google and was particularly impressed by your team's work on distributed systems.

          With 5 years of experience building production-grade applications using React, Node.js, and Kubernetes, I believe I could contribute meaningfully to Google's infrastructure goals.

          I'd love the opportunity to discuss how my background aligns with what you're looking for. Would you be open to a brief 15-minute call this week?

    Best regards,
    Alex Chen
    alex.chen@email.com
    Portfolio: alexchen.dev`,
  },
  {
    day: 3,
    label: "First Follow-up",
    subject: "Re: Quick question about Senior Developer role",
    body: `Hi Sarah,

          I wanted to follow up on my email from earlier this week regarding the Senior Developer position at Google.

          Since reaching out, I've completed a project that directly aligns with your team's focus on distributed systems – a microservices architecture handling 100K+ requests per second.

          I'd still love to connect if you have a moment to discuss the role.

          Thanks for your time!

          Alex Chen`,
  },
  {
    day: 7,
    label: "Second Follow-up",
    subject: "Re: Senior Developer role - Final follow-up",
    body: `Hi Sarah,

          Just wanted to reach out one last time regarding the Senior Developer position.

          I understand you're likely busy, but I remain very interested in the opportunity and would appreciate any feedback you might have.

          If the timing isn't right, I completely understand – perhaps we could connect for future opportunities?

          Best,
          Alex Chen`,
  },
  {
    day: 14,
    label: "Final Touch",
    subject: "Staying connected - Google opportunities",
    body: `Hi Sarah,

I wanted to close the loop on my previous outreach about the Senior Developer role.

Even if this particular position isn't the right fit, I'd love to stay connected for future opportunities at Google. I'm a big admirer of the work your team is doing.

Feel free to connect with me on LinkedIn: linkedin.com/in/alexchen

Thanks again for your time!

Alex`,
  },
];

interface EmailFinderResult {
  formats: string[];
  confidence: string;
}

export default function ColdEmailGenerator() {
  const [inputMode, setInputMode] = useState("jd");
  const [selectedResume, setSelectedResume] = useState(SAMPLE_RESUMES[0]);
  const [tone, setTone] = useState("Professional");
  const [emailType, setEmailType] = useState("job");
  const [sequenceLength, setSequenceLength] = useState(3);
  const [followupSchedule, setFollowupSchedule] = useState({
    2: 3,
    3: 7,
    4: 14,
  });
  const [jobDescription, setJobDescription] = useState("");
  const [manualInputs, setManualInputs] = useState({
    targetName: "",
    targetRole: "",
    company: "",
    hiringManager: "",
  });
  const [generated, setGenerated] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [showResumeDropdown, setShowResumeDropdown] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(0);
  const [emailFinderResult, setEmailFinderResult] =
    useState<EmailFinderResult | null>(null);
  const [displayedEmails, setDisplayedEmails] = useState(
    SAMPLE_EMAILS.slice(0, 3),
  );
  const [subjectOptions, setSubjectOptions] = useState([]);

  const handleCopy = (index: any, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleFindEmail = () => {
    setEmailFinderResult({
      formats: [
        "firstname.lastname@company.com",
        "firstname@company.com",
        "f.lastname@company.com",
      ],
      confidence: "High",
    });
  };

  const handleGenerate = async () => {
    setIsGenerating(true);

    const res = await fetch("/api/ai/cold-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        emailType,
        tone,
        sequenceLength,
        followupSchedule,
        jobDescription,
        resume: selectedResume,
      }),
    });

    const data = await res.json();

    console.log(data.result); // emails + subjects
    setDisplayedEmails(data.result.emails);
    setSubjectOptions(data.result.subjects);

    setGenerated(true);
    setIsGenerating(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      {/* <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-linear-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-200">
            <Mail className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Cold Email Generator
            </h1>
            <p className="text-sm text-gray-500">
              Personalized email sequences that get responses
            </p>
          </div>
        </div>
      </div> */}

      {/* Two Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-5 items-start">
        {/* ═══ LEFT PANEL ═══ */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
          {/* Resume Selector */}
          <div className="p-5 border-b border-gray-100">
            <label className="text-xs font-semibold text-blue-600 uppercase tracking-wider block mb-2">
              Your Resume
            </label>
            <div className="relative">
              <button
                onClick={() => setShowResumeDropdown(!showResumeDropdown)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 flex items-center gap-3 cursor-pointer hover:border-blue-300 transition-colors text-left"
              >
                <FileText className="w-4 h-4 text-blue-600 shrink-0" />
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
                        ${selectedResume.id === r.id ? "bg-blue-50 text-blue-700" : "bg-white text-gray-700 hover:bg-gray-50"}`}
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
                      ${inputMode === mode.id ? "bg-white text-blue-700 shadow-sm" : "bg-transparent text-gray-500 hover:text-gray-700"}`}
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
                  placeholder="Paste the job description here... AI will extract company, role, and hiring manager details."
                  className="w-full h-40 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 resize-none outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all leading-relaxed placeholder:text-gray-400"
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
                  {
                    key: "hiringManager",
                    label: "Hiring Manager Email",
                    icon: Mail,
                    placeholder: "e.g. sarah@google.com (optional)",
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
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-gray-400"
                        />
                      </div>
                    </div>
                  );
                })}

                {/* Email Finder */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <button
                    onClick={handleFindEmail}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg border border-blue-200 bg-blue-50 text-blue-700 text-sm font-medium hover:bg-blue-100 transition-all cursor-pointer"
                  >
                    <Search className="w-4 h-4" />
                    Find Email Format
                  </button>

                  {emailFinderResult && (
                    <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                        <span className="text-xs font-semibold text-amber-700">
                          Suggested Formats:
                        </span>
                      </div>
                      <div className="space-y-1">
                        {Array.isArray(emailFinderResult.formats) &&
                          emailFinderResult.formats.map(
                            (format: any, i: number) => (
                              <div
                                key={i}
                                className="text-xs text-amber-700 font-mono bg-white px-2 py-1 rounded"
                              >
                                {format}
                              </div>
                            ),
                          )}
                      </div>
                      <p className="text-xs text-amber-600 mt-2">
                        Confidence: {emailFinderResult.confidence}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Email Type */}
          <div className="px-5 pb-4 border-t border-gray-100 pt-4">
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

          {/* Sequence Settings */}
          <div className="px-5 pb-4 border-t border-gray-100 pt-4">
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

            {/* Follow-up Schedule */}
            <div className="mt-4 space-y-2">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
                Follow-up Schedule
              </label>
              {FOLLOWUP_DAYS.slice(0, sequenceLength - 1).map((schedule) => (
                <div key={schedule.email} className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 w-16">
                    Email {schedule.email}:
                  </span>
                  <select
                    value={
                      followupSchedule[
                        schedule.email as keyof typeof followupSchedule
                      ]
                    }
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
                        ? "bg-linear-to-r from-blue-600 to-purple-600 text-white border-transparent shadow-md shadow-blue-200"
                        : "bg-white text-gray-500 border-gray-200 hover:border-blue-300 hover:text-blue-600"
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
                    : "bg-linear-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300 hover:-translate-y-0.5 cursor-pointer"
                }`}
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Generating sequence...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Email Sequence
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* ═══ RIGHT PANEL ═══ */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
          <div className="p-6">
            {!generated ? (
              /* Empty State */
              <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                  <Wand2 className="w-7 h-7 text-blue-500" />
                </div>
                <div>
                  <p className="text-base font-semibold text-gray-800 mb-1">
                    Ready to generate your email sequence
                  </p>
                  <p className="text-sm text-gray-400 max-w-sm mx-auto leading-relaxed">
                    {inputMode === "jd"
                      ? "Paste a job description and configure your sequence settings"
                      : "Fill in the contact details and choose your email strategy"}
                  </p>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-500">
                    <Send className="w-3 h-3" />
                    Initial Email
                  </div>
                  <ArrowRight className="w-3 h-3 text-gray-300" />
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    Follow-ups
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Subject Line Section */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Mail className="w-4 h-4 text-blue-600" />
                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Subject Line Options
                    </h3>
                  </div>

                  <div className="space-y-2">
                    {subjectOptions.map((subject, i) => (
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
                          <div className="flex-1">
                            <p className="text-sm font-medium leading-relaxed">
                              {subject}
                            </p>
                          </div>
                          {selectedSubject === i && (
                            <CheckCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() =>
                      handleCopy("subject", subjectOptions[selectedSubject])
                    }
                    className="mt-3 w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg border border-gray-200 bg-white text-gray-600 text-sm font-medium hover:border-gray-300 hover:text-gray-700 transition-all cursor-pointer"
                  >
                    {copiedIndex === "subject" ? (
                      <>
                        <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                        <span className="text-green-600">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        Copy Subject Line
                      </>
                    )}
                  </button>
                </div>

                {/* Timeline Divider */}
                <div className="relative py-4">
                  <div className="absolute left-0 right-0 top-1/2 h-px bg-linear-to-r from-transparent via-gray-200 to-transparent" />
                </div>

                {/* Email Sequence Timeline */}
                <div className="space-y-5">
                  {displayedEmails.map((email, index) => (
                    <div key={index} className="relative">
                      {/* Timeline Connector */}
                      {index < displayedEmails.length - 1 && (
                        <div className="absolute left-4 top-12 bottom-0 w-px bg-linear-to-b from-blue-200 to-transparent" />
                      )}

                      {/* Email Card */}
                      <div className="relative">
                        {/* Day Badge */}
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-8 h-8 rounded-full bg-linear-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-md shadow-blue-200 relative z-10">
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

                        {/* Email Content */}
                        <div className="ml-11 bg-gray-50 border border-gray-200 rounded-xl p-4">
                          {isGenerating && index > 0 ? (
                            <div className="flex items-center gap-2 py-8 justify-center">
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
                              <span className="text-sm text-gray-400">
                                Generating...
                              </span>
                            </div>
                          ) : (
                            <>
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
                            </>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="ml-11 mt-3 flex items-center gap-2">
                          <button
                            onClick={() =>
                              handleCopy(
                                index,
                                `${email.subject}\n\n${email.body}`,
                              )
                            }
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer
                              ${
                                copiedIndex === index
                                  ? "border-green-200 bg-green-50 text-green-700"
                                  : "border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:text-gray-700"
                              }`}
                          >
                            {copiedIndex === index ? (
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
                          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-500 text-xs font-medium hover:border-gray-300 hover:text-gray-700 transition-all cursor-pointer">
                            <Edit3 className="w-3 h-3" />
                            Edit
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Save Sequence Button */}
                <div className="pt-6 border-t border-gray-100">
                  <button className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-linear-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold shadow-lg shadow-blue-200 hover:shadow-xl hover:-translate-y-0.5 transition-all cursor-pointer border-none">
                    <BookmarkPlus className="w-4 h-4" />
                    Save Entire Sequence
                  </button>
                </div>
              </div>
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
