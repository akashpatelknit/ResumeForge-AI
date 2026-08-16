"use client";

import { useState } from "react";
import { useSignIn } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { getClerkErrorMessage } from "@/lib/clerkError";
import { OAuthButtons } from "./OAuthButtons";

interface SignInFormProps {
  onSuccess: () => void;
  onSwitchToSignUp: () => void;
}

export function SignInForm({ onSuccess, onSwitchToSignUp }: SignInFormProps) {
  const { isLoaded, signIn, setActive } = useSignIn();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded || isSubmitting) return;

    setIsSubmitting(true);
    setError("");

    try {
      const result = await signIn.create({
        identifier: email,
        password,
        strategy: "password",
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        onSuccess();
      } else {
        // Account has additional verification steps (2FA, etc.) that this
        // simple email/password form doesn't implement.
        setError("This account needs additional verification that isn't supported here.");
      }
    } catch (err) {
      setError(getClerkErrorMessage(err, "Couldn't sign in with those details."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <OAuthButtons mode="sign-in" onError={setError} />

      <div className="relative flex items-center">
        <div className="h-px flex-1 bg-border" />
        <span className="px-3 text-xs text-muted-foreground">or continue with email</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="signin-email">Email</Label>
          <Input
            id="signin-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="signin-password">Password</Label>
          <Input
            id="signin-password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>

        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}

        <Button
          type="submit"
          disabled={!isLoaded || isSubmitting}
          className="mt-1 w-full gap-2 bg-linear-to-r from-brand-purple via-brand-blue to-brand-pink text-white hover:opacity-90"
        >
          {isSubmitting && <Spinner />}
          Sign In
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <button
          type="button"
          onClick={onSwitchToSignUp}
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          Sign up
        </button>
      </p>
    </div>
  );
}
