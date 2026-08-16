import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { signAdminSession, setAdminSessionCookie } from "@/lib/admin/session";
import { checkAdminLoginRateLimit, recordAdminLoginAttempt } from "@/lib/rateLimit/adminLoginRateLimit";

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

// Best-effort client IP for rate limiting — trusts the first hop's
// x-forwarded-for entry, which is fine behind a single reverse proxy
// (Vercel/Fly/etc.) but isn't spoof-proof if this app is ever exposed
// directly to the internet without one in front of it.
function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

const GENERIC_ERROR = "Invalid email or password.";

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);

  const { allowed } = await checkAdminLoginRateLimit(ip);
  if (!allowed) {
    return NextResponse.json(
      { error: "TOO_MANY_ATTEMPTS", message: "Too many login attempts. Try again later." },
      { status: 429 },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_INPUT", message: GENERIC_ERROR }, { status: 400 });
  }

  await recordAdminLoginAttempt(ip);

  const { email, password } = parsed.data;
  const admin = await prisma.admin.findUnique({ where: { email } });

  // Compare against a dummy hash when no admin row matches, so the request
  // takes roughly the same time either way and doesn't leak account
  // existence via response timing.
  const hashToCompare = admin?.passwordHash ?? "$2b$12$h3b9BrVEvQVMlk1cbWrdK.44HEhWZyWJzzNdNDnrwszK65.q0aYem";
  const passwordMatches = await bcrypt.compare(password, hashToCompare);

  if (!admin || !passwordMatches) {
    return NextResponse.json({ error: "INVALID_CREDENTIALS", message: GENERIC_ERROR }, { status: 401 });
  }

  const token = await signAdminSession({ id: admin.id, email: admin.email });
  const response = NextResponse.json({ email: admin.email });
  setAdminSessionCookie(response, token);
  return response;
}
