"use client";

import React, { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import ResumeFilters from "@/components/dashboard/ResumeFilters";
import EmptyResumeState from "@/components/dashboard/EmptyResumeState";
import ResumeListView from "@/components/dashboard/ResumeList";
import BulkActionsBar from "@/components/dashboard/BulkActionsBar";
import { mapResumeFromDB } from "@/mapper/mapResumeFromDB";
import type { AppResume, ReadinessScoreDetails } from "@/types/resume";
import { useRouter } from "next/navigation";
import { useResumeStore } from "@/store/resumeStore";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { pdf } from "@react-pdf/renderer";
import { getTemplateComponent } from "@/components/pdf/template";
import { toResumeData } from "@/hooks/useResumeActions";

/* ============================================================================
 * Grid view — DISABLED HERE, NOT DELETED.
 *
 * Turned off at your request to keep only list view for now. ResumeCard.tsx
 * and ResumeGridView.tsx are untouched and still fully working (both now
 * take the same real AppResume data and the same onRefresh callback as the
 * list view below), so restoring this is just uncommenting the toggle UI
 * and the branch below.
 *
 * import { Grid3x3, List } from "lucide-react";
 * import ResumeGridView from "@/components/dashboard/ResumeGridView";
 *
 * const [viewMode, setViewMode] = useState<"grid" | "list">("list");
 *
 * // View Mode Toggle, next to "Create New Resume":
 * <div className="flex items-center gap-2 bg-white rounded-lg p-1 shadow-sm border border-gray-200">
 *   <button
 *     onClick={() => setViewMode("grid")}
 *     className={`p-2 rounded transition-colors ${
 *       viewMode === "grid" ? "bg-purple-100 text-purple-600" : "text-gray-600 hover:bg-gray-100"
 *     }`}
 *   >
 *     <Grid3x3 className="w-4 h-4" />
 *   </button>
 *   <button
 *     onClick={() => setViewMode("list")}
 *     className={`p-2 rounded transition-colors ${
 *       viewMode === "list" ? "bg-purple-100 text-purple-600" : "text-gray-600 hover:bg-gray-100"
 *     }`}
 *   >
 *     <List className="w-4 h-4" />
 *   </button>
 * </div>
 *
 * // Content, replacing the unconditional <ResumeListView ... /> below:
 * {viewMode === "grid" ? (
 *   <ResumeGridView
 *     resumes={filteredResumes}
 *     selectedResumes={selectedResumes}
 *     onToggleSelect={toggleSelect}
 *     onToggleFavorite={toggleFavorite}
 *     onRefresh={loadResumes}
 *   />
 * ) : (
 *   <ResumeListView ... />
 * )}
 * ========================================================================= */

export default function ResumesPage() {
  const [resumes, setResumes] = useState<AppResume[]>([]);
  const [isLoadingResumes, setIsLoadingResumes] = useState(true);
  const [selectedResumes, setSelectedResumes] = useState<string[]>([]);
  const [isBulkActing, setIsBulkActing] = useState(false);
  const [confirmBulkDeleteOpen, setConfirmBulkDeleteOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [sortBy, setSortBy] = useState("lastModified");
  const { createNewResume } = useResumeStore();
  const [isCreatingResume, setIsCreatingResume] = useState(false);
  const router = useRouter();
  const { user } = useUser();

  const loadResumes = useCallback(async () => {
    try {
      const res = await fetch("/api/resumes");
      const data = await res.json();

      if (!res.ok || !Array.isArray(data)) {
        throw new Error((data && data.error) || "Failed to load resumes");
      }

      setResumes(
        data.map((r: unknown) =>
          mapResumeFromDB(r as Parameters<typeof mapResumeFromDB>[0]),
        ),
      );
    } catch (error) {
      console.error("Failed to load resumes:", error);
      toast.error("Failed to load resumes. Please refresh the page.");
    } finally {
      setIsLoadingResumes(false);
    }
  }, []);

  useEffect(() => {
    loadResumes();
  }, [loadResumes]);

  // Filter and sort resumes
  const filteredResumes = resumes
    .filter((resume) => {
      if (
        searchQuery &&
        !resume.title.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

      if (filterCategory === "archived") return resume.isArchived;
      // Archived resumes are soft-hidden from every other filter, same as
      // a normal inbox/archive split.
      if (resume.isArchived) return false;

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

  // Same "update one resume's readiness score in place" pattern as
  // app/(app)/dashboard/page.tsx's handler — avoids a full refetch just to
  // reflect the N/A -> checked-value transition after a per-row check.
  const handleReadinessScoreChecked = useCallback((resumeId: string, result: ReadinessScoreDetails) => {
    setResumes((prev) =>
      prev.map((r) =>
        r.id === resumeId ? { ...r, readinessScore: result.score, readinessScoreDetails: result } : r,
      ),
    );
  }, []);

  const toggleSelect = (id: string) => {
    setSelectedResumes((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  // Sequential, not parallel — generating several PDFs via @react-pdf/renderer
  // at once is CPU-heavy, and triggering many <a download> clicks back-to-back
  // gets some of them silently blocked by the browser's popup/download
  // throttling. One at a time is slower but actually delivers every file.
  const bulkDownload = async (ids: string[]) => {
    const targets = resumes.filter((r) => ids.includes(r.id));
    for (const resume of targets) {
      const TemplateComponent = getTemplateComponent(resume.templateId);
      const blob = await pdf(<TemplateComponent resume={resume} />).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${resume.title || "resume"}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    }
  };

  const bulkArchive = async (ids: string[]) => {
    const targets = resumes.filter((r) => ids.includes(r.id));
    const results = await Promise.all(
      targets.map((resume) =>
        fetch(`/api/resumes/${resume.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: resume.title,
            templateId: resume.templateId,
            data: { ...toResumeData(resume), isArchived: true },
          }),
        }).then((res) => res.ok),
      ),
    );
    if (results.some((ok) => !ok)) {
      throw new Error("Some resumes failed to archive");
    }
  };

  const bulkDelete = async (ids: string[]) => {
    const results = await Promise.all(
      ids.map((id) => fetch(`/api/resumes/${id}`, { method: "DELETE" }).then((res) => res.ok)),
    );
    if (results.some((ok) => !ok)) {
      throw new Error("Some resumes failed to delete");
    }
  };

  const handleBulkAction = async (action: string) => {
    if (isBulkActing) return;

    if (action === "delete") {
      setConfirmBulkDeleteOpen(true);
      return;
    }

    const ids = [...selectedResumes];
    const count = ids.length;
    const plural = count === 1 ? "resume" : "resumes";

    setIsBulkActing(true);
    try {
      if (action === "download") {
        await bulkDownload(ids);
        toast.success(`Downloaded ${count} ${plural}.`);
      } else if (action === "archive") {
        await bulkArchive(ids);
        toast.success(`Archived ${count} ${plural}.`);
        await loadResumes();
      }
      setSelectedResumes([]);
    } catch (error) {
      console.error(`Bulk ${action} failed:`, error);
      toast.error(`Failed to ${action} ${plural}. Please try again.`);
    } finally {
      setIsBulkActing(false);
    }
  };

  const confirmBulkDelete = async () => {
    const ids = [...selectedResumes];
    const count = ids.length;
    const plural = count === 1 ? "resume" : "resumes";

    setConfirmBulkDeleteOpen(false);
    setIsBulkActing(true);
    try {
      await bulkDelete(ids);
      toast.success(`Deleted ${count} ${plural}.`);
      setSelectedResumes([]);
      await loadResumes();
    } catch (error) {
      console.error("Bulk delete failed:", error);
      toast.error(`Failed to delete ${plural}. Please try again.`);
    } finally {
      setIsBulkActing(false);
    }
  };

  const handleCreateResume = async () => {
    if (isCreatingResume) return;
    setIsCreatingResume(true);
    try {
      const newResume = await createNewResume("modern", user?.id || "");
      router.push(`/builder/${newResume.id}`);
    } catch (error) {
      console.error("Failed to create resume:", error);
      toast.error("Failed to create resume. Please try again.");
      setIsCreatingResume(false);
    }
  };

  return (
    <div className="flex overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          {/* Header */}
          <div className="mb-4">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              <ResumeFilters
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                filterCategory={filterCategory}
                setFilterCategory={setFilterCategory}
                sortBy={sortBy}
                setSortBy={setSortBy}
              />

              <Button
                className="bg-linear-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-70"
                onClick={handleCreateResume}
                disabled={isCreatingResume}
              >
                {isCreatingResume ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                {isCreatingResume ? "Creating..." : "Create New Resume"}
              </Button>
            </div>
          </div>

          {/* Content */}
          {!isLoadingResumes &&
          filteredResumes.length === 0 &&
          resumes.length === 0 ? (
            <EmptyResumeState />
          ) : !isLoadingResumes && filteredResumes.length === 0 ? (
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
            <ResumeListView
              resumes={filteredResumes}
              selectedResumes={selectedResumes}
              onToggleSelect={toggleSelect}
              onToggleFavorite={toggleFavorite}
              onRefresh={loadResumes}
              onReadinessScoreChecked={handleReadinessScoreChecked}
            />
          )}

          {/* Bulk Actions Bar */}
          {selectedResumes.length > 0 && (
            <BulkActionsBar
              selectedCount={selectedResumes.length}
              onAction={handleBulkAction}
              onCancel={() => setSelectedResumes([])}
              isBusy={isBulkActing}
            />
          )}
        </main>
      </div>

      <AlertDialog open={confirmBulkDeleteOpen} onOpenChange={setConfirmBulkDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {selectedResumes.length}{" "}
              {selectedResumes.length === 1 ? "resume" : "resumes"}?
            </AlertDialogTitle>
            <AlertDialogDescription>This can&apos;t be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={confirmBulkDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
