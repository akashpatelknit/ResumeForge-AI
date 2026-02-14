import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Define public routes (accessible without login)
const isPublicRoute = createRouteMatcher([
  "/", // Landing page
  "/sign-in(.*)", // Sign in page
  "/sign-up(.*)", // Sign up page
  "/features", // Features page
  "/templates", // Templates showcase page
  "/pricing", // Pricing page
  "/api/webhooks(.*)", // Webhook endpoints
]);

export default clerkMiddleware(async (auth, req) => {
  // Protect all routes except public ones
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
