"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useResumeStore } from "@/store/resumeStore";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { Experience } from "@/types/resume";

export default function ExperienceSection() {
  const { currentResume, addExperience, updateExperience, deleteExperience } =
    useResumeStore();
  const [newAchievement, setNewAchievement] = useState<{
    [key: string]: string;
  }>({});

  if (!currentResume) return null;

  const handleAddExperience = () => {
    const newExp: Experience = {
      id: crypto.randomUUID(),
      company: "",
      position: "",
      location: "",
      startDate: "",
      endDate: null,
      description: "",
      achievements: [],
    };
    addExperience(newExp);
  };

  const handleAddAchievement = (expId: string) => {
    const achievement = newAchievement[expId]?.trim();
    if (!achievement) return;

    const experience = currentResume.experience.find((exp) => exp.id === expId);
    if (experience) {
      updateExperience(expId, {
        achievements: [...experience.achievements, achievement],
      });
      setNewAchievement({ ...newAchievement, [expId]: "" });
    }
  };

  const handleDeleteAchievement = (expId: string, index: number) => {
    const experience = currentResume.experience.find((exp) => exp.id === expId);
    if (experience) {
      const updatedAchievements = experience.achievements.filter(
        (_, i) => i !== index,
      );
      updateExperience(expId, { achievements: updatedAchievements });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Work Experience</h3>
        <Button onClick={handleAddExperience} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Experience
        </Button>
      </div>

      {currentResume.experience.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed rounded-lg">
          <p className="text-gray-500 mb-2">No experience added yet</p>
          <Button onClick={handleAddExperience} variant="outline" size="sm">
            Add Your First Experience
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {currentResume.experience.map((exp, index) => (
            <div
              key={exp.id}
              className="p-6 border rounded-lg space-y-4 bg-white shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <GripVertical className="w-5 h-5 text-gray-400" />
                  <h4 className="font-medium">Experience {index + 1}</h4>
                </div>
                <Button
                  onClick={() => deleteExperience(exp.id)}
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor={`company-${exp.id}`}>Company *</Label>
                  <Input
                    id={`company-${exp.id}`}
                    value={exp.company}
                    onChange={(e) =>
                      updateExperience(exp.id, { company: e.target.value })
                    }
                    placeholder="Acme Corp"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor={`position-${exp.id}`}>Position *</Label>
                  <Input
                    id={`position-${exp.id}`}
                    value={exp.position}
                    onChange={(e) =>
                      updateExperience(exp.id, { position: e.target.value })
                    }
                    placeholder="Senior Software Engineer"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor={`location-${exp.id}`}>Location *</Label>
                  <Input
                    id={`location-${exp.id}`}
                    value={exp.location}
                    onChange={(e) =>
                      updateExperience(exp.id, { location: e.target.value })
                    }
                    placeholder="New York, NY"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label htmlFor={`startDate-${exp.id}`}>Start Date *</Label>
                    <Input
                      id={`startDate-${exp.id}`}
                      type="month"
                      value={exp.startDate}
                      onChange={(e) =>
                        updateExperience(exp.id, { startDate: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor={`endDate-${exp.id}`}>End Date</Label>
                    <Input
                      id={`endDate-${exp.id}`}
                      type="month"
                      value={exp.endDate || ""}
                      onChange={(e) =>
                        updateExperience(exp.id, {
                          endDate: e.target.value || null,
                        })
                      }
                      placeholder="Present"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor={`description-${exp.id}`}>Description</Label>
                <Textarea
                  id={`description-${exp.id}`}
                  value={exp.description}
                  onChange={(e) =>
                    updateExperience(exp.id, { description: e.target.value })
                  }
                  placeholder="Brief description of your role..."
                  rows={3}
                  className="resize-none"
                />
              </div>

              <div className="space-y-1">
                <Label>Key Achievements</Label>
                <div className="space-y-2 mt-2">
                  {Array.isArray(exp.achievements) &&
                    exp.achievements.map((achievement, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2 p-2 bg-gray-50 rounded"
                      >
                        <span className="text-sm flex-1">• {achievement}</span>
                        <Button
                          onClick={() => handleDeleteAchievement(exp.id, idx)}
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
                    value={newAchievement[exp.id] || ""}
                    onChange={(e) =>
                      setNewAchievement({
                        ...newAchievement,
                        [exp.id]: e.target.value,
                      })
                    }
                    placeholder="Add an achievement..."
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddAchievement(exp.id);
                      }
                    }}
                  />
                  <Button
                    onClick={() => handleAddAchievement(exp.id)}
                    size="sm"
                    variant="outline"
                  >
                    Add
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
