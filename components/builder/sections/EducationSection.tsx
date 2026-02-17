"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useResumeStore } from "@/store/resumeStore";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { Education } from "@/types/resume";

export default function EducationSection() {
  const { currentResume, addEducation, updateEducation, deleteEducation } =
    useResumeStore();
  const [newAchievement, setNewAchievement] = useState<{
    [key: string]: string;
  }>({});

  if (!currentResume) return null;

  const handleAddEducation = () => {
    const newEdu: Education = {
      id: crypto.randomUUID(),
      institution: "",
      degree: "",
      field: "",
      location: "",
      startDate: "",
      endDate: "",
      gpa: "",
      achievements: [],
    };
    addEducation(newEdu);
  };

  const handleAddAchievement = (eduId: string) => {
    const achievement = newAchievement[eduId]?.trim();
    if (!achievement) return;

    const education = currentResume.education.find((edu) => edu.id === eduId);
    if (education) {
      updateEducation(eduId, {
        achievements: [...(education.achievements || []), achievement],
      });
      setNewAchievement({ ...newAchievement, [eduId]: "" });
    }
  };

  const handleDeleteAchievement = (eduId: string, index: number) => {
    const education = currentResume.education.find((edu) => edu.id === eduId);
    if (education && education.achievements) {
      const updatedAchievements = education.achievements.filter(
        (_, i) => i !== index,
      );
      updateEducation(eduId, { achievements: updatedAchievements });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Education</h3>
        <Button onClick={handleAddEducation} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Education
        </Button>
      </div>

      {currentResume.education.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed rounded-lg">
          <p className="text-gray-500 mb-2">No education added yet</p>
          <Button onClick={handleAddEducation} variant="outline" size="sm">
            Add Your First Education
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {currentResume.education.map((edu, index) => (
            <div
              key={edu.id}
              className="p-6 border rounded-lg space-y-4 bg-white shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <GripVertical className="w-5 h-5 text-gray-400" />
                  <h4 className="font-medium">Education {index + 1}</h4>
                </div>
                <Button
                  onClick={() => deleteEducation(edu.id)}
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor={`institution-${edu.id}`}>Institution *</Label>
                  <Input
                    id={`institution-${edu.id}`}
                    value={edu.institution}
                    onChange={(e) =>
                      updateEducation(edu.id, { institution: e.target.value })
                    }
                    placeholder="Stanford University"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor={`degree-${edu.id}`}>Degree *</Label>
                  <Input
                    id={`degree-${edu.id}`}
                    value={edu.degree}
                    onChange={(e) =>
                      updateEducation(edu.id, { degree: e.target.value })
                    }
                    placeholder="Bachelor of Science"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor={`field-${edu.id}`}>Field of Study *</Label>
                  <Input
                    id={`field-${edu.id}`}
                    value={edu.field}
                    onChange={(e) =>
                      updateEducation(edu.id, { field: e.target.value })
                    }
                    placeholder="Computer Science"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor={`location-${edu.id}`}>Location *</Label>
                  <Input
                    id={`location-${edu.id}`}
                    value={edu.location}
                    onChange={(e) =>
                      updateEducation(edu.id, { location: e.target.value })
                    }
                    placeholder="Stanford, CA"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label htmlFor={`startDate-${edu.id}`}>Start Date *</Label>
                    <Input
                      id={`startDate-${edu.id}`}
                      type="month"
                      value={edu.startDate}
                      onChange={(e) =>
                        updateEducation(edu.id, { startDate: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor={`endDate-${edu.id}`}>
                      End Date *
                    </Label>
                    <Input
                      id={`endDate-${edu.id}`}
                      type="month"
                      value={edu.endDate}
                      onChange={(e) =>
                        updateEducation(edu.id, { endDate: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor={`gpa-${edu.id}`}>GPA (Optional)</Label>
                  <Input
                    id={`gpa-${edu.id}`}
                    value={edu.gpa || ""}
                    onChange={(e) =>
                      updateEducation(edu.id, { gpa: e.target.value })
                    }
                    placeholder="3.8/4.0"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label>Achievements & Honors</Label>
                <div className="space-y-2 mt-2">
                  {edu.achievements?.map((achievement, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2 p-2 bg-gray-50 rounded"
                    >
                      <span className="text-sm flex-1">• {achievement}</span>
                      <Button
                        onClick={() => handleDeleteAchievement(edu.id, idx)}
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
                    value={newAchievement[edu.id] || ""}
                    onChange={(e) =>
                      setNewAchievement({
                        ...newAchievement,
                        [edu.id]: e.target.value,
                      })
                    }
                    placeholder="Add an achievement or honor..."
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddAchievement(edu.id);
                      }
                    }}
                  />
                  <Button
                    onClick={() => handleAddAchievement(edu.id)}
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
