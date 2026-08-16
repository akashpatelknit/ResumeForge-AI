import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { extractResumeText, ResumeFileError } from "@/lib/textExtraction/extractResumeText";
import { generateParseResume } from "@/lib/ai/generateParseResume";
import {
  ANON_ID_COOKIE,
  FREE_PARSE_LIMIT,
  getRemainingParses,
  incrementParseCount,
} from "@/lib/rateLimit/anonymousParseQuota";

// pdf-parse and mammoth need Node APIs (Buffer, fs) — not available on the edge runtime.
export const runtime = "nodejs";

// Deliberately NOT behind Clerk's auth.protect() (see proxy.ts) — this route
// must work pre-login. Signed-in users bypass the anonymous quota entirely.
export async function POST(request: NextRequest) {
  const { userId } = await auth();
  const isAnonymous = !userId;

  let anonId = request.cookies.get(ANON_ID_COOKIE)?.value;
  let setAnonCookie = false;
  if (isAnonymous && !anonId) {
    anonId = randomUUID();
    setAnonCookie = true;
  }

  if (isAnonymous && anonId) {
    const remaining = await getRemainingParses(anonId);
    if (remaining !== null && remaining <= 0) {
      const res = NextResponse.json(
        {
          error: "RATE_LIMITED",
          message: `You've used your ${FREE_PARSE_LIMIT} free resume parses — sign in to continue.`,
        },
        { status: 429 },
      );
      if (setAnonCookie) applyAnonCookie(res, anonId);
      return res;
    }
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "NO_FILE", message: "No file was uploaded." },
      { status: 400 },
    );
  }

  let text: string;
  try {
    text = await extractResumeText(file);
  } catch (error) {
    const message =
      error instanceof ResumeFileError ? error.message : "Could not read this file.";
    const res = NextResponse.json({ error: "EXTRACTION_FAILED", message }, { status: 400 });
    if (setAnonCookie && anonId) applyAnonCookie(res, anonId);
    return res;
  }

  let resume;
  try {
    resume = await generateParseResume(text);
  } catch (error) {
    console.error("Resume parse (Gemini) failed:", error);
    const res = NextResponse.json(
      { error: "AI_PARSE_FAILED", message: "Something went wrong reading your resume. Please try again." },
      { status: 502 },
    );
    if (setAnonCookie && anonId) applyAnonCookie(res, anonId);
    return res;
  }

  let remaining: number | null = null;
  if (isAnonymous && anonId) {
    await incrementParseCount(anonId);
    remaining = await getRemainingParses(anonId);
  }

  const res = NextResponse.json({ resume, remaining });
  if (setAnonCookie && anonId) applyAnonCookie(res, anonId);
  return res;
}

function applyAnonCookie(res: NextResponse, anonId: string) {
  res.cookies.set(ANON_ID_COOKIE, anonId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 180,
  });
}
