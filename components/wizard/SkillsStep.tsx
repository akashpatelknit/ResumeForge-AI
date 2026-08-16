import { useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Skill } from "@/types/resume";
import StepShell from "./StepShell";

interface SkillsStepProps {
  skills: Skill[];
  onChange: (skills: Skill[]) => void;
}

function SkillCategoryCard({
  skill,
  onUpdate,
  onRemove,
}: {
  skill: Skill;
  onUpdate: (updates: Partial<Skill>) => void;
  onRemove: () => void;
}) {
  const [draft, setDraft] = useState("");

  const commitDraft = () => {
    const value = draft.trim();
    if (!value) return;
    onUpdate({ items: [...skill.items, value] });
    setDraft("");
  };

  const removeItem = (index: number) => {
    onUpdate({ items: skill.items.filter((_, i) => i !== index) });
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="mb-3 flex items-center gap-2">
        <Input
          value={skill.category}
          onChange={(e) => onUpdate({ category: e.target.value })}
          placeholder="Category (e.g. Frontend)"
          className="font-medium"
        />
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onRemove}
          className="shrink-0 text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {skill.items.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {skill.items.map((item, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 rounded-full bg-gradient-hero-soft px-3 py-1 text-xs font-medium text-purple-700"
            >
              {item}
              <button type="button" onClick={() => removeItem(i)} className="hover:text-purple-900">
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      <Input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            commitDraft();
          }
        }}
        onBlur={commitDraft}
        placeholder="Type a skill and hit Enter"
      />
    </div>
  );
}

export default function SkillsStep({ skills, onChange }: SkillsStepProps) {
  const addCategory = () => {
    onChange([...skills, { id: crypto.randomUUID(), category: "", items: [] }]);
  };

  const updateCategory = (id: string, updates: Partial<Skill>) => {
    onChange(skills.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const removeCategory = (id: string) => {
    onChange(skills.filter((s) => s.id !== id));
  };

  return (
    <StepShell title="What are you good at?" description="Group your skills however makes sense to you.">
      <div className="space-y-4">
        {skills.map((skill) => (
          <SkillCategoryCard
            key={skill.id}
            skill={skill}
            onUpdate={(updates) => updateCategory(skill.id, updates)}
            onRemove={() => removeCategory(skill.id)}
          />
        ))}

        <Button variant="outline" onClick={addCategory} className="w-full gap-2">
          <Plus className="h-4 w-4" />
          Add skill category
        </Button>
      </div>
    </StepShell>
  );
}
