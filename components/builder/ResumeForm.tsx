"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PersonalInfoSection from "./sections/PersonalInfoSection";
import ExperienceSection from "./sections/ExperienceSection";
import EducationSection from "./sections/EducationSection";
import SkillsSection from "./sections/SkillsSection";
import ProjectsSection from "./sections/ProjectsSection";
import CustomSectionsSection from "./sections/CustomSectionsSection";
import { useResumeStore } from "@/store/resumeStore";
import { Loader2 } from "lucide-react";

// Reads ?tab=projects&importGithub=1 (set by the dashboard's "Import from
// GitHub" quick action — see components/dashboard/QuickActions.tsx) so the
// builder can land directly on the Projects tab with the import modal
// already open, instead of the user having to navigate there manually.
// useSearchParams() requires a Suspense boundary, so this logic is split
// into its own component rather than reading it directly in ResumeForm.
function useInitialTabState() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") === "projects" ? "projects" : "personal";
  const autoOpenGithubImport = searchParams.get("importGithub") === "1";
  return { initialTab, autoOpenGithubImport };
}

function ResumeFormContent() {
  const { currentResume, saveResume } = useResumeStore();
  const [isSaving, setIsSaving] = useState(false);
  const { initialTab, autoOpenGithubImport } = useInitialTabState();

  const handleSave = async () => {
    if (!currentResume) return;

    setIsSaving(true);
    try {
      await saveResume();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <Tabs defaultValue={initialTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="personal">Personal</TabsTrigger>
            <TabsTrigger value="experience">Experience</TabsTrigger>
            <TabsTrigger value="education">Education</TabsTrigger>
            <TabsTrigger value="skills">Skills</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="custom">Custom</TabsTrigger>
          </TabsList>

          <TabsContent value="personal" className="space-y-4 mt-4">
            <PersonalInfoSection />
          </TabsContent>

          <TabsContent value="experience" className="space-y-4 mt-4">
            <ExperienceSection />
          </TabsContent>

          <TabsContent value="education" className="space-y-4 mt-4">
            <EducationSection />
          </TabsContent>

          <TabsContent value="skills" className="space-y-4 mt-4">
            <SkillsSection />
          </TabsContent>

          <TabsContent value="projects" className="space-y-4 mt-4">
            <ProjectsSection autoOpenGithubImport={autoOpenGithubImport} />
          </TabsContent>

          <TabsContent value="custom" className="space-y-4 mt-4">
            <CustomSectionsSection />
          </TabsContent>
        </Tabs>
      </Card>

      {/* Save/Cancel Buttons */}
      <div className="flex gap-3 justify-end">
        <Button variant="outline">Cancel</Button>
        <Button
          onClick={handleSave}
          disabled={isSaving || !currentResume}
          className="gap-2"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Resume"
          )}
        </Button>
      </div>
    </div>
  );
}

export default function ResumeForm() {
  return (
    <Suspense fallback={null}>
      <ResumeFormContent />
    </Suspense>
  );
}
