"use client";

import { useState } from "react";
import TemplateCard from "@/components/builder/TemplateCard";
import { sampleTemplates } from "@/config/templates";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useResumeStore } from "@/store/resumeStore";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function TemplateSelectionPage() {
  const router = useRouter();
  const { user } = useUser();
  const { createNewResume } = useResumeStore();
  const [creatingId, setCreatingId] = useState<string | null>(null);

  const handleSelectTemplate = async (templateId: string) => {
    if (creatingId) return;
    setCreatingId(templateId);
    try {
      const newResume = await createNewResume(templateId, user?.id || "");
      router.push(`/builder/${newResume.id}`);
    } catch (error) {
      console.error("Failed to create resume from template:", error);
      toast.error("Failed to create resume. Please try again.");
      setCreatingId(null);
    }
  };

  return (
    <div className="container py-12">
      <h1 className="text-3xl font-bold mb-8">Choose a Template</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {sampleTemplates.map((template) => (
          <div key={template.id} className="relative">
            <TemplateCard
              template={template}
              onSelect={() => handleSelectTemplate(template.id)}
            />
            {creatingId === template.id && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/70 rounded-lg">
                <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
