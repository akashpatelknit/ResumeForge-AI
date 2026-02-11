"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import PersonalInfoSection from "./sections/PersonalInfoSection";
import ExperienceSection from "./sections/ExperienceSection";
import EducationSection from "./sections/EducationSection";
import SkillsSection from "./sections/SkillsSection";
import ProjectsSection from "./sections/ProjectsSection";

export default function ResumeForm() {
  return (
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
  );
}
