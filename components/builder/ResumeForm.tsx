"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PersonalInfoSection from "./sections/PersonalInfoSection";
import ExperienceSection from "./sections/ExperienceSection";
import EducationSection from "./sections/EducationSection";
import SkillsSection from "./sections/SkillsSection";
import ProjectsSection from "./sections/ProjectsSection";
import { useResumeStore } from "@/store/resumeStore";
import { Loader2 } from "lucide-react";

export default function ResumeForm() {
  const { currentResume, saveResume } = useResumeStore();
  const [isSaving, setIsSaving] = useState(false);

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
        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="personal">Personal</TabsTrigger>
            <TabsTrigger value="experience">Experience</TabsTrigger>
            <TabsTrigger value="education">Education</TabsTrigger>
            <TabsTrigger value="skills">Skills</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
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
            <ProjectsSection />
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
