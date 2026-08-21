// TemplateCard.tsx
import { Template } from "@/types/template";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import TemplateThumbnail from "@/components/dashboard/TemplateThumbnail";
import PdfCanvasThumbnail from "@/components/pdf/PdfCanvasThumbnail";
import { buildSampleAppResume } from "@/lib/pdf/sampleAppResume";

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
      <div className="aspect-[3/4] w-full max-w-50 mb-4 overflow-hidden rounded-md border border-gray-100">
        {template.comingSoon ? (
          <TemplateThumbnail className="opacity-60 saturate-0" />
        ) : (
          <PdfCanvasThumbnail resume={buildSampleAppResume(template.id)} />
        )}
      </div>
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
