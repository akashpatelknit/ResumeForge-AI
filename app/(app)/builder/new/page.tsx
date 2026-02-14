"use client";

import TemplateCard from "@/components/builder/TemplateCard";
import { sampleTemplates } from "@/config/templates";

import { useRouter } from "next/navigation";

export default function TemplateSelectionPage() {
  const router = useRouter();

  const handleSelectTemplate = async (templateId: string) => {
    // Create new resume with selected template
    const newResume = {
      id: crypto.randomUUID(),
      title: "Untitled Resume",
      templateId: templateId, // ← Store template ID
      personalInfo: {
        /* empty */
      },
      summary: "",
      experience: [],
      education: [],
      skills: [],
      projects: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Save to database (or localStorage for now)
    // await saveResume(newResume);

    // Redirect to builder
    router.push(`/builder/${newResume.id}`);
  };

  return (
    <div className="container py-12">
      <h1 className="text-3xl font-bold mb-8">Choose a Template</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {sampleTemplates.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            onSelect={() => handleSelectTemplate(template.id)}
          />
        ))}
      </div>
    </div>
  );
}
