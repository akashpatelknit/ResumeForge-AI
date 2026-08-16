import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";
import { Spinner } from "@/components/ui/spinner";

// Required landing point for Clerk's OAuth redirect flow when using headless
// hooks instead of <SignIn />/<SignUp /> — signIn/signUp.authenticateWithRedirect()
// in components/auth/OAuthButtons.tsx sends the browser to the provider, which
// redirects back here to finish the handshake before continuing on to
// redirectUrlComplete. AuthenticateWithRedirectCallback renders no UI of its
// own (no watermark) — it's callback-completion logic, not a sign-in form.
export default function SSOCallbackPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Spinner className="size-6 text-muted-foreground" />
      <AuthenticateWithRedirectCallback />
    </div>
  );
}
