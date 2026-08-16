import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import type { Experience } from "@/types/resume";
import StepShell from "./StepShell";

interface ExperienceStepProps {
  experience: Experience[];
  onChange: (experience: Experience[]) => void;
}

export default function ExperienceStep({ experience, onChange }: ExperienceStepProps) {
  const addExperience = () => {
    onChange([
      ...experience,
      {
        id: crypto.randomUUID(),
        company: "",
        position: "",
        location: "",
        startDate: "",
        endDate: null,
        description: "",
        achievements: [],
      },
    ]);
  };

  const updateExperience = (id: string, updates: Partial<Experience>) => {
    onChange(experience.map((exp) => (exp.id === id ? { ...exp, ...updates } : exp)));
  };

  const removeExperience = (id: string) => {
    onChange(experience.filter((exp) => exp.id !== id));
  };

  return (
    <StepShell
      title="Where have you worked?"
      description="Add your roles, most recent first. Skip this if you're just starting out."
    >
      <div className="space-y-4">
        {experience.map((exp, index) => (
          <div key={exp.id} className="rounded-2xl border border-border bg-card p-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-muted-foreground">
                Role {index + 1}
              </span>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => removeExperience(exp.id)}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Input
                value={exp.position}
                onChange={(e) => updateExperience(exp.id, { position: e.target.value })}
                placeholder="Job title"
              />
              <Input
                value={exp.company}
                onChange={(e) => updateExperience(exp.id, { company: e.target.value })}
                placeholder="Company"
              />
              <Input
                value={exp.location}
                onChange={(e) => updateExperience(exp.id, { location: e.target.value })}
                placeholder="Location"
              />
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="month"
                  value={exp.startDate}
                  onChange={(e) => updateExperience(exp.id, { startDate: e.target.value })}
                />
                <Input
                  type="month"
                  value={exp.endDate || ""}
                  onChange={(e) =>
                    updateExperience(exp.id, { endDate: e.target.value || null })
                  }
                  placeholder="Present"
                />
              </div>
            </div>
            <Textarea
              className="mt-3 resize-none"
              rows={3}
              value={exp.description}
              onChange={(e) => updateExperience(exp.id, { description: e.target.value })}
              placeholder="What did you do in this role?"
            />
          </div>
        ))}

        <Button variant="outline" onClick={addExperience} className="w-full gap-2">
          <Plus className="h-4 w-4" />
          Add work experience
        </Button>
      </div>
    </StepShell>
  );
}
