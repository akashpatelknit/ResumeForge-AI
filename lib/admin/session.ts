import "server-only";
import { NextResponse } from "next/server";
import { SignJWT, jwtVerify, type JWTPayload } from "jose";

// Deliberately its own cookie name — never share a name with Clerk's
// session cookie, otherwise a Clerk-authenticated user's cookie could
// collide with (or be confused for) an admin session.
export const ADMIN_SESSION_COOKIE = "admin_session";
const ADMIN_SESSION_TTL_SECONDS = 60 * 60 * 24; // 24h — see class doc in the PR description for the re-login-after-expiry tradeoff.

export interface AdminSessionPayload extends JWTPayload {
  adminId: string;
  email: string;
}

function getSecretKey(): Uint8Array {
  const secret = process.env.ADMIN_JWT_SECRET;
  if (!secret) {
    throw new Error("ADMIN_JWT_SECRET is not set — the admin dashboard cannot issue or verify sessions without it.");
  }
  return new TextEncoder().encode(secret);
}

export async function signAdminSession(admin: { id: string; email: string }): Promise<string> {
  return new SignJWT({ adminId: admin.id, email: admin.email })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${ADMIN_SESSION_TTL_SECONDS}s`)
    .sign(getSecretKey());
}

// Returns null rather than throwing on any failure (expired, malformed,
// wrong signature) — callers only care about valid vs. not.
export async function verifyAdminSession(token: string): Promise<AdminSessionPayload | null> {
  try {
    const { payload } = await jwtVerify<AdminSessionPayload>(token, getSecretKey());
    if (typeof payload.adminId !== "string" || typeof payload.email !== "string") return null;
    return payload;
  } catch {
    return null;
  }
}

export function setAdminSessionCookie(response: NextResponse, token: string): void {
  response.cookies.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ADMIN_SESSION_TTL_SECONDS,
  });
}

export function clearAdminSessionCookie(response: NextResponse): void {
  response.cookies.set(ADMIN_SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

// Server Components / layouts only (reads the incoming request's cookies
// via next/headers). Route Handlers should use requireAdminSession below
// instead, since they need to return a 401 NextResponse on failure.
export async function getAdminSession(): Promise<AdminSessionPayload | null> {
  const { cookies } = await import("next/headers");
  const token = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifyAdminSession(token);
}

export type AdminAuthResult =
  | { ok: true; admin: AdminSessionPayload }
  | { ok: false; response: NextResponse };

// Route Handler guard — call at the top of every app/api/admin/** handler
// (except login/logout themselves). Mirrors the {allowed, response} pattern
// used by lib/subscription/checkResumeLimit.ts's checkResumeCreationGate.
export async function requireAdminSession(request: Request): Promise<AdminAuthResult> {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const token = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${ADMIN_SESSION_COOKIE}=`))
    ?.slice(ADMIN_SESSION_COOKIE.length + 1);

  const admin = token ? await verifyAdminSession(decodeURIComponent(token)) : null;

  if (!admin) {
    return {
      ok: false,
      response: NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 }),
    };
  }

  return { ok: true, admin };
}
