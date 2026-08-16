"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";
import type { PendingResume } from "@/lib/pendingResume";
import { assertOkOrShowUpgrade, UpgradeRequiredError } from "@/lib/subscription/upgradeToast";
import { useAuthModalStore } from "@/store/authModalStore";

interface UseAuthGatedSaveOptions {
  load: () => PendingResume | null;
  clear: () => void;
}

// Shared by the post-drop preview (landing page) and the no-resume wizard's
// final step: gate resume creation behind sign-in, but only at this one
// moment — everything before it works without an account. The custom auth
// modal (email/password path) doesn't navigate away, so the pending
// localStorage entry and this hook's in-memory "the user asked to save"
// flag both survive it; the effect below fires the actual creation once
// `isSignedIn` flips true. (OAuth is a real page redirect either way — see
// components/auth/OAuthButtons.tsx — so that path relies on the pending
// entry alone, same as it did before this hook existed.)
export function useAuthGatedSave({ load, clear }: UseAuthGatedSaveOptions) {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useAuth();
  const openAuthModal = useAuthModalStore((state) => state.open);
  const [isSaving, setIsSaving] = useState(false);
  const wantsSaveRef = useRef(false);

  const performCreate = useCallback(async () => {
    const pending = load();
    if (!pending) return;

    setIsSaving(true);
    try {
      const title = pending.data.personalInfo.fullName
        ? `${pending.data.personalInfo.fullName}'s Resume`
        : "Untitled Resume";

      const res = await fetch("/api/resumes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, templateId: "modern", data: pending.data }),
      });

      await assertOkOrShowUpgrade(res, "Failed to save resume");

      const resume = await res.json();
      clear();
      router.push(`/builder/${resume.id}`);
    } catch (error) {
      if (error instanceof UpgradeRequiredError) {
        setIsSaving(false);
        return;
      }
      const message = error instanceof Error ? error.message : "Failed to save resume";
      toast.error(message);
      setIsSaving(false);
    }
  }, [load, clear, router]);

  const save = useCallback(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      wantsSaveRef.current = true;
      openAuthModal("sign-in");
      return;
    }

    void performCreate();
  }, [isLoaded, isSignedIn, openAuthModal, performCreate]);

  useEffect(() => {
    if (isSignedIn && wantsSaveRef.current) {
      wantsSaveRef.current = false;
      void performCreate();
    }
  }, [isSignedIn, performCreate]);

  return { save, isSaving };
}
