import { create } from "zustand";
import {
  AppResume,
  Education,
  Experience,
  Project,
  Resume,
  Skill,
} from "@/types/resume";

import { mapResumeFromDB } from "@/mapper/mapResumeFromDB";

interface ResumeStore {
  currentResume: AppResume | null;
  isLoading: boolean;
  isSaving: boolean;
  lastSaved: Date | null;

  // Load resume from database
  loadResume: (id: string, userId: string) => Promise<void>;

  // Save current resume to database
  saveResume: () => Promise<void>;

  // Create new resume
  createNewResume: (userId: string, templateId: string) => Promise<AppResume>;

  // Delete resume
  deleteResume: (id: string, userId: string) => Promise<void>;

  // Existing methods
  setCurrentResume: (resume: AppResume | null) => void;
  updatePersonalInfo: (info: Partial<Resume["personalInfo"]>) => void;
  updateSummary: (summary: string) => void;
  updateTitle: (title: string) => void;
  addExperience: (experience: Resume["experience"][0]) => void;
  updateExperience: (
    id: string,
    updates: Partial<Resume["experience"][0]>,
  ) => void;
  deleteExperience: (id: string) => void;
  addEducation: (education: Resume["education"][0]) => void;
  updateEducation: (
    id: string,
    updates: Partial<Resume["education"][0]>,
  ) => void;
  deleteEducation: (id: string) => void;
  addSkill: (skill: Resume["skills"][0]) => void;
  updateSkill: (id: string, updates: Partial<Resume["skills"][0]>) => void;
  deleteSkill: (id: string) => void;
  addProject: (project: Resume["projects"][0]) => void;
  updateProject: (id: string, updates: Partial<Resume["projects"][0]>) => void;
  deleteProject: (id: string) => void;
}

export const useResumeStore = create<ResumeStore>((set, get) => ({
  currentResume: null,
  isLoading: false,
  isSaving: false,
  lastSaved: null,

  loadResume: async (id: string) => {
    set({ isLoading: true });

    try {
      const res = await fetch(`/api/resumes/${id}`);

      if (!res.ok) {
        set({ currentResume: null, isLoading: false });
        return;
      }

      const resume = await res.json();

      set({
        currentResume: mapResumeFromDB(resume),
        isLoading: false,
        lastSaved: new Date(resume.updatedAt),
      });
    } catch (error) {
      console.error("Error loading resume:", error);
      set({ isLoading: false });
      throw error;
    }
  },

  saveResume: async () => {
    const { currentResume } = get();

    if (!currentResume) return;

    set({ isSaving: true });

    try {
      const res = await fetch(`/api/resumes/${currentResume.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: currentResume.title,
          templateId: currentResume.templateId,
          data: {
            personalInfo: currentResume.personalInfo,
            summary: currentResume.summary,
            experience: currentResume.experience,
            education: currentResume.education,
            skills: currentResume.skills,
            projects: currentResume.projects,
            achievements: currentResume.achievements,
            certifications: currentResume.certifications,
            languages: currentResume.languages,
            isFavorite: currentResume.isFavorite,
            thumbnail: currentResume.thumbnail,
            atsScore: currentResume.atsScore,
          },
        }),
      });

      const updated = await res.json();

      set({
        currentResume: mapResumeFromDB(updated),
        isSaving: false,
        lastSaved: new Date(),
      });
    } catch (error) {
      console.error("Error saving resume:", error);
      set({ isSaving: false });
      throw error;
    }
  },

  createNewResume: async (templateId: string, userId: string) => {
    set({ isLoading: true });

    try {
      const res = await fetch("/api/resumes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Untitled Resume",
          templateId,
          userId,
          data: {
            personalInfo: {
              fullName: "Alex Johnson",
              email: "alex.johnson@gmail.com",
              phone: "+1 (415) 555-0192",
              location: "San Francisco, CA",
              linkedIn: "linkedin.com/in/alexjohnson",
              github: "github.com/alexjohnson",
              website: "alexjohnson.dev",
            },
            summary:
              "Full-stack software engineer with 4+ years of experience building scalable web applications using React, Node.js, and cloud infrastructure. Passionate about clean architecture, developer tooling, and shipping products users love.",

            experience: [
              {
                id: "exp_1",
                company: "Stripe",
                role: "Software Engineer II",
                location: "San Francisco, CA",
                startDate: "2022-06",
                endDate: null, // currently working
                current: true,
                description:
                  "Led development of internal dashboard used by 200+ support agents, reducing ticket resolution time by 35%. Built reusable component library adopted across 4 product teams.",
                achievements: [
                  "Architected a real-time notification system using WebSockets serving 50k+ concurrent users",
                  "Reduced API response times by 40% through query optimization and Redis caching",
                  "Mentored 2 junior engineers and conducted 30+ technical interviews",
                ],
                technologies: [
                  "React",
                  "TypeScript",
                  "Node.js",
                  "PostgreSQL",
                  "Redis",
                ],
              },
              {
                id: "exp_2",
                company: "Razorpay",
                role: "Frontend Engineer",
                location: "Bengaluru, India",
                startDate: "2020-07",
                endDate: "2022-05",
                current: false,
                description:
                  "Worked on the merchant-facing payments dashboard handling ₹500Cr+ in daily transactions.",
                achievements: [
                  "Rebuilt the analytics dashboard from scratch using React and D3.js, improving load time by 60%",
                  "Integrated Razorpay's design system across 12 legacy pages",
                  "Collaborated with backend teams to design RESTful APIs for new reporting features",
                ],
                technologies: [
                  "React",
                  "JavaScript",
                  "D3.js",
                  "SCSS",
                  "REST APIs",
                ],
              },
            ],

            education: [
              {
                id: "edu_1",
                institution: "Indian Institute of Technology, Bombay",
                degree: "B.Tech",
                field: "Computer Science and Engineering",
                startDate: "2016-07",
                endDate: "2020-05",
                grade: "8.7 / 10 CGPA",
                activities: "Tech fest organizer, Open Source Club lead",
              },
            ],

            skills: [
              {
                id: "skill_1",
                category: "Languages",
                items: ["TypeScript", "JavaScript", "Python", "SQL"],
              },
              {
                id: "skill_2",
                category: "Frontend",
                items: ["React", "Next.js", "Tailwind CSS", "Redux"],
              },
              {
                id: "skill_3",
                category: "Backend",
                items: ["Node.js", "Express", "Prisma", "GraphQL"],
              },
              {
                id: "skill_4",
                category: "DevOps & Tools",
                items: ["AWS", "Docker", "GitHub Actions", "Vercel"],
              },
            ],

            projects: [
              {
                id: "proj_1",
                name: "ResumeAI",
                description:
                  "AI-powered resume builder with ATS scoring, multiple templates, and PDF export. Built with Next.js, Prisma, and OpenAI API.",
                url: "resumeai.vercel.app",
                github: "github.com/alexjohnson/resumeai",
                startDate: "2023-09",
                endDate: "2023-12",
                technologies: ["Next.js", "OpenAI", "Prisma", "Tailwind CSS"],
                achievements: [
                  "Acquired 1,200+ users within 3 months of launch",
                  "Implemented ATS scoring algorithm with 85% accuracy vs industry tools",
                ],
              },
              {
                id: "proj_2",
                name: "DevPulse",
                description:
                  "GitHub activity tracker that visualizes contribution patterns and generates weekly digest emails.",
                url: "devpulse.app",
                github: "github.com/alexjohnson/devpulse",
                startDate: "2023-02",
                endDate: "2023-05",
                technologies: ["React", "Node.js", "GitHub API", "SendGrid"],
                achievements: [
                  "500+ active users, 4.8/5 rating on Product Hunt",
                ],
              },
            ],

            achievements: [
              {
                id: "ach_1",
                title: "Winner — HackMIT 2022",
                description:
                  "Built an accessibility linting tool for React apps. Won 1st place out of 180 teams.",
                date: "2022-10",
              },
              {
                id: "ach_2",
                title: "Google Summer of Code 2021",
                description:
                  "Contributed to Mozilla's DevTools project, merged 14 PRs improving debugger performance.",
                date: "2021-08",
              },
            ],

            certifications: [
              {
                id: "cert_1",
                name: "AWS Certified Solutions Architect – Associate",
                issuer: "Amazon Web Services",
                issueDate: "2023-03",
                expiryDate: "2026-03",
                credentialUrl: "credly.com/badges/aws-saa",
              },
              {
                id: "cert_2",
                name: "Meta Front-End Developer Certificate",
                issuer: "Meta / Coursera",
                issueDate: "2021-11",
                expiryDate: null,
                credentialUrl: "coursera.org/verify/meta-frontend",
              },
            ],

            languages: [
              { id: "lang_1", language: "English", proficiency: "Fluent" },
              { id: "lang_2", language: "Hindi", proficiency: "Native" },
              { id: "lang_3", language: "French", proficiency: "Beginner" },
            ],

            isFavorite: false,
            thumbnail: "",
            atsScore: 78,
          },
        }),
      });

      const newResume = await res.json();
      const mapped = mapResumeFromDB(newResume);

      console.log("Created new resume:", mapped);

      set({
        currentResume: mapped,
        isLoading: false,
        lastSaved: new Date(),
      });

      return mapped;
    } catch (error) {
      console.error("Error creating resume:", error);
      set({ isLoading: false });
      throw error;
    }
  },

  // NEW: Delete resume
  deleteResume: async (id: string) => {
    set({ isLoading: true });

    try {
      await fetch(`/api/resumes/${id}`, {
        method: "DELETE",
      });

      set({
        currentResume: null,
        isLoading: false,
      });
    } catch (error) {
      console.error("Error deleting resume:", error);
      set({ isLoading: false });
      throw error;
    }
  },

  // EXISTING METHODS (unchanged)
  setCurrentResume: (resume) => set({ currentResume: resume }),

  updateTitle: (title) =>
    set((state) => ({
      currentResume: state.currentResume
        ? { ...state.currentResume, title, updatedAt: new Date() }
        : null,
    })),

  updatePersonalInfo: (info) =>
    set((state) => ({
      currentResume: state.currentResume
        ? {
            ...state.currentResume,
            personalInfo: { ...state.currentResume.personalInfo, ...info },
            updatedAt: new Date(),
          }
        : null,
    })),

  updateSummary: (summary) =>
    set((state) => ({
      currentResume: state.currentResume
        ? { ...state.currentResume, summary, updatedAt: new Date() }
        : null,
    })),

  // Experience methods
  addExperience: (experience: Experience) =>
    set((state) => ({
      currentResume: state.currentResume
        ? {
            ...state.currentResume,
            experience: [...state.currentResume.experience, experience],
            updatedAt: new Date(),
          }
        : null,
    })),

  updateExperience: (id: string, updates: Partial<Experience>) =>
    set((state) => ({
      currentResume: state.currentResume
        ? {
            ...state.currentResume,
            experience: state.currentResume.experience.map((exp) =>
              exp.id === id ? { ...exp, ...updates } : exp,
            ),
            updatedAt: new Date(),
          }
        : null,
    })),

  deleteExperience: (id: string) =>
    set((state) => ({
      currentResume: state.currentResume
        ? {
            ...state.currentResume,
            experience: state.currentResume.experience.filter(
              (exp) => exp.id !== id,
            ),
            updatedAt: new Date(),
          }
        : null,
    })),

  // Education methods
  addEducation: (education: Education) =>
    set((state) => ({
      currentResume: state.currentResume
        ? {
            ...state.currentResume,
            education: [...state.currentResume.education, education],
            updatedAt: new Date(),
          }
        : null,
    })),

  updateEducation: (id: string, updates: Partial<Education>) =>
    set((state) => ({
      currentResume: state.currentResume
        ? {
            ...state.currentResume,
            education: state.currentResume.education.map((edu) =>
              edu.id === id ? { ...edu, ...updates } : edu,
            ),
            updatedAt: new Date(),
          }
        : null,
    })),

  deleteEducation: (id: string) =>
    set((state) => ({
      currentResume: state.currentResume
        ? {
            ...state.currentResume,
            education: state.currentResume.education.filter(
              (edu) => edu.id !== id,
            ),
            updatedAt: new Date(),
          }
        : null,
    })),

  // Skills methods
  addSkill: (skill: Skill) =>
    set((state) => ({
      currentResume: state.currentResume
        ? {
            ...state.currentResume,
            skills: [...state.currentResume.skills, skill],
            updatedAt: new Date(),
          }
        : null,
    })),

  updateSkill: (id: string, updates: Partial<Skill>) =>
    set((state) => ({
      currentResume: state.currentResume
        ? {
            ...state.currentResume,
            skills: state.currentResume.skills.map((skill) =>
              skill.id === id ? { ...skill, ...updates } : skill,
            ),
            updatedAt: new Date(),
          }
        : null,
    })),

  deleteSkill: (id: string) =>
    set((state) => ({
      currentResume: state.currentResume
        ? {
            ...state.currentResume,
            skills: state.currentResume.skills.filter(
              (skill) => skill.id !== id,
            ),
            updatedAt: new Date(),
          }
        : null,
    })),

  // Projects methods
  addProject: (project: Project) =>
    set((state) => ({
      currentResume: state.currentResume
        ? {
            ...state.currentResume,
            projects: [...state.currentResume.projects, project],
            updatedAt: new Date(),
          }
        : null,
    })),

  updateProject: (id: string, updates: Partial<Project>) =>
    set((state) => ({
      currentResume: state.currentResume
        ? {
            ...state.currentResume,
            projects: state.currentResume.projects.map((project) =>
              project.id === id ? { ...project, ...updates } : project,
            ),
            updatedAt: new Date(),
          }
        : null,
    })),

  deleteProject: (id: string) =>
    set((state) => ({
      currentResume: state.currentResume
        ? {
            ...state.currentResume,
            projects: state.currentResume.projects.filter(
              (project) => project.id !== id,
            ),
            updatedAt: new Date(),
          }
        : null,
    })),
}));
