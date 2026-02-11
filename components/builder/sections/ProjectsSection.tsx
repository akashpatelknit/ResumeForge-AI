"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useResumeStore } from "@/store/resumeStore";
import { Plus, Trash2, GripVertical, X } from "lucide-react";
import { Project } from "@/types/resume";

export default function ProjectsSection() {
  const { currentResume, addProject, updateProject, deleteProject } =
    useResumeStore();
  const [newTechnology, setNewTechnology] = useState<{ [key: string]: string }>(
    {},
  );
  const [newHighlight, setNewHighlight] = useState<{ [key: string]: string }>(
    {},
  );

  if (!currentResume) return null;

  const handleAddProject = () => {
    const newProj: Project = {
      id: crypto.randomUUID(),
      name: "",
      description: "",
      technologies: [],
      link: "",
      github: "",
      highlights: [],
    };
    addProject(newProj);
  };

  const handleAddTechnology = (projectId: string) => {
    const tech = newTechnology[projectId]?.trim();
    if (!tech) return;

    const project = currentResume.projects.find((p) => p.id === projectId);
    if (project) {
      updateProject(projectId, {
        technologies: [...project.technologies, tech],
      });
      setNewTechnology({ ...newTechnology, [projectId]: "" });
    }
  };

  const handleDeleteTechnology = (projectId: string, index: number) => {
    const project = currentResume.projects.find((p) => p.id === projectId);
    if (project) {
      const updatedTech = project.technologies.filter((_, i) => i !== index);
      updateProject(projectId, { technologies: updatedTech });
    }
  };

  const handleAddHighlight = (projectId: string) => {
    const highlight = newHighlight[projectId]?.trim();
    if (!highlight) return;

    const project = currentResume.projects.find((p) => p.id === projectId);
    if (project) {
      updateProject(projectId, {
        highlights: [...project.highlights, highlight],
      });
      setNewHighlight({ ...newHighlight, [projectId]: "" });
    }
  };

  const handleDeleteHighlight = (projectId: string, index: number) => {
    const project = currentResume.projects.find((p) => p.id === projectId);
    if (project) {
      const updatedHighlights = project.highlights.filter(
        (_, i) => i !== index,
      );
      updateProject(projectId, { highlights: updatedHighlights });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Projects</h3>
        <Button onClick={handleAddProject} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Project
        </Button>
      </div>

      {currentResume.projects.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed rounded-lg">
          <p className="text-gray-500 mb-2">No projects added yet</p>
          <Button onClick={handleAddProject} variant="outline" size="sm">
            Add Your First Project
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {currentResume.projects.map((project, index) => (
            <div
              key={project.id}
              className="p-6 border rounded-lg space-y-4 bg-white shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <GripVertical className="w-5 h-5 text-gray-400" />
                  <h4 className="font-medium">Project {index + 1}</h4>
                </div>
                <Button
                  onClick={() => deleteProject(project.id)}
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor={`name-${project.id}`}>Project Name *</Label>
                  <Input
                    id={`name-${project.id}`}
                    value={project.name}
                    onChange={(e) =>
                      updateProject(project.id, { name: e.target.value })
                    }
                    placeholder="E-commerce Platform"
                  />
                </div>

                <div>
                  <Label htmlFor={`description-${project.id}`}>
                    Description *
                  </Label>
                  <Textarea
                    id={`description-${project.id}`}
                    value={project.description}
                    onChange={(e) =>
                      updateProject(project.id, { description: e.target.value })
                    }
                    placeholder="Brief overview of the project..."
                    rows={3}
                    className="resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`link-${project.id}`}>
                      Live Demo Link (Optional)
                    </Label>
                    <Input
                      id={`link-${project.id}`}
                      value={project.link || ""}
                      onChange={(e) =>
                        updateProject(project.id, { link: e.target.value })
                      }
                      placeholder="https://example.com"
                    />
                  </div>

                  <div>
                    <Label htmlFor={`github-${project.id}`}>
                      GitHub Link (Optional)
                    </Label>
                    <Input
                      id={`github-${project.id}`}
                      value={project.github || ""}
                      onChange={(e) =>
                        updateProject(project.id, { github: e.target.value })
                      }
                      placeholder="https://github.com/username/repo"
                    />
                  </div>
                </div>

                <div>
                  <Label>Technologies Used</Label>
                  <div className="flex flex-wrap gap-2 mt-2 min-h-[40px] p-2 border rounded-md bg-gray-50">
                    {project.technologies.length === 0 ? (
                      <span className="text-sm text-gray-400">
                        No technologies added yet
                      </span>
                    ) : (
                      project.technologies.map((tech, idx) => (
                        <Badge
                          key={idx}
                          variant="secondary"
                          className="pl-3 pr-1 py-1 gap-1"
                        >
                          {tech}
                          <Button
                            onClick={() =>
                              handleDeleteTechnology(project.id, idx)
                            }
                            variant="ghost"
                            size="sm"
                            className="h-4 w-4 p-0 hover:bg-transparent"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </Badge>
                      ))
                    )}
                  </div>

                  <div className="flex gap-2 mt-2">
                    <Input
                      value={newTechnology[project.id] || ""}
                      onChange={(e) =>
                        setNewTechnology({
                          ...newTechnology,
                          [project.id]: e.target.value,
                        })
                      }
                      placeholder="Add a technology..."
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddTechnology(project.id);
                        }
                      }}
                    />
                    <Button
                      onClick={() => handleAddTechnology(project.id)}
                      size="sm"
                      variant="outline"
                    >
                      Add
                    </Button>
                  </div>
                </div>

                <div>
                  <Label>Key Highlights</Label>
                  <div className="space-y-2 mt-2">
                    {project.highlights.map((highlight, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2 p-2 bg-gray-50 rounded"
                      >
                        <span className="text-sm flex-1">• {highlight}</span>
                        <Button
                          onClick={() => handleDeleteHighlight(project.id, idx)}
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2 mt-2">
                    <Input
                      value={newHighlight[project.id] || ""}
                      onChange={(e) =>
                        setNewHighlight({
                          ...newHighlight,
                          [project.id]: e.target.value,
                        })
                      }
                      placeholder="Add a highlight..."
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddHighlight(project.id);
                        }
                      }}
                    />
                    <Button
                      onClick={() => handleAddHighlight(project.id)}
                      size="sm"
                      variant="outline"
                    >
                      Add
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
