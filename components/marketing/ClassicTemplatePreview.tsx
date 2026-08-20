// Real-content thumbnail for the "Classic" template (components/pdf/
// template/ClassicTemplate.tsx) — same "mirror the real structure in plain
// HTML/Tailwind at fixed tiny sizes" approach as ResumeTemplatePreview.tsx
// (which does this for ModernTemplate), just reflecting Classic's actual
// layout: centered header, single contact line, no-bullet "Category: items"
// skills. Content matches lib/seedResumeData.ts's classicSeed so the
// thumbnail is what a resume actually created from this template looks like.
const CONTACT = [
  "+1 (310) 555-0173",
  "jordan.blake@example.com",
  "jordanblake.design",
  "linkedin.com/in/jordanblake",
  "Los Angeles, CA",
];

const SKILLS = [
  { category: "Design", items: "Figma, Adobe Creative Suite, Brand Identity, Typography" },
  { category: "Marketing", items: "Content Strategy, Copywriting, Campaign Planning, SEO" },
];

const EXPERIENCE = [
  {
    company: "Glossier",
    dates: "Feb 2022 – Present",
    position: "Senior Content Strategist",
    location: "Los Angeles, CA",
    bullets: [
      "Grew Instagram engagement rate by 48% over 12 months through a revamped content calendar",
      "Led rebrand campaign that increased email conversion by 21%",
    ],
  },
];

const PROJECTS = [
  {
    name: "Portfolio Rebrand",
    description: "Self-directed rebrand and portfolio site redesign showcasing 20+ campaigns.",
    stack: "Figma, Webflow",
  },
];

function SectionTitle({ children }: { children: string }) {
  return (
    <p className="border-b border-gray-800 pb-[1px] text-[6px] font-bold tracking-wide text-gray-900 uppercase">
      {children}
    </p>
  );
}

export default function ClassicTemplatePreview({ className = "" }: { className?: string }) {
  return (
    <div className={`h-full w-full overflow-hidden bg-white p-4 text-gray-700 ${className}`}>
      {/* Header — centered name + single pipe-separated contact line */}
      <p className="text-center text-[11px] font-bold text-gray-900">Jordan Blake</p>
      <p className="mt-0.5 text-center text-[5px] leading-normal text-gray-500">
        {CONTACT.join("  |  ")}
      </p>

      {/* Summary */}
      <div className="mt-2">
        <SectionTitle>Summary</SectionTitle>
        <p className="mt-1 text-[5px] leading-normal text-justify text-gray-600">
          Creative marketer and content strategist with 5+ years driving brand growth through
          storytelling, campaign design, and audience-first content.
        </p>
      </div>

      {/* Skills — no-bullet "Category: items" lines */}
      <div className="mt-2">
        <SectionTitle>Skills</SectionTitle>
        <div className="mt-1 space-y-0.5">
          {SKILLS.map((skill) => (
            <p key={skill.category} className="text-[5px] leading-normal text-gray-600">
              <span className="font-bold text-gray-900">{skill.category}: </span>
              {skill.items}
            </p>
          ))}
        </div>
      </div>

      {/* Experience */}
      <div className="mt-2">
        <SectionTitle>Experience</SectionTitle>
        <div className="mt-1 space-y-1.5">
          {EXPERIENCE.map((job) => (
            <div key={job.company}>
              <div className="flex items-baseline justify-between">
                <p className="text-[6px] font-bold text-gray-900">{job.company}</p>
                <p className="text-[5px] text-gray-500">{job.dates}</p>
              </div>
              <div className="flex items-baseline justify-between">
                <p className="text-[5px] italic text-gray-600">{job.position}</p>
                <p className="text-[5px] italic text-gray-500">{job.location}</p>
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

      {/* Projects — bold name, no separate metadata row */}
      <div className="mt-2">
        <SectionTitle>Projects</SectionTitle>
        <div className="mt-1 space-y-1.5">
          {PROJECTS.map((project) => (
            <div key={project.name}>
              <p className="text-[6px] font-bold text-gray-900">{project.name}</p>
              <p className="text-[5px] leading-normal text-justify text-gray-600">{project.description}</p>
              <p className="mt-0.5 text-[5px] text-gray-600">
                <span className="font-bold text-gray-900">Tech: </span>
                {project.stack}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Education */}
      <div className="mt-2">
        <SectionTitle>Education</SectionTitle>
        <div className="mt-1 flex items-baseline justify-between">
          <p className="text-[6px] font-bold text-gray-900">Parsons School of Design</p>
          <p className="text-[5px] text-gray-500">Aug 2015 – May 2019</p>
        </div>
        <div className="flex items-baseline justify-between">
          <p className="text-[5px] italic text-gray-600">B.F.A. in Communication Design</p>
          <p className="text-[5px] italic text-gray-500">New York, NY</p>
        </div>
      </div>
    </div>
  );
}
