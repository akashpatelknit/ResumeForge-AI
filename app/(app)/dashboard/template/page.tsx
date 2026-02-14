"use client";

import React, { useState } from "react";
import Sidebar from "@/components/shared/Sidebar";
import DashboardHeader from "@/components/shared/DashboardHeader";
import TemplateFilters from "@/components/dashboard/TemplateFilters";
import TemplateGrid from "@/components/dashboard/TemplateGrid";
import TemplatePreviewModal from "@/components/dashboard/TemplatePreviewModal";
import TemplateComparison from "@/components/dashboard/TemplateComparison";
import FeaturedTemplates from "@/components/dashboard/FeaturedTemplates";
import { Search } from "lucide-react";
import { Template } from "@/types/template";
import { sampleTemplates } from "@/config/templates";

export default function TemplatesPage() {
  const [templates] = useState<Template[]>(sampleTemplates);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null,
  );
  const [compareTemplates, setCompareTemplates] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState(false);

  // Filter templates
  const filteredTemplates = templates.filter((template) => {
    const matchesCategory =
      selectedCategory === "all" || selectedCategory === "premium"
        ? template.isPremium
        : template.category === selectedCategory;
    const matchesSearch =
      searchQuery === "" ||
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

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
    <div className="flex h-screen overflow-hidden bg-linear-to-br from-slate-50 via-blue-50/30 to-purple-50/20">
      <Sidebar />

      <div className="flex-1 flex flex-col lg:ml-64 overflow-hidden">
        <DashboardHeader />

        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-1">
                Resume Templates
              </h1>
            </div>

            {/* Search & Category Tabs */}
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              {/* Search */}
              <div className="relative w-full lg:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>

            {/* Category Tabs */}
            <TemplateFilters
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              getCategoryCount={getCategoryCount}
            />
          </div>

          {/* Featured Templates Carousel */}
          <div className="mb-8">
            <FeaturedTemplates
              templates={templates.filter((t) => t.rating >= 4.8).slice(0, 5)}
              onPreview={setSelectedTemplate}
            />
          </div>

          {/* Template Grid */}
          <TemplateGrid
            templates={filteredTemplates}
            onPreview={setSelectedTemplate}
            compareTemplates={compareTemplates}
            onToggleCompare={toggleCompare}
          />

          {/* No Results */}
          {filteredTemplates.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">
                No templates match your search
              </p>
            </div>
          )}
        </main>

        {/* Compare Bar */}
        {compareTemplates.length > 0 && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-slideUp">
            <div className="bg-white rounded-xl shadow-2xl border border-gray-200 px-6 py-4 flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700">
                {compareTemplates.length}{" "}
                {compareTemplates.length === 1 ? "template" : "templates"}{" "}
                selected
              </span>
              <button
                onClick={() => setShowComparison(true)}
                className="px-4 py-2 bg-linear-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
                disabled={compareTemplates.length < 2}
              >
                Compare Templates
              </button>
              <button
                onClick={() => setCompareTemplates([])}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {selectedTemplate && (
        <TemplatePreviewModal
          template={selectedTemplate}
          onClose={() => setSelectedTemplate(null)}
          onNext={() => {
            const currentIndex = templates.findIndex(
              (t) => t.id === selectedTemplate.id,
            );
            const nextIndex = (currentIndex + 1) % templates.length;
            setSelectedTemplate(templates[nextIndex]);
          }}
          onPrevious={() => {
            const currentIndex = templates.findIndex(
              (t) => t.id === selectedTemplate.id,
            );
            const prevIndex =
              currentIndex === 0 ? templates.length - 1 : currentIndex - 1;
            setSelectedTemplate(templates[prevIndex]);
          }}
        />
      )}

      {/* Comparison Modal */}
      {showComparison && (
        <TemplateComparison
          templates={templates.filter((t) => compareTemplates.includes(t.id))}
          onClose={() => setShowComparison(false)}
        />
      )}
    </div>
  );
}
