"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Loader2, Sparkles } from "lucide-react";
import MinimalHeader from "@/components/marketing/MinimalHeader";
import { Button } from "@/components/ui/button";
import WizardProgress from "@/components/wizard/WizardProgress";
import PersonalStep from "@/components/wizard/PersonalStep";
import ExperienceStep from "@/components/wizard/ExperienceStep";
import EducationStep from "@/components/wizard/EducationStep";
import SkillsStep from "@/components/wizard/SkillsStep";
import ProjectsStep from "@/components/wizard/ProjectsStep";
import { useAuthGatedSave } from "@/hooks/useAuthGatedSave";
import { clearPendingWizard, loadPendingWizard, savePendingWizard } from "@/lib/pendingResume";
import type { ResumeData } from "@/types/resume";
import { DEFAULT_SECTION_ORDER } from "@/lib/resumeSections";

const STEP_LABELS = ["Personal", "Experience", "Education", "Skills", "Projects"];

function blankResumeData(): ResumeData {
  return {
    personalInfo: {
      fullName: "",
      email: "",
      phone: "",
      location: "",
      linkedin: "",
      github: "",
      portfolio: "",
    },
    summary: "",
    experience: [],
    education: [],
    skills: [],
    projects: [],
    achievements: [],
    certifications: [],
    languages: [],
    customSections: [],
    sectionOrder: DEFAULT_SECTION_ORDER,
    isFavorite: false,
    isArchived: false,
    thumbnail: "",
    atsScore: 0,
  };
}

export default function CreateResumePage() {
  const [data, setData] = useState<ResumeData>(blankResumeData);
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [hasRestored, setHasRestored] = useState(false);

  // Restore in-progress wizard data (e.g. the user left before finishing).
  // Kept as a post-mount effect rather than a lazy useState initializer for
  // the same reason as ResumeDropzone: localStorage doesn't exist at SSR
  // time, so reading it during render would diverge from the server-
  // rendered (blank) form and trigger a hydration mismatch.
  useEffect(() => {
    const pending = loadPendingWizard();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (pending) setData(pending.data);
    setHasRestored(true);
  }, []);

  // Persist on every change so leaving mid-flow never loses progress.
  useEffect(() => {
    if (!hasRestored) return;
    savePendingWizard(data);
  }, [data, hasRestored]);

  const { save, isSaving } = useAuthGatedSave({
    load: loadPendingWizard,
    clear: clearPendingWizard,
  });

  const isLastStep = step === STEP_LABELS.length - 1;

  const goNext = () => {
    setDirection(1);
    setStep((s) => Math.min(s + 1, STEP_LABELS.length - 1));
  };
  const goBack = () => {
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 0));
  };

  const stepContent = useMemo(() => {
    switch (step) {
      case 0:
        return (
          <PersonalStep
            personalInfo={data.personalInfo}
            summary={data.summary}
            onChangePersonalInfo={(updates) =>
              setData((d) => ({ ...d, personalInfo: { ...d.personalInfo, ...updates } }))
            }
            onChangeSummary={(summary) => setData((d) => ({ ...d, summary }))}
          />
        );
      case 1:
        return (
          <ExperienceStep
            experience={data.experience}
            onChange={(experience) => setData((d) => ({ ...d, experience }))}
          />
        );
      case 2:
        return (
          <EducationStep
            education={data.education}
            onChange={(education) => setData((d) => ({ ...d, education }))}
          />
        );
      case 3:
        return (
          <SkillsStep
            skills={data.skills}
            onChange={(skills) => setData((d) => ({ ...d, skills }))}
          />
        );
      case 4:
        return (
          <ProjectsStep
            projects={data.projects}
            onChange={(projects) => setData((d) => ({ ...d, projects }))}
          />
        );
      default:
        return null;
    }
  }, [step, data]);

  return (
    <div className="flex min-h-screen flex-col">
      <MinimalHeader />

      <main className="flex flex-1 flex-col items-center px-4 py-10 sm:py-14">
        <div className="mb-10 w-full">
          <WizardProgress steps={STEP_LABELS} currentStep={step} />
        </div>

        <div className="w-full max-w-xl flex-1 overflow-hidden">
          <AnimatePresence mode="wait" custom={direction} initial={false}>
            <motion.div
              key={step}
              custom={direction}
              initial={{ opacity: 0, x: direction > 0 ? 48 : -48 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction > 0 ? -48 : 48 }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
            >
              {stepContent}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-10 flex w-full max-w-xl items-center justify-between">
          {step > 0 ? (
            <Button variant="ghost" onClick={goBack} className="gap-1.5">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          ) : (
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Drop a resume instead
            </Link>
          )}

          {isLastStep ? (
            <Button
              onClick={save}
              disabled={isSaving}
              className="gap-2 bg-gradient-hero text-white shadow-lg transition-transform duration-200 hover:scale-[1.02] hover:opacity-90 active:scale-[0.98]"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Finish
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={goNext}
              className="gap-1.5 transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}
