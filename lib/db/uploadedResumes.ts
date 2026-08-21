import type { Prisma } from "@/app/generated/prisma/client";
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

// Persists an ATS Readiness Score check (app/api/ats/check/route.ts) for an
// externally uploaded PDF — same shape/meaning as setResumeReadinessScore
// in lib/db/resumes.ts.
export async function setUploadedResumeReadinessScore(
  id: string,
  userId: string,
  readinessScore: number,
  readinessScoreDetails: Prisma.InputJsonValue,
) {
  return prisma.uploadedResume.update({
    where: { id, userId },
    data: { readinessScore, readinessScoreDetails },
  });
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
