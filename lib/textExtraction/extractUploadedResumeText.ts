import "server-only";
import { extractResumeText, ResumeFileError } from "@/lib/textExtraction/extractResumeText";

// Fetches an UploadedResume's stored PDF from blob storage and runs it
// through the same extraction path the landing page's parse flow uses
// (extractResumeText) — reused rather than duplicated, per an explicit
// instruction not to re-implement PDF text extraction. Only called at AI
// generation time (Quick Apply / scheduled outreach), not at upload time,
// so an upload that will never be used for AI-personalized outreach never
// pays this cost.
export async function extractUploadedResumeText(fileUrl: string, fileName: string): Promise<string> {
  const res = await fetch(fileUrl);
  if (!res.ok) {
    throw new ResumeFileError("Could not fetch the uploaded resume file.");
  }
  const buffer = Buffer.from(await res.arrayBuffer());
  const file = new File([buffer], fileName, { type: "application/pdf" });
  return extractResumeText(file);
}
