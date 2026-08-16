// Shared between the client-side pre-check (components/landing/ResumeDropzone.tsx)
// and the server-side enforcement (lib/textExtraction/extractResumeText.ts) so
// both sides agree on the same limit — the server check is the source of
// truth since the client check can be bypassed.
export const MAX_RESUME_FILE_SIZE_BYTES = 5 * 1024 * 1024;
