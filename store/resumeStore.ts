import { create } from "zustand";
import {
  AppResume,
  CustomSection,
  CustomSectionItem,
  Education,
  Experience,
  Project,
  Resume,
  Skill,
} from "@/types/resume";

import { mapResumeFromDB } from "@/mapper/mapResumeFromDB";
import { getSeedResumeData } from "@/lib/seedResumeData";

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
  createNewResume: (templateId: string, userId: string) => Promise<AppResume>;

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

  // Custom sections — user-defined sections beyond the fixed set
  addCustomSection: (title: string) => void;
  updateCustomSectionTitle: (sectionId: string, title: string) => void;
  deleteCustomSection: (sectionId: string) => void;
  addCustomSectionItem: (sectionId: string, item: CustomSectionItem) => void;
  updateCustomSectionItem: (
    sectionId: string,
    itemId: string,
    updates: Partial<CustomSectionItem>,
  ) => void;
  deleteCustomSectionItem: (sectionId: string, itemId: string) => void;
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
            customSections: currentResume.customSections,
            isFavorite: currentResume.isFavorite,
            isArchived: currentResume.isArchived,
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
          data: getSeedResumeData(templateId),
        }),
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.error || "Failed to create resume");
      }

      const newResume = await res.json();
      const mapped = mapResumeFromDB(newResume);

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

  // Custom sections methods
  addCustomSection: (title: string) =>
    set((state) => {
      if (!state.currentResume) return {};
      const newSection: CustomSection = {
        id: crypto.randomUUID(),
        title,
        items: [],
      };
      return {
        currentResume: {
          ...state.currentResume,
          customSections: [...state.currentResume.customSections, newSection],
          updatedAt: new Date(),
        },
      };
    }),

  updateCustomSectionTitle: (sectionId: string, title: string) =>
    set((state) => ({
      currentResume: state.currentResume
        ? {
            ...state.currentResume,
            customSections: state.currentResume.customSections.map((section) =>
              section.id === sectionId ? { ...section, title } : section,
            ),
            updatedAt: new Date(),
          }
        : null,
    })),

  deleteCustomSection: (sectionId: string) =>
    set((state) => ({
      currentResume: state.currentResume
        ? {
            ...state.currentResume,
            customSections: state.currentResume.customSections.filter(
              (section) => section.id !== sectionId,
            ),
            updatedAt: new Date(),
          }
        : null,
    })),

  addCustomSectionItem: (sectionId: string, item: CustomSectionItem) =>
    set((state) => ({
      currentResume: state.currentResume
        ? {
            ...state.currentResume,
            customSections: state.currentResume.customSections.map((section) =>
              section.id === sectionId
                ? { ...section, items: [...section.items, item] }
                : section,
            ),
            updatedAt: new Date(),
          }
        : null,
    })),

  updateCustomSectionItem: (
    sectionId: string,
    itemId: string,
    updates: Partial<CustomSectionItem>,
  ) =>
    set((state) => ({
      currentResume: state.currentResume
        ? {
            ...state.currentResume,
            customSections: state.currentResume.customSections.map((section) =>
              section.id === sectionId
                ? {
                    ...section,
                    items: section.items.map((item) =>
                      item.id === itemId ? { ...item, ...updates } : item,
                    ),
                  }
                : section,
            ),
            updatedAt: new Date(),
          }
        : null,
    })),

  deleteCustomSectionItem: (sectionId: string, itemId: string) =>
    set((state) => ({
      currentResume: state.currentResume
        ? {
            ...state.currentResume,
            customSections: state.currentResume.customSections.map((section) =>
              section.id === sectionId
                ? {
                    ...section,
                    items: section.items.filter((item) => item.id !== itemId),
                  }
                : section,
            ),
            updatedAt: new Date(),
          }
        : null,
    })),
}));
