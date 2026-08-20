import "server-only";
import { MAX_RESUME_FILE_SIZE_BYTES } from "@/lib/constants";

// Thrown for anything caused by the file itself (wrong type, corrupt,
// password-protected, empty) — the parse route uses this to 400 without
// touching the anonymous rate-limit quota, as opposed to a Gemini-side
// failure which is a 502.
export class ResumeFileError extends Error {}

const SUPPORTED_EXTENSIONS = ["pdf", "docx"] as const;

function getExtension(filename: string): string {
  return filename.split(".").pop()?.toLowerCase() ?? "";
}

// unpdf ships its own serverless-optimized PDF.js build with browser-only
// code (canvas, DOMMatrix, etc.) stripped out — unlike pdf-parse, which
// pulls in @napi-rs/canvas as a native-binary polyfill source for those
// APIs. That native binary is resolved via a runtime require() keyed off
// process.platform/arch, which Vercel's static file tracer can't follow,
// so it silently got dropped from the deployed function ("Cannot find
// module '@napi-rs/canvas'" in production logs, working fine locally
// where the matching binary is already on disk). unpdf has zero
// dependencies and needs no such polyfill for text extraction.
async function extractFromPdf(buffer: Buffer): Promise<string> {
  try {
    const { extractText, getDocumentProxy } = await import("unpdf");
    const pdf = await getDocumentProxy(new Uint8Array(buffer));
    const { text } = await extractText(pdf, { mergePages: true });
    return text;
  } catch (error) {
    console.error("PDF extraction failed:", error);
    throw new ResumeFileError("Could not read this PDF — it may be corrupt or password-protected.");
  }
}

async function extractFromDocx(buffer: Buffer): Promise<string> {
  const mammoth = await import("mammoth");
  try {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } catch {
    throw new ResumeFileError("Could not read this DOCX file — it may be corrupt.");
  }
}

export async function extractResumeText(file: File): Promise<string> {
  const extension = getExtension(file.name);

  if (!SUPPORTED_EXTENSIONS.includes(extension as (typeof SUPPORTED_EXTENSIONS)[number])) {
    throw new ResumeFileError("Only PDF and DOCX files are supported.");
  }

  if (file.size > MAX_RESUME_FILE_SIZE_BYTES) {
    throw new ResumeFileError("This file is larger than 5MB — try a smaller file.");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  if (buffer.length === 0) {
    throw new ResumeFileError("This file is empty.");
  }

  const text =
    extension === "pdf" ? await extractFromPdf(buffer) : await extractFromDocx(buffer);

  if (!text.trim()) {
    throw new ResumeFileError("No readable text found in this file.");
  }

  return text;
}
