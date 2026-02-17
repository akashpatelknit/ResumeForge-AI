"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useResumeStore } from "@/store/resumeStore";
import { Plus, Trash2, X } from "lucide-react";
import { Skill } from "@/types/resume";

export default function SkillsSection() {
  const { currentResume, addSkill, updateSkill, deleteSkill } =
    useResumeStore();
  const [newSkillItem, setNewSkillItem] = useState<{ [key: string]: string }>(
    {},
  );

  if (!currentResume) return null;

  const handleAddSkillCategory = () => {
    const newSkill: Skill = {
      id: crypto.randomUUID(),
      category: "",
      items: [],
    };
    addSkill(newSkill);
  };

  const handleAddSkillItem = (skillId: string) => {
    const item = newSkillItem[skillId]?.trim();
    if (!item) return;

    const skill = currentResume.skills.find((s) => s.id === skillId);
    if (skill) {
      updateSkill(skillId, {
        items: [...skill.items, item],
      });
      setNewSkillItem({ ...newSkillItem, [skillId]: "" });
    }
  };

  const handleDeleteSkillItem = (skillId: string, index: number) => {
    const skill = currentResume.skills.find((s) => s.id === skillId);
    if (skill) {
      const updatedItems = skill.items.filter((_, i) => i !== index);
      updateSkill(skillId, { items: updatedItems });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Skills</h3>
        <Button onClick={handleAddSkillCategory} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Category
        </Button>
      </div>

      {currentResume.skills.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed rounded-lg">
          <p className="text-gray-500 mb-2">No skill categories added yet</p>
          <Button onClick={handleAddSkillCategory} variant="outline" size="sm">
            Add Your First Skill Category
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {currentResume.skills.map((skill, index) => (
            <div
              key={skill.id}
              className="p-6 border rounded-lg space-y-4 bg-white shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 max-w-md">
                  <Label htmlFor={`category-${skill.id}`}>
                    Category {index + 1} *
                  </Label>
                  <Input
                    id={`category-${skill.id}`}
                    value={skill.category}
                    onChange={(e) =>
                      updateSkill(skill.id, { category: e.target.value })
                    }
                    placeholder="e.g., Frontend, Backend, Tools"
                    className="mt-1"
                  />
                </div>
                <Button
                  onClick={() => deleteSkill(skill.id)}
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <div>
                <Label>Skills in this category</Label>
                <div className="flex flex-wrap gap-2 mt-2 min-h-10 p-2 border rounded-md bg-gray-50">
                  {Array.isArray(skill.items) && skill.items.length === 0 ? (
                    <span className="text-sm text-gray-400">
                      No skills added yet
                    </span>
                  ) : (
                    Array.isArray(skill.items) &&
                    skill.items.map((item, idx) => (
                      <Badge
                        key={idx}
                        variant="secondary"
                        className="pl-3 pr-1 py-1 gap-1"
                      >
                        {item}
                        <Button
                          onClick={() => handleDeleteSkillItem(skill.id, idx)}
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
                    value={newSkillItem[skill.id] || ""}
                    onChange={(e) =>
                      setNewSkillItem({
                        ...newSkillItem,
                        [skill.id]: e.target.value,
                      })
                    }
                    placeholder="Add a skill..."
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddSkillItem(skill.id);
                      }
                    }}
                  />
                  <Button
                    onClick={() => handleAddSkillItem(skill.id)}
                    size="sm"
                    variant="outline"
                  >
                    Add
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Press Enter or click Add to add each skill
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
