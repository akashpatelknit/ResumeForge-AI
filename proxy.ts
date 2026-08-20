import { NextResponse } from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

// Define public routes (accessible without login)
const isPublicRoute = createRouteMatcher([
  "/", // Landing page
  "/sign-in(.*)", // Sign in page
  "/sign-up(.*)", // Sign up page
  "/features", // Features page
  "/templates", // Templates showcase page
  "/pricing", // Pricing page
  "/about", // About page
  "/create", // No-resume multi-step wizard (auth only gated at the final save step)
  "/api/webhooks(.*)", // Webhook endpoints
  "/api/resume/parse", // Resume drop-and-parse — must work pre-login
  "/api/cron(.*)", // Cron-triggered endpoints — guarded by CRON_SECRET, not Clerk (called by a scheduler, not a logged-in user)
  "/sso-callback", // Clerk OAuth redirect landing page — hit before a session exists
  "/account-suspended", // Shown to a blocked user in place of the app — must render without re-triggering auth.protect()
  "/opengraph-image", // Dynamic OG image route — fetched unauthenticated by social-media crawlers
  "/icon", // Dynamic favicon route — same extensionless-URL issue as /opengraph-image
  "/apple-icon", // Dynamic Apple touch icon route — same extensionless-URL issue as /opengraph-image
]);

// /admin and /api/admin have their own, completely separate session system
// (lib/admin/session.ts, an admin_session cookie + JWT, nothing to do with
// Clerk) guarded by app/(admin)/admin/(dashboard)/layout.tsx and each admin
// route handler's requireAdminSession() call. Bailing out here before any
// Clerk logic runs means a signed-in Clerk user gets no special treatment
// on these paths at all — this file never even asks Clerk who they are.
const isAdminRoute = createRouteMatcher(["/admin(.*)", "/api/admin(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isAdminRoute(req)) {
    return NextResponse.next();
  }

  // Protect all routes except public ones
  if (!isPublicRoute(req)) {
    await auth.protect();
  }

  // Blocked-user gate: only runs for signed-in Clerk users (userId is null
  // for anonymous visitors to public routes), and is skipped for the
  // suspended page itself. Relies on `proxy.ts` (Next 16's renamed
  // middleware) always running on the Node.js runtime — unlike the old
  // Edge-only middleware.ts, so Prisma's pg adapter works here directly.
  const { userId } = await auth();
  if (userId && req.nextUrl.pathname !== "/account-suspended") {
    const status = await prisma.userStatus.findUnique({ where: { userId } });
    if (status?.isBlocked) {
      if (req.nextUrl.pathname.startsWith("/api")) {
        return NextResponse.json(
          { error: "ACCOUNT_SUSPENDED", message: "Your account has been suspended." },
          { status: 403 },
        );
      }
      return NextResponse.redirect(new URL("/account-suspended", req.url));
    }
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
