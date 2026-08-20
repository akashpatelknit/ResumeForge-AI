// A real-content thumbnail for the "Classic ATS" template (components/pdf/
// template/ModernTemplate.tsx). That component tree is built from
// @react-pdf/renderer primitives (Document/Page/View/Text) — those only
// render to a PDF, not to the browser DOM, so it can't be mounted directly
// in a card and scaled with CSS. Instead this mirrors its real structure
// (name/contact header, underlined section titles, bullet-point entries)
// and copy 1:1 in plain HTML/Tailwind, at fixed tiny type sizes sized for
// the grid card — the same "small vs. full" sizing approach already used by
// components/dashboard/TemplateThumbnail.tsx, just with real resume content
// instead of abstract gray bars.
const CONTACT = "akash.patel.dev@gmail.com  ·  +91 98765 43210  ·  Bengaluru, India";
const LINKS = "linkedin.com/in/akashpatel  ·  github.com/akashpatel";

const EXPERIENCE = [
  {
    company: "TCS Digital",
    location: "Bengaluru, India",
    position: "Software Engineer",
    dates: "Mar 2022 – Present",
    bullets: [
      "Developed and maintained scalable web applications using React, Node.js, and AWS.",
      "Improved application performance by 35% through code optimization and caching.",
      "Collaborated with cross-functional teams to deliver high-quality features on time.",
    ],
  },
  {
    company: "Zylo Technologies",
    location: "Remote",
    position: "Software Developer Intern",
    dates: "Jan 2021 – Jun 2021",
    bullets: ["Built RESTful APIs and integrated third-party services.", "Assisted in UI development and bug fixes."],
  },
];

const PROJECTS = [
  {
    name: "Rezlo",
    description: "An AI-powered resume builder with ATS scoring, tailored generation, and one-click PDF export.",
    highlights: ["Reduced resume review time by 60% with real-time ATS feedback."],
    stack: "Next.js, TypeScript, Prisma, OpenAI API",
  },
  {
    name: "DevTrack",
    description: "A lightweight issue tracker for small engineering teams with Kanban and sprint views.",
    highlights: ["Adopted by 3 internal teams within the first month of launch."],
    stack: "React, Node.js, PostgreSQL",
  },
];

const SKILLS = ["JavaScript", "TypeScript", "React", "Next.js", "Node.js", "Python", "AWS", "PostgreSQL"];

function SectionTitle({ children }: { children: string }) {
  return <p className="border-b border-gray-800 pb-[1px] text-[6px] font-bold tracking-wide text-gray-900 uppercase">{children}</p>;
}

export default function ResumeTemplatePreview({ className = "" }: { className?: string }) {
  return (
    <div className={`h-full w-full overflow-hidden bg-white p-4 text-gray-700 ${className}`}>
      {/* Header — mirrors ModernTemplate's name/email row + link/mobile row */}
      <div className="flex items-baseline justify-between">
        <p className="text-[11px] font-bold text-gray-900">Akash Patel</p>
        <p className="text-[5px] text-gray-500">Email: akash.patel.dev@gmail.com</p>
      </div>
      <p className="mt-0.5 text-[5px] text-gray-500">{CONTACT}</p>
      <p className="text-[5px] text-gray-500">{LINKS}</p>

      {/* Professional Summary */}
      <div className="mt-2">
        <SectionTitle>Professional Summary</SectionTitle>
        <p className="mt-1 text-[5px] leading-normal text-justify text-gray-600">
          Software Engineer with 3+ years of experience building scalable web applications using React, Node.js, and
          cloud technologies. Passionate about clean code, system design, and delivering impactful products.
        </p>
      </div>

      {/* Experience */}
      <div className="mt-2">
        <SectionTitle>Experience</SectionTitle>
        <div className="mt-1 space-y-1.5">
          {EXPERIENCE.map((job) => (
            <div key={job.company}>
              <div className="flex items-baseline justify-between">
                <p className="text-[6px] font-bold text-gray-900">{job.company}</p>
                <p className="text-[5px] text-gray-500">{job.location}</p>
              </div>
              <div className="flex items-baseline justify-between">
                <p className="text-[5px] italic text-gray-600">{job.position}</p>
                <p className="text-[5px] italic text-gray-500">{job.dates}</p>
              </div>
              <ul className="mt-0.5 space-y-0.5">
                {job.bullets.map((bullet) => (
                  <li key={bullet} className="flex gap-1 text-[5px] leading-normal text-gray-600">
                    <span className="shrink-0">•</span>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Projects */}
      <div className="mt-2">
        <SectionTitle>Projects</SectionTitle>
        <div className="mt-1 space-y-1.5">
          {PROJECTS.map((project) => (
            <div key={project.name}>
              <p className="text-[6px] font-bold text-gray-900">{project.name}</p>
              <p className="text-[5px] leading-normal text-justify text-gray-600">{project.description}</p>
              <ul className="mt-0.5 space-y-0.5">
                {project.highlights.map((highlight) => (
                  <li key={highlight} className="flex gap-1 text-[5px] leading-normal text-gray-600">
                    <span className="shrink-0">•</span>
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-0.5 text-[5px] text-gray-600">
                <span className="font-bold text-gray-900">Tech Stack: </span>
                {project.stack}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Skills */}
      <div className="mt-2">
        <SectionTitle>Skills Summary</SectionTitle>
        <p className="mt-1 text-[5px] leading-normal text-gray-600">
          <span className="font-bold text-gray-900">Languages &amp; Frameworks: </span>
          {SKILLS.join(", ")}
        </p>
      </div>

      {/* Education */}
      <div className="mt-2">
        <SectionTitle>Education</SectionTitle>
        <div className="mt-1 flex items-baseline justify-between">
          <p className="text-[6px] font-bold text-gray-900">GLA University</p>
          <p className="text-[5px] text-gray-500">2020 – 2024</p>
        </div>
        <p className="text-[5px] italic text-gray-600">B.Tech in Computer Science</p>
      </div>
    </div>
  );
}
