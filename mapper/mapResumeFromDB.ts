import { Resume as PrismaResume } from "@prisma/client";
import { AppResume, ResumeData } from "@/types/resume";

export function mapResumeFromDB(r: PrismaResume): AppResume {
  const data = r.data as unknown as ResumeData;

  return {
    ...r,
    ...data,
  };
}
