import { Prisma } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { ResumeData } from "@/types/resume";
import { Resume } from "@prisma/client";

// Get all resumes for a user
export async function getResumes(userId: string) {
  return prisma.resume.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

// Get single resume
export async function getResume(id: string, userId: string) {
  return prisma.resume.findFirst({
    where: { id, userId },
  });
}

// Create resume
export async function createResume(
  userId: string,
  data: Omit<Prisma.ResumeCreateInput, "userId">,
) {
  return prisma.resume.create({
    data: { ...data, userId },
  });
}

// Update resume
export async function updateResume(
  id: string,
  userId: string,
  data: Prisma.ResumeUpdateInput,
) {
  return prisma.resume.update({
    where: {
      id,
      userId,
    },
    data,
  });
}

// Delete resume
export async function deleteResume(id: string, userId: string) {
  return prisma.resume.delete({
    where: {
      id,
      userId,
    },
  });
}

// Get resume with cover letters and analytics
export async function getResumeWithCoverLetters(id: string, userId: string) {
  return prisma.resume.findFirst({
    where: { id, userId },
    include: {
      coverLetters: true,
      analytics: true,
    },
  });
}

// Track analytics event
export async function trackEvent(
  resumeId: string,
  eventType: string,
  eventData?: Record<string, any>,
) {
  return prisma.resumeAnalytics.create({
    data: {
      resumeId,
      eventType,
      eventData: eventData || {},
    },
  });
}

// Get resume analytics
export async function getResumeAnalytics(resumeId: string) {
  return prisma.resumeAnalytics.findMany({
    where: { resumeId },
    orderBy: { createdAt: "desc" },
  });
}

// Toggle resume favorite status
export async function toggleFavorite(id: string, userId: string) {
  const resume = await prisma.resume.findFirst({
    where: { id, userId },
  });

  if (!resume) {
    throw new Error("Resume not found");
  }

  const currentData = resume.data as unknown as ResumeData;

  const updatedData: ResumeData = {
    ...currentData,
    isFavorite: !currentData.isFavorite,
  };

  return prisma.resume.update({
    where: { id },
    data: updatedData,
  });
}
