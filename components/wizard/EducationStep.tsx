import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Education } from "@/types/resume";
import StepShell from "./StepShell";

interface EducationStepProps {
  education: Education[];
  onChange: (education: Education[]) => void;
}

export default function EducationStep({ education, onChange }: EducationStepProps) {
  const addEducation = () => {
    onChange([
      ...education,
      {
        id: crypto.randomUUID(),
        institution: "",
        degree: "",
        field: "",
        location: "",
        startDate: "",
        endDate: "",
      },
    ]);
  };

  const updateEducation = (id: string, updates: Partial<Education>) => {
    onChange(education.map((edu) => (edu.id === id ? { ...edu, ...updates } : edu)));
  };

  const removeEducation = (id: string) => {
    onChange(education.filter((edu) => edu.id !== id));
  };

  return (
    <StepShell title="Your education" description="Degrees, bootcamps, certifications — whatever applies.">
      <div className="space-y-4">
        {education.map((edu, index) => (
          <div key={edu.id} className="rounded-2xl border border-border bg-card p-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-muted-foreground">
                Education {index + 1}
              </span>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => removeEducation(edu.id)}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Input
                value={edu.institution}
                onChange={(e) => updateEducation(edu.id, { institution: e.target.value })}
                placeholder="Institution"
              />
              <Input
                value={edu.degree}
                onChange={(e) => updateEducation(edu.id, { degree: e.target.value })}
                placeholder="Degree (e.g. B.S.)"
              />
              <Input
                value={edu.field}
                onChange={(e) => updateEducation(edu.id, { field: e.target.value })}
                placeholder="Field of study"
              />
              <Input
                value={edu.location}
                onChange={(e) => updateEducation(edu.id, { location: e.target.value })}
                placeholder="Location"
              />
              <Input
                type="month"
                value={edu.startDate}
                onChange={(e) => updateEducation(edu.id, { startDate: e.target.value })}
              />
              <Input
                type="month"
                value={edu.endDate}
                onChange={(e) => updateEducation(edu.id, { endDate: e.target.value })}
              />
            </div>
          </div>
        ))}

        <Button variant="outline" onClick={addEducation} className="w-full gap-2">
          <Plus className="h-4 w-4" />
          Add education
        </Button>
      </div>
    </StepShell>
  );
}
