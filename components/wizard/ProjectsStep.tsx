import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import type { Project } from "@/types/resume";
import StepShell from "./StepShell";

interface ProjectsStepProps {
  projects: Project[];
  onChange: (projects: Project[]) => void;
}

export default function ProjectsStep({ projects, onChange }: ProjectsStepProps) {
  const addProject = () => {
    onChange([
      ...projects,
      {
        id: crypto.randomUUID(),
        name: "",
        description: "",
        technologies: [],
        highlights: [],
      },
    ]);
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    onChange(projects.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  };

  const removeProject = (id: string) => {
    onChange(projects.filter((p) => p.id !== id));
  };

  return (
    <StepShell
      title="Any projects worth showing?"
      description="Personal, freelance, or open source — optional, but it helps you stand out."
    >
      <div className="space-y-4">
        {projects.map((project, index) => (
          <div key={project.id} className="rounded-2xl border border-border bg-card p-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-muted-foreground">
                Project {index + 1}
              </span>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => removeProject(project.id)}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Input
                value={project.name}
                onChange={(e) => updateProject(project.id, { name: e.target.value })}
                placeholder="Project name"
              />
              <Input
                value={project.technologies.join(", ")}
                onChange={(e) =>
                  updateProject(project.id, {
                    technologies: e.target.value
                      .split(",")
                      .map((t) => t.trim())
                      .filter(Boolean),
                  })
                }
                placeholder="Tech used (comma-separated)"
              />
            </div>
            <Textarea
              className="mt-3 resize-none"
              rows={3}
              value={project.description}
              onChange={(e) => updateProject(project.id, { description: e.target.value })}
              placeholder="What is it, and what did you build?"
            />
          </div>
        ))}

        <Button variant="outline" onClick={addProject} className="w-full gap-2">
          <Plus className="h-4 w-4" />
          Add project
        </Button>
      </div>
    </StepShell>
  );
}
