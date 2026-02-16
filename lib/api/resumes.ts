import { Resume } from "@/types/resume";
import { toast } from "sonner";

interface SaveResumeParams {
  id?: string;
  title: string;
  templateId: string;
  personalInfo: Resume["personalInfo"];
  summary: string;
  experience: Resume["experience"];
  education: Resume["education"];
  skills: Resume["skills"];
  projects: Resume["projects"];
  achievements?: any[];
  certifications?: any[];
  languages?: any[];
  isFavorite?: boolean;
  thumbnail?: string;
  atsScore?: number;
}

export async function saveResume(data: SaveResumeParams) {
  try {
    const url = data.id ? `/api/resumes/${data.id}` : "/api/resumes";
    const method = data.id ? "PUT" : "POST";

    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to save resume");
    }

    const savedResume = await response.json();
    toast.success(
      data.id ? "Resume updated successfully" : "Resume created successfully",
    );
    return savedResume;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to save resume";
    toast.error(message);
    throw error;
  }
}

export async function deleteResume(id: string) {
  try {
    const response = await fetch(`/api/resumes/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to delete resume");
    }

    toast.success("Resume deleted successfully");
    return true;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to delete resume";
    toast.error(message);
    throw error;
  }
}

export async function fetchResume(id: string) {
  try {
    const response = await fetch(`/api/resumes/${id}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch resume");
    }

    return await response.json();
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch resume";
    toast.error(message);
    throw error;
  }
}

export async function fetchResumes() {
  try {
    const response = await fetch("/api/resumes");

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch resumes");
    }

    return await response.json();
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch resumes";
    toast.error(message);
    throw error;
  }
}
