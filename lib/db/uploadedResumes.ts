import { prisma } from "@/lib/prisma";

// Same thin-wrapper-over-prisma shape as lib/db/resumes.ts.

export async function getUploadedResumes(userId: string) {
  return prisma.uploadedResume.findMany({
    where: { userId },
    orderBy: { uploadedAt: "desc" },
  });
}

export async function getUploadedResume(id: string, userId: string) {
  return prisma.uploadedResume.findFirst({
    where: { id, userId },
  });
}

export async function countUploadedResumes(userId: string) {
  return prisma.uploadedResume.count({ where: { userId } });
}

export async function createUploadedResume(params: {
  userId: string;
  fileName: string;
  fileUrl: string;
  fileSizeBytes: number;
}) {
  return prisma.uploadedResume.create({ data: params });
}

export async function deleteUploadedResume(id: string, userId: string) {
  return prisma.uploadedResume.delete({
    where: { id, userId },
  });
}

// Persists the text extracted from this upload's PDF on first use (Quick
// Apply / scheduled outreach generation), so later generations for the same
// upload can skip both the blob fetch and the PDF parse. Scoped to userId
// like every other write here even though the caller already owns the row
// (defense in depth, same pattern as deleteUploadedResume).
export async function setUploadedResumeParsedText(id: string, userId: string, parsedText: string) {
  return prisma.uploadedResume.update({
    where: { id, userId },
    data: { parsedText },
  });
}
