"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useResumeStore } from "@/store/resumeStore";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { CustomSectionItem } from "@/types/resume";
import GenerateWithAI from "@/components/builder/ai/GenerateWithAI";
import type { GeneratedCustomSectionEntry } from "@/lib/ai/generateCustomSection";

// Lets a user add sections beyond the fixed set (Experience, Projects,
// Education, etc.) — e.g. Publications, Volunteer Work, Awards. Each item
// reuses the same heading/subheading/description/bullets shape so it
// renders consistently in the PDF template (and the LaTeX generator)
// without needing bespoke layout per section name.
export default function CustomSectionsSection() {
  const {
    currentResume,
    addCustomSection,
    updateCustomSectionTitle,
    deleteCustomSection,
    addCustomSectionItem,
    updateCustomSectionItem,
    deleteCustomSectionItem,
  } = useResumeStore();
  const [newBullet, setNewBullet] = useState<{ [key: string]: string }>({});

  if (!currentResume) return null;

  const handleAddSection = () => addCustomSection("New Section");

  const handleAddItem = (sectionId: string) => {
    const newItem: CustomSectionItem = {
      id: crypto.randomUUID(),
      heading: "",
      subheading: "",
      description: "",
      bullets: [],
    };
    addCustomSectionItem(sectionId, newItem);
  };

  const bulletKey = (sectionId: string, itemId: string) => `${sectionId}:${itemId}`;

  const handleAddBullet = (sectionId: string, item: CustomSectionItem) => {
    const key = bulletKey(sectionId, item.id);
    const bullet = newBullet[key]?.trim();
    if (!bullet) return;

    updateCustomSectionItem(sectionId, item.id, {
      bullets: [...(item.bullets || []), bullet],
    });
    setNewBullet({ ...newBullet, [key]: "" });
  };

  const handleDeleteBullet = (
    sectionId: string,
    item: CustomSectionItem,
    index: number,
  ) => {
    updateCustomSectionItem(sectionId, item.id, {
      bullets: item.bullets.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Custom Sections</h3>
        <Button onClick={handleAddSection} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Section
        </Button>
      </div>

      {currentResume.customSections.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed rounded-lg">
          <p className="text-gray-500 mb-2">
            No custom sections yet — add Publications, Volunteer Work, Awards,
            or anything else not covered above
          </p>
          <Button onClick={handleAddSection} variant="outline" size="sm">
            Add Your First Section
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {currentResume.customSections.map((section) => (
            <div
              key={section.id}
              className="p-6 border rounded-lg space-y-4 bg-white shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 flex-1">
                  <GripVertical className="w-5 h-5 text-gray-400 shrink-0" />
                  <Input
                    value={section.title}
                    onChange={(e) =>
                      updateCustomSectionTitle(section.id, e.target.value)
                    }
                    placeholder="Section Title (e.g. Publications)"
                    className="font-medium"
                  />
                </div>
                <GenerateWithAI<GeneratedCustomSectionEntry>
                  endpoint="/api/ai/generate-custom-section"
                  title="Generate Section Entry"
                  description={
                    section.items.length > 0
                      ? "Paste raw notes to add a new entry — or leave blank to rewrite your most recent entry"
                      : "Paste raw notes and I'll structure them into a heading, subheading, and bullet points"
                  }
                  placeholder="e.g. paste details about a publication, award, volunteer role..."
                  buildBody={(rawInput) => {
                    const lastItem = section.items[section.items.length - 1];
                    return {
                      rawInput,
                      sectionTitle: section.title,
                      existingEntry: lastItem
                        ? {
                            heading: lastItem.heading,
                            subheading: lastItem.subheading,
                            bullets: lastItem.bullets,
                          }
                        : undefined,
                    };
                  }}
                  parseResult={(json) => json as GeneratedCustomSectionEntry}
                  renderPreview={(entry) => (
                    <div className="space-y-1 rounded-md border bg-gray-50 p-3">
                      <p className="text-sm font-semibold text-gray-900">
                        {entry.heading}
                      </p>
                      {entry.subheading && (
                        <p className="text-xs italic text-gray-600">
                          {entry.subheading}
                        </p>
                      )}
                      {entry.bulletPoints.length > 0 && (
                        <ul className="mt-1 space-y-1">
                          {entry.bulletPoints.map((bullet, i) => (
                            <li key={i} className="text-sm text-gray-800">
                              • {bullet}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                  onUse={(entry, rawInput) => {
                    const lastItem = section.items[section.items.length - 1];
                    if (!rawInput.trim() && lastItem) {
                      // Blank input rewrote the most recent entry in
                      // place rather than proposing a new one.
                      updateCustomSectionItem(section.id, lastItem.id, {
                        heading: entry.heading,
                        subheading: entry.subheading,
                        bullets: entry.bulletPoints,
                      });
                      return;
                    }
                    addCustomSectionItem(section.id, {
                      id: crypto.randomUUID(),
                      heading: entry.heading,
                      subheading: entry.subheading,
                      description: "",
                      bullets: entry.bulletPoints,
                    });
                  }}
                  isInputValid={(rawInput) =>
                    !!rawInput.trim() || section.items.length > 0
                  }
                  emptyInputHint="Add some notes above — there's no existing entry to rewrite yet."
                  idleLabel={(rawInput) =>
                    rawInput.trim()
                      ? "Generate"
                      : "Rewrite most recent entry"
                  }
                />
                <Button
                  onClick={() => deleteCustomSection(section.id)}
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-4 pl-7">
                {section.items.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 border rounded-md space-y-3 bg-gray-50"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1">
                        <div className="space-y-1">
                          <Label htmlFor={`heading-${item.id}`}>Heading</Label>
                          <Input
                            id={`heading-${item.id}`}
                            value={item.heading || ""}
                            onChange={(e) =>
                              updateCustomSectionItem(section.id, item.id, {
                                heading: e.target.value,
                              })
                            }
                            placeholder="e.g. Paper title, award name"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor={`subheading-${item.id}`}>
                            Subheading (Optional)
                          </Label>
                          <Input
                            id={`subheading-${item.id}`}
                            value={item.subheading || ""}
                            onChange={(e) =>
                              updateCustomSectionItem(section.id, item.id, {
                                subheading: e.target.value,
                              })
                            }
                            placeholder="e.g. Venue, date, issuer"
                          />
                        </div>
                      </div>
                      <Button
                        onClick={() =>
                          deleteCustomSectionItem(section.id, item.id)
                        }
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-gray-400 hover:text-red-600 shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor={`description-${item.id}`}>
                        Description (Optional)
                      </Label>
                      <Textarea
                        id={`description-${item.id}`}
                        value={item.description || ""}
                        onChange={(e) =>
                          updateCustomSectionItem(section.id, item.id, {
                            description: e.target.value,
                          })
                        }
                        placeholder="Brief description..."
                        rows={2}
                        className="resize-none"
                      />
                    </div>

                    <div>
                      <Label>Bullet Points (Optional)</Label>
                      <div className="space-y-2 mt-2">
                        {(item.bullets || []).map((bullet, idx) => (
                          <div
                            key={idx}
                            className="flex items-start gap-2 p-2 bg-white rounded"
                          >
                            <span className="text-sm flex-1">• {bullet}</span>
                            <Button
                              onClick={() =>
                                handleDeleteBullet(section.id, item, idx)
                              }
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
                          value={newBullet[bulletKey(section.id, item.id)] || ""}
                          onChange={(e) =>
                            setNewBullet({
                              ...newBullet,
                              [bulletKey(section.id, item.id)]: e.target.value,
                            })
                          }
                          placeholder="Add a bullet point..."
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddBullet(section.id, item);
                            }
                          }}
                        />
                        <Button
                          onClick={() => handleAddBullet(section.id, item)}
                          size="sm"
                          variant="outline"
                        >
                          Add
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}

                <Button
                  onClick={() => handleAddItem(section.id)}
                  variant="outline"
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Entry
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
