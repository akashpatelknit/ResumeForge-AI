"use client";

import { useState } from "react";
import { useSignIn, useSignUp } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { getClerkErrorMessage } from "@/lib/clerkError";
import { GitHubLogo, GoogleLogo } from "./BrandLogos";

type OAuthStrategy = "oauth_google" | "oauth_github";

interface OAuthButtonsProps {
  mode: "sign-in" | "sign-up";
  onError: (message: string) => void;
}

// Shared by both forms. OAuth always does a real top-level redirect (this
// is a Clerk/browser constraint, not something this custom UI introduces —
// the previous <SignInButton mode="modal"> had the same behavior), so it
// hands off to Clerk and never resolves normally; the callback lands on
// /sso-callback (app/sso-callback/page.tsx), which finishes the handshake
// and returns the browser to whatever page the button was clicked from.
export function OAuthButtons({ mode, onError }: OAuthButtonsProps) {
  const { isLoaded: signInLoaded, signIn } = useSignIn();
  const { isLoaded: signUpLoaded, signUp } = useSignUp();
  const [pending, setPending] = useState<OAuthStrategy | null>(null);

  const isLoaded = mode === "sign-in" ? signInLoaded : signUpLoaded;

  const handleOAuth = async (strategy: OAuthStrategy) => {
    if (mode === "sign-in" ? !signIn : !signUp) return;
    setPending(strategy);
    onError("");

    const redirectUrlComplete = `${window.location.pathname}${window.location.search}`;

    try {
      if (mode === "sign-in" && signIn) {
        await signIn.authenticateWithRedirect({
          strategy,
          redirectUrl: "/sso-callback",
          redirectUrlComplete,
        });
      } else if (signUp) {
        await signUp.authenticateWithRedirect({
          strategy,
          redirectUrl: "/sso-callback",
          redirectUrlComplete,
        });
      }
      // Browser is navigating away to the provider now — nothing left to do.
    } catch (error) {
      setPending(null);
      onError(getClerkErrorMessage(error, "Couldn't start sign-in. Please try again."));
    }
  };

  return (
    <div className="flex flex-col gap-2.5">
      <Button
        type="button"
        variant="outline"
        className="w-full gap-2.5"
        disabled={!isLoaded || pending !== null}
        onClick={() => handleOAuth("oauth_google")}
      >
        {pending === "oauth_google" ? <Spinner /> : <GoogleLogo />}
        Continue with Google
      </Button>
      <Button
        type="button"
        variant="outline"
        className="w-full gap-2.5"
        disabled={!isLoaded || pending !== null}
        onClick={() => handleOAuth("oauth_github")}
      >
        {pending === "oauth_github" ? <Spinner /> : <GitHubLogo />}
        Continue with GitHub
      </Button>
    </div>
  );
}
