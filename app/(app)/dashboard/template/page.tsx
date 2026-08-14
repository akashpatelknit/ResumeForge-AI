"use client";

import React, { useState, useMemo } from "react";
import TemplateFilters from "@/components/dashboard/TemplateFilters";
import TemplateGrid from "@/components/dashboard/TemplateGrid";
import TemplatePreviewModal from "@/components/dashboard/TemplatePreviewModal";
import { Search } from "lucide-react";
import { Template } from "@/types/template";
import { sampleTemplates } from "@/config/templates";

export default function TemplatesPage() {
  const [templates] = useState<Template[]>(sampleTemplates);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null,
  );

 

  const [compareTemplates, setCompareTemplates] = useState<string[]>([]);

  // ✅ Correct filtering
  const filteredTemplates = useMemo(() => {
    return templates.filter((template) => {
      let matchesCategory = true;

      if (selectedCategory === "premium") {
        matchesCategory = template.isPremium;
      } else if (selectedCategory !== "all") {
        matchesCategory = template.category === selectedCategory;
      }

      const matchesSearch =
        !searchQuery ||
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [templates, selectedCategory, searchQuery]);

  // compare toggle
  const toggleCompare = (templateId: string) => {
    setCompareTemplates((prev) => {
      if (prev.includes(templateId)) {
        return prev.filter((id) => id !== templateId);
      }
      if (prev.length < 3) {
        return [...prev, templateId];
      }
      return prev;
    });
  };

  const getCategoryCount = (category: string) => {
    if (category === "all") return templates.length;
    if (category === "premium")
      return templates.filter((t) => t.isPremium).length;

    return templates.filter((t) => t.category === category).length;
  };

  return (
    <div className="bg-gray-50">
      <main className="mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Resume Templates
            </h1>
            <p className="text-sm text-gray-500">
              Pick a layout to start your resume — more are on the way.
            </p>
          </div>

          {/* Search */}
          <div className="relative w-full md:w-80 shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-purple-100 focus:border-purple-400 outline-none transition-all"
            />
          </div>
        </div>

        {/* Template Grid */}
        <TemplateGrid
          templates={filteredTemplates}
          onPreview={setSelectedTemplate}
          compareTemplates={compareTemplates}
          onToggleCompare={toggleCompare}
        />

        {/* Empty State */}
        {filteredTemplates.length === 0 && (
          <div className="text-center py-16 text-gray-600">
            No templates match your search.
          </div>
        )}
      </main>

      {/* Preview Modal */}
      {selectedTemplate && (
        <TemplatePreviewModal
          template={selectedTemplate}
          onClose={() => setSelectedTemplate(null)}
          onNext={() => {
            const currentIndex = filteredTemplates.findIndex(
              (t) => t.id === selectedTemplate.id,
            );

            const next =
              filteredTemplates[(currentIndex + 1) % filteredTemplates.length];

            setSelectedTemplate(next);
          }}
          onPrevious={() => {
            const currentIndex = filteredTemplates.findIndex(
              (t) => t.id === selectedTemplate.id,
            );

            const prev =
              filteredTemplates[
                currentIndex === 0
                  ? filteredTemplates.length - 1
                  : currentIndex - 1
              ];

            setSelectedTemplate(prev);
          }}
        />
      )}
    </div>
  );
}
