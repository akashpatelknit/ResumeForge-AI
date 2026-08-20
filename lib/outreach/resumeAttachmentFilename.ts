import "server-only";

// Uploaded resumes keep their original filename in storage (UploadedResume.
// fileName — see app/api/resumes/upload/route.ts) so the "Uploaded PDFs"
// picker shows exactly what the user uploaded. At send time, though, the
// email attachment is renamed to the account holder's name instead of
// whatever the original file happened to be called (e.g. "scan_final_v2.pdf"),
// matching what the builder-resume path already does with
// `resume.personalInfo.fullName`.
export function buildResumeAttachmentFilename(firstName?: string | null, lastName?: string | null): string {
  const parts = [firstName, lastName].map((p) => p?.trim()).filter((p): p is string => Boolean(p));
  if (parts.length === 0) return "Resume.pdf";
  return `${parts.join("_")}.pdf`;
}
