import ModernTemplate from "./ModernTemplate";
import ProfessionalTemplate from "./ProfessionalTemplate";
import MinimalTemplate from "./MinimalTemplate";
import { AppResume } from "@/types/resume";
import { ComponentType } from "react";

const templateRegistry: Record<string, ComponentType<{ resume: AppResume }>> = {
  modern: ModernTemplate,
  professional: ProfessionalTemplate,
  minimal: MinimalTemplate,
};

export function getTemplateComponent(templateId: string) {
  return (
    templateRegistry[templateId as keyof typeof templateRegistry] ||
    ModernTemplate
  );
}
