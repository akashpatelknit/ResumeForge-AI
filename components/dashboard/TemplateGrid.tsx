import { Template } from "@/types/template";
import React from "react";
import TemplateCard from "./Templatecard";

interface TemplateGridProps {
  templates: Template[];
  onPreview: (template: Template) => void;
  compareTemplates: string[];
  onToggleCompare: (templateId: string) => void;
}

export default function TemplateGrid({
  templates,
  onPreview,
  compareTemplates,
  onToggleCompare,
}: TemplateGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {templates.map((template, index) => (
        <div
          key={template.id}
          style={{ animationDelay: `${index * 50}ms` }}
          className="animate-slideUp"
        >
          <TemplateCard
            template={template}
            onPreview={onPreview}
            isInCompare={compareTemplates.includes(template.id)}
            onToggleCompare={onToggleCompare}
          />
        </div>
      ))}
    </div>
  );
}
