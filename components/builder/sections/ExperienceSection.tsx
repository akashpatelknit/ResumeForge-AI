"use client";

import { useState } from "react";
import { Reorder, useDragControls } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { MonthYearPicker } from "@/components/ui/month-year-picker";
import { useResumeStore } from "@/store/resumeStore";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { Experience } from "@/types/resume";
import GenerateWithAI from "@/components/builder/ai/GenerateWithAI";

export default function ExperienceSection() {
  const {
    currentResume,
    addExperience,
    updateExperience,
    deleteExperience,
    reorderExperience,
  } = useResumeStore();
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
        <Reorder.Group
          as="div"
          axis="y"
          values={currentResume.experience}
          onReorder={reorderExperience}
          className="space-y-6"
        >
          {currentResume.experience.map((exp, index) => (
            <ExperienceEntry
              key={exp.id}
              exp={exp}
              index={index}
              updateExperience={updateExperience}
              deleteExperience={deleteExperience}
              newAchievementValue={newAchievement[exp.id] || ""}
              onNewAchievementChange={(value) =>
                setNewAchievement({ ...newAchievement, [exp.id]: value })
              }
              onAddAchievement={() => handleAddAchievement(exp.id)}
              onDeleteAchievement={(idx) => handleDeleteAchievement(exp.id, idx)}
            />
          ))}
        </Reorder.Group>
      )}
    </div>
  );
}

interface ExperienceEntryProps {
  exp: Experience;
  index: number;
  updateExperience: (id: string, updates: Partial<Experience>) => void;
  deleteExperience: (id: string) => void;
  newAchievementValue: string;
  onNewAchievementChange: (value: string) => void;
  onAddAchievement: () => void;
  onDeleteAchievement: (index: number) => void;
}

// Extracted so useDragControls (a hook) can be called per-entry — it can't
// live inside the .map() callback above since the number of entries
// changes across renders, which would break the Rules of Hooks.
function ExperienceEntry({
  exp,
  index,
  updateExperience,
  deleteExperience,
  newAchievementValue,
  onNewAchievementChange,
  onAddAchievement,
  onDeleteAchievement,
}: ExperienceEntryProps) {
  const dragControls = useDragControls();

  return (
    <Reorder.Item
      value={exp}
      as="div"
      dragListener={false}
      dragControls={dragControls}
      className="p-6 border rounded-lg space-y-4 bg-white shadow-sm"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <GripVertical
            className="w-5 h-5 cursor-grab touch-none text-gray-400 active:cursor-grabbing"
            onPointerDown={(e) => dragControls.start(e)}
          />
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

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <div className="space-y-1">
            <Label htmlFor={`startDate-${exp.id}`}>Start Date *</Label>
            <MonthYearPicker
              id={`startDate-${exp.id}`}
              value={exp.startDate}
              onChange={(value) => updateExperience(exp.id, { startDate: value })}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor={`endDate-${exp.id}`}>End Date</Label>
            <MonthYearPicker
              id={`endDate-${exp.id}`}
              value={exp.endDate}
              onChange={(value) => updateExperience(exp.id, { endDate: value })}
              onClear={() => updateExperience(exp.id, { endDate: null })}
              clearLabel="Present"
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
        <div className="flex items-center justify-between">
          <Label>Key Achievements</Label>
          <GenerateWithAI<string[]>
            endpoint="/api/ai/generate-achievements"
            title="Generate Key Achievements"
            description={
              exp.achievements?.length
                ? "Paste a rough description of what you did — or leave blank to rewrite your existing achievements"
                : "Paste a rough description of what you did at this role"
            }
            placeholder="e.g. built the payment system, worked with a team of 5, reduced checkout latency..."
            buildBody={(rawInput) => ({
              rawInput,
              existingAchievements: exp.achievements,
              role: exp.position,
              company: exp.company,
            })}
            parseResult={(json) =>
              (json as { achievements: string[] }).achievements
            }
            renderPreview={(achievements) => (
              <ul className="space-y-1 rounded-md border bg-gray-50 p-3">
                {achievements.map((achievement, i) => (
                  <li key={i} className="text-sm text-gray-800">
                    • {achievement}
                  </li>
                ))}
              </ul>
            )}
            onUse={(achievements, rawInput) =>
              updateExperience(exp.id, {
                // Blank rawInput means the model rewrote the
                // existing bullets, not extracted new ones from
                // fresh input — replace rather than pile on
                // rephrased duplicates of what's already there.
                achievements: rawInput.trim()
                  ? [...(exp.achievements || []), ...achievements]
                  : achievements,
              })
            }
            isInputValid={(rawInput) =>
              !!rawInput.trim() || !!exp.achievements?.length
            }
            emptyInputHint="Add a description above — there are no existing achievements to rewrite yet."
            idleLabel={(rawInput) =>
              rawInput.trim() ? "Generate" : "Rewrite existing achievements"
            }
          />
        </div>
        <div className="space-y-2 mt-2">
          {Array.isArray(exp.achievements) &&
            exp.achievements.map((achievement, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2 p-2 bg-gray-50 rounded"
              >
                <span className="text-sm flex-1">• {achievement}</span>
                <Button
                  onClick={() => onDeleteAchievement(idx)}
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
            value={newAchievementValue}
            onChange={(e) => onNewAchievementChange(e.target.value)}
            placeholder="Add an achievement..."
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onAddAchievement();
              }
            }}
          />
          <Button onClick={onAddAchievement} size="sm" variant="outline">
            Add
          </Button>
        </div>
      </div>
    </Reorder.Item>
  );
}
