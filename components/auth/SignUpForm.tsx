"use client";

import { useState } from "react";
import { useSignUp } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { getClerkErrorMessage } from "@/lib/clerkError";
import { OAuthButtons } from "./OAuthButtons";

interface SignUpFormProps {
  onSuccess: () => void;
  onSwitchToSignIn: () => void;
}

type Step = "form" | "verify";

export function SignUpForm({ onSuccess, onSwitchToSignIn }: SignUpFormProps) {
  const { isLoaded, signUp, setActive } = useSignUp();
  const [step, setStep] = useState<Step>("form");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded || isSubmitting) return;

    setIsSubmitting(true);
    setError("");

    try {
      await signUp.create({ emailAddress: email, password });
      // Clerk requires the email to be verified via a code before a
      // custom (non-prebuilt) sign-up can be completed.
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setStep("verify");
    } catch (err) {
      setError(getClerkErrorMessage(err, "Couldn't create that account."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded || isSubmitting) return;

    setIsSubmitting(true);
    setError("");

    try {
      const result = await signUp.attemptEmailAddressVerification({ code });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        onSuccess();
      } else {
        setError("That code didn't complete sign-up. Please try again.");
      }
    } catch (err) {
      setError(getClerkErrorMessage(err, "That code isn't valid."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!isLoaded || isResending) return;
    setIsResending(true);
    setError("");
    try {
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
    } catch (err) {
      setError(getClerkErrorMessage(err, "Couldn't resend the code."));
    } finally {
      setIsResending(false);
    }
  };

  if (step === "verify") {
    return (
      <form onSubmit={handleVerify} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <p className="text-sm text-muted-foreground">
            We sent a 6-digit code to <span className="font-medium text-foreground">{email}</span>.
            Enter it below to finish creating your account.
          </p>
        </div>

        <div className="flex flex-col items-center gap-1.5">
          <Label htmlFor="verify-code" className="self-start">
            Verification code
          </Label>
          <InputOTP id="verify-code" maxLength={6} value={code} onChange={setCode} autoFocus>
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>

        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}

        <Button
          type="submit"
          disabled={!isLoaded || isSubmitting || code.length < 6}
          className="w-full gap-2 bg-linear-to-r from-brand-purple via-brand-blue to-brand-pink text-white hover:opacity-90"
        >
          {isSubmitting && <Spinner />}
          Verify &amp; create account
        </Button>

        <div className="flex items-center justify-between text-sm">
          <button
            type="button"
            onClick={() => {
              setStep("form");
              setCode("");
              setError("");
            }}
            className="text-muted-foreground hover:text-foreground"
          >
            Back
          </button>
          <button
            type="button"
            onClick={handleResend}
            disabled={isResending}
            className="font-medium text-foreground underline-offset-4 hover:underline disabled:opacity-50"
          >
            {isResending ? "Resending…" : "Resend code"}
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <OAuthButtons mode="sign-up" onError={setError} />

      <div className="relative flex items-center">
        <div className="h-px flex-1 bg-border" />
        <span className="px-3 text-xs text-muted-foreground">or continue with email</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <form onSubmit={handleCreate} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="signup-email">Email</Label>
          <Input
            id="signup-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="signup-password">Password</Label>
          <Input
            id="signup-password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
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
          Sign Up
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <button
          type="button"
          onClick={onSwitchToSignIn}
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          Sign in
        </button>
      </p>
    </div>
  );
}
