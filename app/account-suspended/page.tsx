import { SignOutButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

// Shown in place of the app for a signed-in user whose UserStatus.isBlocked
// is true — see the blocked-user gate in proxy.ts, which redirects here
// instead of letting the request through to any (app) route.
export default function AccountSuspendedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-lg border bg-white p-8 text-center shadow-sm">
        <h1 className="mb-2 text-lg font-semibold text-gray-900">Your account has been suspended</h1>
        <p className="mb-6 text-sm text-gray-600">
          Access to Rezlo has been temporarily disabled for this account. If you believe this is a mistake,
          contact support at{" "}
          <a href="mailto:support@rezlo.app" className="text-primary underline">
            support@rezlo.app
          </a>
          .
        </p>
        <SignOutButton>
          <Button variant="outline" className="w-full">
            Sign out
          </Button>
        </SignOutButton>
      </div>
    </div>
  );
}
