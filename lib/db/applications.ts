import { Prisma } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";

// Get all job applications for a user
export async function getApplications(userId: string) {
  return prisma.jobApplication.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
  });
}

// Create job application
export async function createApplication(
  userId: string,
  data: Omit<Prisma.JobApplicationCreateInput, "userId">,
) {
  return prisma.jobApplication.create({
    data: { ...data, userId },
  });
}

// Update job application (status moves, notes edits, etc.)
export async function updateApplication(
  id: string,
  userId: string,
  data: Prisma.JobApplicationUpdateInput,
) {
  return prisma.jobApplication.update({
    where: { id, userId },
    data,
  });
}

// Delete job application
export async function deleteApplication(id: string, userId: string) {
  return prisma.jobApplication.delete({
    where: { id, userId },
  });
}
