// TemplateCard.tsx
import { Template } from "@/types/template";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface TemplateCardProps {
  template: Template;
  onSelect: () => void;
}

export default function TemplateCard({
  template,
  onSelect,
}: TemplateCardProps) {
  return (
    <Card className="flex flex-col items-center justify-center p-6 bg-white shadow-xl rounded-lg">
      <img
        src={template.thumbnail}
        alt={template.name}
        className="w-full max-w-[200px] mb-4"
      />
      <h2 className="text-xl font-bold">{template.name}</h2>
      <p className="text-gray-600">{template.description}</p>
      <div className="mt-6 flex items-center justify-center">
        <Button
          onClick={onSelect}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg"
        >
          Select
        </Button>
      </div>
    </Card>
  );
}
