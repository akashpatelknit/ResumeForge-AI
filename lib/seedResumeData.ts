import type { ResumeData } from "@/types/resume";
import { DEFAULT_SECTION_ORDER } from "@/lib/resumeSections";

// Seed content used when a new resume is created from a template.
// Each templateId gets content tailored to the roles it's designed for
// (see `bestFor` in config/templates.ts) instead of one hardcoded sample
// for every template.
//
// Typed directly against ResumeData (not a hand-rolled parallel interface)
// so a field-name drift from what the form sections actually read
// (components/builder/sections/*.tsx) is a compile error, not a silent
// blank-field bug.

// "modern" — software engineer / product-focused, per config/templates.ts bestFor
const modernSeed: ResumeData = {
  personalInfo: {
    fullName: "Alex Johnson",
    email: "alex.johnson@gmail.com",
    phone: "+1 (415) 555-0192",
    location: "San Francisco, CA",
    linkedin: "linkedin.com/in/alexjohnson",
    github: "github.com/alexjohnson",
    portfolio: "alexjohnson.dev",
  },
  summary:
    "Full-stack software engineer with 4+ years of experience building scalable web applications using React, Node.js, and cloud infrastructure. Passionate about clean architecture, developer tooling, and shipping products users love.",
  experience: [
    {
      id: "exp_1",
      company: "Stripe",
      position: "Software Engineer II",
      location: "San Francisco, CA",
      startDate: "2022-06",
      endDate: null,
      description:
        "Led development of internal dashboard used by 200+ support agents, reducing ticket resolution time by 35%.",
      achievements: [
        "Architected a real-time notification system using WebSockets serving 50k+ concurrent users",
        "Reduced API response times by 40% through query optimization and Redis caching",
        "Mentored 2 junior engineers and conducted 30+ technical interviews",
      ],
    },
    {
      id: "exp_2",
      company: "Razorpay",
      position: "Frontend Engineer",
      location: "Bengaluru, India",
      startDate: "2020-07",
      endDate: "2022-05",
      description:
        "Worked on the merchant-facing payments dashboard handling ₹500Cr+ in daily transactions.",
      achievements: [
        "Rebuilt the analytics dashboard from scratch, improving load time by 60%",
        "Integrated the design system across 12 legacy pages",
      ],
    },
  ],
  education: [
    {
      id: "edu_1",
      institution: "Indian Institute of Technology, Bombay",
      degree: "B.Tech",
      field: "Computer Science and Engineering",
      location: "Mumbai, India",
      startDate: "2016-07",
      endDate: "2020-05",
      gpa: "8.7 / 10 CGPA",
      achievements: ["Tech fest organizer, Open Source Club lead"],
    },
  ],
  skills: [
    { id: "skill_1", category: "Languages", items: ["TypeScript", "JavaScript", "Python", "SQL"] },
    { id: "skill_2", category: "Frontend", items: ["React", "Next.js", "Tailwind CSS", "Redux"] },
    { id: "skill_3", category: "Backend", items: ["Node.js", "Express", "Prisma", "GraphQL"] },
    { id: "skill_4", category: "DevOps & Tools", items: ["AWS", "Docker", "GitHub Actions", "Vercel"] },
  ],
  projects: [
    {
      id: "proj_1",
      name: "ResumeAI",
      description:
        "AI-powered resume builder with ATS scoring, multiple templates, and PDF export.",
      link: "resumeai.vercel.app",
      github: "github.com/alexjohnson/resumeai",
      technologies: ["Next.js", "OpenAI", "Prisma", "Tailwind CSS"],
      highlights: [
        "Acquired 1,200+ users within 3 months of launch",
        "Implemented ATS scoring algorithm with 85% accuracy vs industry tools",
      ],
    },
  ],
  achievements: [
    {
      id: "ach_1",
      title: "Winner — HackMIT 2022",
      description: "Built an accessibility linting tool for React apps. Won 1st place out of 180 teams.",
      date: "2022-10",
    },
  ],
  certifications: [
    {
      id: "cert_1",
      name: "AWS Certified Solutions Architect – Associate",
      issuer: "Amazon Web Services",
      date: "2023-03",
    },
  ],
  languages: ["English (Fluent)"],
  customSections: [],
  sectionOrder: DEFAULT_SECTION_ORDER,
  isFavorite: false,
  isArchived: false,
  thumbnail: "",
  atsScore: 78,
};

// "professional" — senior/exec, per config/templates.ts bestFor: C-Level, VP, Directors
const professionalSeed: ResumeData = {
  personalInfo: {
    fullName: "Morgan Reeves",
    email: "morgan.reeves@example.com",
    phone: "+1 (212) 555-0148",
    location: "New York, NY",
    linkedin: "linkedin.com/in/morganreeves",
    github: "",
    portfolio: "morganreeves.com",
  },
  summary:
    "Results-driven engineering leader with 12+ years scaling product and platform organizations from seed to Series D. Track record of building high-performing teams, driving multi-million dollar revenue growth, and translating business strategy into technical roadmaps.",
  experience: [
    {
      id: "exp_1",
      company: "Brex",
      position: "VP of Engineering",
      location: "New York, NY",
      startDate: "2021-01",
      endDate: null,
      description:
        "Own engineering strategy and execution across a 60-person org spanning platform, payments, and risk.",
      achievements: [
        "Grew engineering org from 18 to 60 while reducing attrition by 22%",
        "Launched new lending platform generating $40M ARR within 18 months",
        "Established engineering-wide OKR process adopted company-wide",
      ],
    },
    {
      id: "exp_2",
      company: "Squarespace",
      position: "Director of Engineering",
      location: "New York, NY",
      startDate: "2016-03",
      endDate: "2020-12",
      description:
        "Directed 4 product engineering teams delivering the commerce and billing platform.",
      achievements: [
        "Led migration to microservices, cutting deployment time from 45 to 6 minutes",
        "Built and mentored 3 engineering managers now VPs at other companies",
      ],
    },
  ],
  education: [
    {
      id: "edu_1",
      institution: "Cornell University",
      degree: "M.S.",
      field: "Computer Science",
      location: "Ithaca, NY",
      startDate: "2008-08",
      endDate: "2010-05",
    },
  ],
  skills: [
    { id: "skill_1", category: "Leadership", items: ["Org Design", "Hiring & Retention", "Budgeting", "Board Reporting"] },
    { id: "skill_2", category: "Technical", items: ["Systems Architecture", "Cloud Infrastructure", "Security & Compliance"] },
  ],
  projects: [],
  achievements: [
    {
      id: "ach_1",
      title: "Speaker — LeadDev NYC 2023",
      description: "Presented on scaling engineering orgs through hypergrowth.",
      date: "2023-05",
    },
  ],
  certifications: [],
  languages: ["English (Native)"],
  customSections: [],
  sectionOrder: DEFAULT_SECTION_ORDER,
  isFavorite: false,
  isArchived: false,
  thumbnail: "",
  atsScore: 82,
};

// "classic" — creative/marketing, per config/templates.ts bestFor: Designers, Marketers, Content Creators
const classicSeed: ResumeData = {
  personalInfo: {
    fullName: "Jordan Blake",
    email: "jordan.blake@example.com",
    phone: "+1 (310) 555-0173",
    location: "Los Angeles, CA",
    linkedin: "linkedin.com/in/jordanblake",
    github: "",
    portfolio: "jordanblake.design",
  },
  summary:
    "Creative marketer and content strategist with 5+ years driving brand growth through storytelling, campaign design, and audience-first content. Combines design sensibility with data-driven experimentation to grow engagement and conversion.",
  experience: [
    {
      id: "exp_1",
      company: "Glossier",
      position: "Senior Content Strategist",
      location: "Los Angeles, CA",
      startDate: "2022-02",
      endDate: null,
      description:
        "Own content strategy across social, email, and campaign launches for a DTC beauty brand.",
      achievements: [
        "Grew Instagram engagement rate by 48% over 12 months through a revamped content calendar",
        "Led rebrand campaign that increased email conversion by 21%",
        "Managed a team of 3 freelance designers and copywriters",
      ],
    },
  ],
  education: [
    {
      id: "edu_1",
      institution: "Parsons School of Design",
      degree: "B.F.A.",
      field: "Communication Design",
      location: "New York, NY",
      startDate: "2015-08",
      endDate: "2019-05",
    },
  ],
  skills: [
    { id: "skill_1", category: "Design", items: ["Figma", "Adobe Creative Suite", "Brand Identity", "Typography"] },
    { id: "skill_2", category: "Marketing", items: ["Content Strategy", "Copywriting", "Campaign Planning", "SEO"] },
  ],
  projects: [
    {
      id: "proj_1",
      name: "Portfolio Rebrand",
      description: "Self-directed rebrand and portfolio site redesign showcasing 20+ campaigns.",
      link: "jordanblake.design",
      technologies: ["Figma", "Webflow"],
      highlights: ["Featured on Behance's curated design gallery"],
    },
  ],
  achievements: [],
  certifications: [],
  languages: ["English (Native)"],
  customSections: [],
  sectionOrder: DEFAULT_SECTION_ORDER,
  isFavorite: false,
  isArchived: false,
  thumbnail: "",
  atsScore: 74,
};

const seedsByTemplateId: Record<string, ResumeData> = {
  modern: modernSeed,
  professional: professionalSeed,
  classic: classicSeed,
};

// Falls back to the "modern" seed for unknown/future template ids so
// resume creation never breaks when config/templates.ts gains new entries.
export function getSeedResumeData(templateId: string): ResumeData {
  return seedsByTemplateId[templateId] ?? modernSeed;
}
