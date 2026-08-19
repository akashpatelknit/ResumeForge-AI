"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Github, Linkedin, ListChecks, Lock, Mail, MapPin, Phone, RefreshCw, Target } from "lucide-react";
import { cn } from "@/lib/utils";

// A purely illustrative mockup of the product's output — unlike the old
// HeroIllustration this replaces, it isn't wired to useResumeUpload at all.
// The real upload entry point is the dropzone below (see
// components/landing/ResumeDropzone.tsx); this exists only to show what a
// parsed resume looks like, so it stays static sample content on purpose.
const EXPERIENCE = [
  {
    role: "Software Engineer",
    company: "Tata Consultancy Services",
    dates: "Mar 2023 – Present",
    bullets: [
      "Built and maintained scalable web applications using React, Node.js & TypeScript.",
      "Collaborated with cross-functional teams to ship features and improve performance.",
    ],
  },
  {
    role: "Junior Software Engineer",
    company: "Infosys",
    dates: "Jul 2021 – Feb 2023",
    bullets: [
      "Developed RESTful APIs and integrated third-party services.",
      "Optimized application performance and fixed critical bugs.",
    ],
  },
];

const SKILLS = [
  "JavaScript",
  "TypeScript",
  "React",
  "Next.js",
  "Node.js",
  "Express.js",
  "MongoDB",
  "PostgreSQL",
  "AWS",
  "Docker",
  "Git",
  "Tailwind CSS",
];

function RingProgress({ percent }: { percent: number }) {
  const size = 40;
  const stroke = 4;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - percent / 100);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#EDE9FE" strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="#7C3AED"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </svg>
  );
}

// Every chip/card gets its own float loop — different duration and phase
// per element is what makes the drift read as organic instead of a single
// group bobbing in lockstep.
function useFloat(duration: number, amplitude: number, reduced: boolean) {
  if (reduced) return {};
  return {
    animate: { y: [0, -amplitude, 0] },
    transition: { duration, repeat: Infinity, ease: "easeInOut" as const },
  };
}

function Chip({
  className,
  duration,
  amplitude,
  reduced,
  children,
}: {
  className?: string;
  duration: number;
  amplitude: number;
  reduced: boolean;
  children: React.ReactNode;
}) {
  const float = useFloat(duration, amplitude, reduced);
  return (
    <motion.div
      {...float}
      className={cn(
        "absolute w-46 rounded-2xl border border-[#F0F0F0] bg-white p-3 shadow-[0_10px_30px_rgba(0,0,0,0.06)]",
        className,
      )}
    >
      {children}
    </motion.div>
  );
}

export default function FloatingResumePreview() {
  const prefersReducedMotion = !!useReducedMotion();
  const cardFloat = useFloat(5.5, 6, prefersReducedMotion);

  return (
    <div className="relative mx-auto w-full max-w-190">
      {/* Browser-chrome mockup — cropped to a fixed height showing only
          name/title/contact/Summary; Experience and Skills still render
          underneath (unchanged content) but are clipped and faded via the
          mask below rather than actually taking up vertical space, so the
          card reads as "more below" without growing the page. */}
      <motion.div
        {...cardFloat}
        className="relative w-full overflow-hidden rounded-2xl border border-[#EDEDED] bg-white shadow-[0_20px_60px_rgba(0,0,0,0.08)]"
      >
        <div className="flex items-center gap-3 border-b border-[#F0F0F0] px-5 py-2.5">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
          </div>
          <div className="flex flex-1 items-center gap-2 rounded-md bg-gray-50 px-3 py-1.5 text-xs text-gray-500">
            <Lock className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">app.resumeforge.ai/resume/preview</span>
          </div>
          <RefreshCw className="h-4 w-4 shrink-0 text-gray-400" />
        </div>

        <div
          className="h-74 overflow-hidden p-5 sm:p-6"
          style={{
            maskImage: "linear-gradient(to bottom, black 60%, transparent 96%)",
            WebkitMaskImage: "linear-gradient(to bottom, black 60%, transparent 96%)",
          }}
        >
          <h3 className="text-xl font-bold text-gray-900 sm:text-2xl">Akash Patel</h3>
          <p className="mt-0.5 text-sm font-semibold text-brand-blue">Backend Developer</p>

          <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-gray-500">
            <a
              href="tel:+919369201975"
              className="inline-flex items-center gap-1.5 transition-colors hover:text-brand-purple"
            >
              <Phone className="h-3.5 w-3.5" />
              +91-9369201975
            </a>
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              Bengaluru, India
            </span>

            {/* Email/LinkedIn/GitHub are icon-only — the full text made this
                row wrap awkwardly, and the URLs themselves aren't
                informative to read at a glance the way phone/location are. */}
            <span className="inline-flex items-center gap-2.5">
              <a
                href="mailto:akashpatel20606@gmail.com"
                aria-label="Email"
                title="akashpatel20606@gmail.com"
                className="transition-colors hover:text-brand-purple"
              >
                <Mail className="h-3.5 w-3.5" />
              </a>
              <a
                href="https://linkedin.com/in/akash-patel-9330aa201"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                title="linkedin.com/in/akash-patel-9330aa201"
                className="transition-colors hover:text-brand-purple"
              >
                <Linkedin className="h-3.5 w-3.5" />
              </a>
              <a
                href="https://github.com/akashpatelknit"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                title="github.com/akashpatelknit"
                className="transition-colors hover:text-brand-purple"
              >
                <Github className="h-3.5 w-3.5" />
              </a>
            </span>
          </div>

          <div className="mt-3.5">
            <p className="text-sm font-bold text-gray-900">Summary</p>
            <p className="mt-1 text-sm leading-snug text-gray-500">
              Backend Developer with 2+ years building and operating production systems handling 100K+ daily
              requests, with a focus on API security, query performance, and asynchronous service communication at
              scale.
            </p>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-[1.6fr_1fr]">
            <div>
              <p className="text-sm font-bold text-gray-900">Experience</p>
              <div className="mt-2 space-y-3.5">
                {EXPERIENCE.map((job) => (
                  <div key={job.role}>
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="text-sm font-semibold text-gray-900">{job.role}</p>
                      <p className="shrink-0 text-xs text-gray-400">{job.dates}</p>
                    </div>
                    <p className="text-xs font-medium text-brand-blue">{job.company}</p>
                    <ul className="mt-0.5 space-y-0.5 text-xs text-gray-500">
                      {job.bullets.map((bullet) => (
                        <li key={bullet}>· {bullet}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-bold text-gray-900">Skills</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {SKILLS.map((skill) => (
                  <span key={skill} className="rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Floating supporting chips — hidden below xl, since the card needs
          a generous gutter on each side for the chips to clear its edges
          without overlapping real content. */}
      <Chip className="top-4 -left-52 hidden xl:block" duration={5} amplitude={7} reduced={prefersReducedMotion}>
        <p className="text-xs font-medium text-gray-500">ATS Score</p>
        <div className="mt-1 flex items-center justify-between">
          <p className="text-3xl font-bold text-gray-900">94</p>
          <RingProgress percent={94} />
        </div>
        <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-emerald-600">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Excellent Match
        </p>
      </Chip>

      <Chip className="bottom-6 -left-52 hidden xl:block" duration={6} amplitude={5} reduced={prefersReducedMotion}>
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-brand-purple to-brand-blue">
            <ListChecks className="h-4.5 w-4.5 text-white" />
          </span>
          <div>
            <p className="text-sm font-semibold text-gray-900">AI Generated</p>
            <p className="text-xs text-gray-500">Tailored for this role</p>
          </div>
        </div>
      </Chip>

      <Chip className="top-26 -right-52 hidden xl:block" duration={7} amplitude={6} reduced={prefersReducedMotion}>
        <div className="flex items-center gap-2.5">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-100">
            <Target className="h-5 w-5 text-brand-purple" />
          </span>
          <div>
            <p className="text-xs font-medium text-gray-500">Matched Role</p>
            <p className="text-xl font-bold text-gray-900">92%</p>
          </div>
        </div>
        <p className="mt-1 text-xs font-medium text-emerald-600">Strong Match</p>
      </Chip>
    </div>
  );
}
