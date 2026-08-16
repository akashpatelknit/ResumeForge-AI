import { isClerkAPIResponseError } from "@clerk/nextjs/errors";

// Clerk throws a ClerkAPIResponseError with a machine-oriented .errors[]
// array (code/message/longMessage) rather than a plain Error — this turns
// that (or anything else that comes out of a signIn/signUp call) into one
// user-facing sentence for inline display.
export function getClerkErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again.",
): string {
  if (isClerkAPIResponseError(error)) {
    return error.errors[0]?.longMessage || error.errors[0]?.message || fallback;
  }
  if (error instanceof Error) return error.message;
  return fallback;
}
