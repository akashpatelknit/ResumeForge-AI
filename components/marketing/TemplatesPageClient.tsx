"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { Clock, Crown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import Navbar from "@/components/marketing/Navbar";
import Footer from "@/components/landing/Footer";
import ResumeTemplatePreview from "@/components/marketing/ResumeTemplatePreview";
import TemplateThumbnail from "@/components/dashboard/TemplateThumbnail";
import { sampleTemplates } from "@/config/templates";
import type { Template } from "@/types/template";
import { useResumeStore } from "@/store/resumeStore";
import { useAuthModalStore } from "@/store/authModalStore";

// Filter pills are derived from whichever `category` values actually appear
// in sampleTemplates, in their config order — "modern" (the one real,
// selectable template) then "professional" / "minimal" (its two
// not-yet-built comingSoon placeholders). No "Classic" or "Creative" pill:
// neither is a real category any template in the catalog currently uses.
const CATEGORY_ORDER = Array.from(new Set(sampleTemplates.map((t) => t.category)));
const CATEGORIES: { id: Template["category"] | "all"; label: string }[] = [
  { id: "all", label: "All" },
  ...CATEGORY_ORDER.map((c) => ({ id: c, label: c.charAt(0).toUpperCase() + c.slice(1) })),
];

export default function TemplatesPageClient() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const createNewResume = useResumeStore((s) => s.createNewResume);
  const openAuthModal = useAuthModalStore((s) => s.open);

  const [selectedCategory, setSelectedCategory] = useState<Template["category"] | "all">("all");
  const [creatingId, setCreatingId] = useState<string | null>(null);
  // Same auth-gating shape as hooks/useAuthGatedSave.ts: a signed-out click
  // opens the shared sign-in modal and remembers which template was wanted;
  // the effect below fires the real creation once isSignedIn flips true.
  const wantsTemplateRef = useRef<string | null>(null);

  const filteredTemplates =
    selectedCategory === "all" ? sampleTemplates : sampleTemplates.filter((t) => t.category === selectedCategory);

  // Identical to app/(app)/builder/new/page.tsx's handleSelectTemplate —
  // same createNewResume + router.push("/builder/{id}") flow, so a resume
  // started from this public page lands in the exact same place one
  // started from the in-app template picker would.
  const performCreate = useCallback(
    async (templateId: string) => {
      setCreatingId(templateId);
      try {
        const resume = await createNewResume(templateId, user?.id ?? "");
        router.push(`/builder/${resume.id}`);
      } catch (error) {
        console.error("Failed to create resume from template:", error);
        toast.error("Failed to create resume. Please try again.");
        setCreatingId(null);
      }
    },
    [createNewResume, router, user],
  );

  useEffect(() => {
    if (isSignedIn && wantsTemplateRef.current) {
      const templateId = wantsTemplateRef.current;
      wantsTemplateRef.current = null;
      void performCreate(templateId);
    }
  }, [isSignedIn, performCreate]);

  function handleUseTemplate(templateId: string) {
    if (!isLoaded || creatingId) return;
    if (!isSignedIn) {
      wantsTemplateRef.current = templateId;
      openAuthModal("sign-in");
      return;
    }
    void performCreate(templateId);
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Navbar />

      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">Resume Templates</h1>
            <p className="mt-3 text-base text-gray-500">
              Professionally designed templates, ATS-optimized and ready to use.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={cn(
                    "cursor-pointer rounded-full px-4 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-brand-purple text-white shadow-sm"
                      : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50",
                  )}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTemplates.map((template) =>
              template.comingSoon ? (
                // Not-yet-built templates (empty PDF component stubs — see
                // components/pdf/template/ProfessionalTemplate.tsx /
                // MinimalTemplate.tsx) get the same locked treatment
                // components/dashboard/Templatecard.tsx already uses: the
                // abstract-bars mockup, muted, with a "Coming Soon" badge —
                // there's no real content to show for these yet, so showing
                // any wouldn't be honest.
                <div
                  key={template.id}
                  className="overflow-hidden rounded-2xl border border-gray-200 bg-white opacity-70 shadow-sm"
                >
                  <div className="relative aspect-[3/4] overflow-hidden border-b border-gray-100 bg-gray-50 saturate-0">
                    <TemplateThumbnail />
                    <div className="absolute inset-0 flex items-center justify-center bg-white/60">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-900 px-2.5 py-1 text-[11px] font-semibold text-white">
                        <Clock className="h-3 w-3" />
                        Coming Soon
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="font-bold text-gray-500">{template.name}</p>
                    <p className="mt-0.5 text-sm text-gray-400">{template.description}</p>
                  </div>
                </div>
              ) : (
                <div
                  key={template.id}
                  className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-lg"
                >
                  <div className="relative aspect-[3/4] overflow-hidden border-b border-gray-100 bg-gray-50">
                    <ResumeTemplatePreview className="transition-transform duration-300 group-hover:scale-[1.02]" />

                    <div className="absolute inset-0 flex items-center justify-center bg-gray-900/55 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={() => handleUseTemplate(template.id)}
                        disabled={creatingId === template.id}
                        className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-brand-purple px-5 py-2.5 text-sm font-semibold text-white shadow-lg hover:bg-brand-purple/90 disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {creatingId === template.id && <Loader2 className="h-4 w-4 animate-spin" />}
                        Use this template
                      </button>
                    </div>
                  </div>

                  <div className="flex items-start justify-between gap-2 p-4">
                    <div>
                      <p className="font-bold text-gray-900">{template.name}</p>
                      <p className="mt-0.5 text-sm text-gray-500">{template.description}</p>
                    </div>
                    {template.isPremium && (
                      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-purple-50 px-2 py-1 text-[11px] font-semibold text-brand-purple">
                        <Crown className="h-3 w-3" />
                        Pro
                      </span>
                    )}
                  </div>
                </div>
              ),
            )}
          </div>

          {filteredTemplates.length === 0 && (
            <p className="mt-16 text-center text-sm text-gray-400">No templates in this category yet.</p>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
