// Shared between the client-side pre-check (components/landing/ResumeDropzone.tsx)
// and the server-side enforcement (lib/textExtraction/extractResumeText.ts) so
// both sides agree on the same limit — the server check is the source of
// truth since the client check can be bypassed.
export const MAX_RESUME_FILE_SIZE_BYTES = 5 * 1024 * 1024;

// Uploaded PDFs attached as an alternative to a Rezlo-built Resume
// (see UploadedResume in prisma/schema.prisma) — same 5MB ceiling as the
// landing-page parse flow, reused rather than duplicated with a different
// number for no reason.
export const MAX_UPLOADED_RESUME_FILE_SIZE_BYTES = MAX_RESUME_FILE_SIZE_BYTES;

// Cap on how many raw PDFs a single user can have stored in blob storage at
// once — enforced in app/api/resumes/upload/route.ts before uploading, so a
// user hits a clear "delete one first" error instead of unbounded storage
// growth.
export const MAX_UPLOADED_RESUMES_PER_USER = 10;
