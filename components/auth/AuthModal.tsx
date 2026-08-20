"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuthModalStore } from "@/store/authModalStore";
import { SignInForm } from "./SignInForm";
import { SignUpForm } from "./SignUpForm";

// Mounted once in app/layout.tsx. Fully custom, headless-Clerk (useSignIn/
// useSignUp) replacement for <SignInButton>/<SignUpButton mode="modal">, so
// no "Secured by Clerk" watermark. Every sign-in/sign-up trigger in the app
// opens this same instance via useAuthModalStore instead of rendering its
// own Clerk UI.
export function AuthModal() {
  const { isOpen, view, close, setView } = useAuthModalStore();
  const router = useRouter();

  const handleSuccess = () => {
    close();
    router.refresh();
  };

  // Reset back to the sign-in view after the close animation finishes, so
  // reopening later (from a different trigger) always starts fresh instead
  // of resuming wherever the last session left off.
  useEffect(() => {
    if (isOpen) return;
    const timeout = setTimeout(() => setView("sign-in"), 200);
    return () => clearTimeout(timeout);
  }, [isOpen, setView]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && close()}>
      <DialogContent className="gap-6 sm:max-w-100">
        <DialogHeader className="items-center text-center sm:text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-brand-purple via-brand-blue to-brand-pink">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <DialogTitle className="text-xl">
            {view === "sign-in" ? "Welcome back" : "Create your account"}
          </DialogTitle>
          <DialogDescription>
            {view === "sign-in"
              ? "Sign in to Rezlo to continue."
              : "Sign up to start building your resume with AI."}
          </DialogDescription>
        </DialogHeader>

        {view === "sign-in" ? (
          <SignInForm onSuccess={handleSuccess} onSwitchToSignUp={() => setView("sign-up")} />
        ) : (
          <SignUpForm onSuccess={handleSuccess} onSwitchToSignIn={() => setView("sign-in")} />
        )}
      </DialogContent>
    </Dialog>
  );
}
