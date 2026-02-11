import { create } from "zustand";
import { Education, Experience, Project, Resume, Skill } from "@/types/resume";

interface ResumeStore {
  currentResume: Resume | null;
  setCurrentResume: (resume: Resume) => void;
  updatePersonalInfo: (info: Partial<Resume["personalInfo"]>) => void;
  updateSummary: (summary: string) => void;
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

export const useResumeStore = create<ResumeStore>((set) => ({
  currentResume: null,

  setCurrentResume: (resume) => set({ currentResume: resume }),

  updatePersonalInfo: (info) =>
    set((state) => ({
      currentResume: state.currentResume
        ? {
            ...state.currentResume,
            personalInfo: { ...state.currentResume.personalInfo, ...info },
          }
        : null,
    })),

  updateSummary: (summary) =>
    set((state) => ({
      currentResume: state.currentResume
        ? { ...state.currentResume, summary }
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
