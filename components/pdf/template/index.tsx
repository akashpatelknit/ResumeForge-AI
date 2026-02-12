import ModernTemplate from "./ModernTemplate";
import ProfessionalTemplate from "./ProfessionalTemplate";
import MinimalTemplate from "./MinimalTemplate";

export const templateComponents = {
  modern: ModernTemplate,
  professional: ProfessionalTemplate,
  minimal: MinimalTemplate,
};

export function getTemplateComponent(templateId: string) {
  return (
    templateComponents[templateId as keyof typeof templateComponents] ||
    ModernTemplate
  );
}
