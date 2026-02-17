"use client";

import React, { useState } from "react";

import { Button } from "@/components/ui/button";
import { Plus, Grid3x3, List } from "lucide-react";
import ResumeFilters from "@/components/dashboard/ResumeFilters";
import EmptyResumeState from "@/components/dashboard/EmptyResumeState";
import ResumeGridView from "@/components/dashboard/ResumeGridView";
import ResumeListView from "@/components/dashboard/ResumeList";
import BulkActionsBar from "@/components/dashboard/BulkActionsBar";
import { Resume } from "@/types/resume";

const sampleResumes: Resume[] = [
  {
    id: "1",
    userId: "user_1",
    title: "Full Stack Developer - Google",
    templateId: "modern",

    personalInfo: {
      fullName: "John Doe",
      email: "john@example.com",
      phone: "123-456-7890",
      location: "San Francisco, CA",
    },

    summary: "",
    experience: [],
    education: [],
    skills: [],
    projects: [],
    achievements: [],
    certifications: [],
    languages: [],
    isFavorite: true,
    atsScore: 92,
    thumbnail: "/placeholder.svg",

    createdAt: new Date(),
    updatedAt: new Date(),
  },

  {
    id: "2",
    userId: "user_1",
    title: "Senior Frontend Engineer",
    templateId: "professional",

    personalInfo: {
      fullName: "Jane Smith",
      email: "jane@example.com",
      phone: "123-456-7890",
      location: "New York, NY",
    },

    summary: "",
    experience: [],
    education: [],
    skills: [],
    projects: [],
    achievements: [],
    certifications: [],
    languages: [],
    isFavorite: false,
    atsScore: 85,
    thumbnail: "/placeholder.svg",

    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export default function ResumesPage() {
  const [resumes, setResumes] = useState<Resume[]>(sampleResumes);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedResumes, setSelectedResumes] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [sortBy, setSortBy] = useState("lastModified");

  // Filter and sort resumes
  const filteredResumes = resumes
    .filter((resume) => {
      // Search filter
      if (
        searchQuery &&
        !resume.title.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

      // Category filter
      if (filterCategory === "favorites" && !resume.isFavorite) return false;
      if (filterCategory === "recent") {
        const recentTerms = ["hour", "hours", "today", "yesterday"];
        if (
          !recentTerms.some((term) =>
            resume.updatedAt.toISOString().toLowerCase().includes(term),
          )
        ) {
          return false;
        }
      }

      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.title.localeCompare(b.title);
        case "atsScore":
          return (b.atsScore ?? 0) - (a.atsScore ?? 0);
        default:
          return 0;
      }
    });

  const toggleFavorite = (id: string) => {
    setResumes(
      resumes.map((r) =>
        r.id === id ? { ...r, isFavorite: !r.isFavorite } : r,
      ),
    );
  };

  const toggleSelect = (id: string) => {
    setSelectedResumes((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const handleBulkAction = (action: string) => {
    console.log(`Bulk action: ${action} on`, selectedResumes);
    // Implement bulk actions here
    setSelectedResumes([]);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-linear-to-br from-slate-50 via-blue-50/30 to-purple-50/20">
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">
                  My Resumes
                </h1>
              </div>

              <Button className="bg-linear-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-200">
                <Plus className="w-4 h-4 mr-2" />
                Create New Resume
              </Button>
            </div>

            {/* Filters & View Toggle */}
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              <ResumeFilters
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                filterCategory={filterCategory}
                setFilterCategory={setFilterCategory}
                sortBy={sortBy}
                setSortBy={setSortBy}
              />

              {/* View Mode Toggle */}
              <div className="flex items-center gap-2 bg-white rounded-lg p-1 shadow-sm border border-gray-200">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded transition-colors ${
                    viewMode === "grid"
                      ? "bg-purple-100 text-purple-600"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <Grid3x3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded transition-colors ${
                    viewMode === "list"
                      ? "bg-purple-100 text-purple-600"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          {filteredResumes.length === 0 && resumes.length === 0 ? (
            <EmptyResumeState />
          ) : filteredResumes.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">
                No resumes match your filters
              </p>
              <Button
                onClick={() => {
                  setSearchQuery("");
                  setFilterCategory("all");
                }}
                variant="outline"
                className="mt-4"
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <>
              {viewMode === "grid" ? (
                <ResumeGridView
                  resumes={filteredResumes}
                  selectedResumes={selectedResumes}
                  onToggleSelect={toggleSelect}
                  onToggleFavorite={toggleFavorite}
                />
              ) : (
                <ResumeListView
                  resumes={filteredResumes}
                  selectedResumes={selectedResumes}
                  onToggleSelect={toggleSelect}
                  onToggleFavorite={toggleFavorite}
                />
              )}
            </>
          )}

          {/* Bulk Actions Bar */}
          {selectedResumes.length > 0 && (
            <BulkActionsBar
              selectedCount={selectedResumes.length}
              onAction={handleBulkAction}
              onCancel={() => setSelectedResumes([])}
            />
          )}
        </main>
      </div>
    </div>
  );
}
