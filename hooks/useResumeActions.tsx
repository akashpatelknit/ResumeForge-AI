"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { pdf } from "@react-pdf/renderer";
import { getTemplateComponent } from "@/components/pdf/template";
import type { AppResume } from "@/types/resume";

// Builds the same `data` shape store/resumeStore.ts's saveResume() sends —
// the PUT route replaces the whole `data` JSON column, so every field has
// to be resent even when only one of them (e.g. isArchived) is changing.
function toResumeData(resume: AppResume) {
  return {
    personalInfo: resume.personalInfo,
    summary: resume.summary,
    experience: resume.experience,
    education: resume.education,
    skills: resume.skills,
    projects: resume.projects,
    achievements: resume.achievements,
    certifications: resume.certifications,
    languages: resume.languages,
    customSections: resume.customSections,
    isFavorite: resume.isFavorite,
    isArchived: resume.isArchived,
    thumbnail: resume.thumbnail,
    atsScore: resume.atsScore,
  };
}

// Single source of truth for what a user can do to a resume — extracted out
// of ResumeCardActions.tsx (grid card / My Resumes list row) so a third UI
// surface (the dashboard's Recent Resumes overflow menu) can reuse the same
// Edit/Download/Duplicate/Delete handlers without a third copy of the
// PDF-generation/duplicate/delete request logic to drift out of sync.
export function useResumeActions(resume: AppResume, onRefresh?: () => void) {
  const router = useRouter();
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEdit = () => {
    router.push(`/builder/${resume.id}`);
  };

  const handleDownload = async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    try {
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
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      toast.error("Failed to generate PDF. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDuplicate = async () => {
    if (isDuplicating) return;
    setIsDuplicating(true);
    try {
      const res = await fetch("/api/resumes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `${resume.title} (Copy)`,
          templateId: resume.templateId,
          data: toResumeData(resume),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to duplicate");

      toast.success("Resume duplicated.");
      onRefresh?.();
    } catch (error) {
      console.error("Failed to duplicate resume:", error);
      toast.error("Failed to duplicate resume. Please try again.");
    } finally {
      setIsDuplicating(false);
    }
  };

  const handleChangeTemplate = () => {
    // Only one real template exists today (see config/templates.ts) — there's
    // no per-resume template-switch feature to open, so this browses the
    // gallery instead of pretending to offer a picker here.
    toast.info("Only one template is available right now — more are coming soon.");
    router.push("/dashboard/template");
  };

  const handleShareLink = async () => {
    // There's no public resume view in the app yet — this copies the
    // internal editor link, which is the most honest "share" available.
    const url = `${window.location.origin}/builder/${resume.id}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied.", {
        description: "Note: this opens the editor — there's no public share page yet.",
      });
    } catch (error) {
      console.error("Failed to copy link:", error);
      toast.error("Couldn't copy the link.");
    }
  };

  const handleToggleArchive = async () => {
    if (isArchiving) return;
    setIsArchiving(true);
    try {
      const res = await fetch(`/api/resumes/${resume.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: resume.title,
          templateId: resume.templateId,
          data: { ...toResumeData(resume), isArchived: !resume.isArchived },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to update resume");

      toast.success(resume.isArchived ? "Resume unarchived." : "Resume archived.");
      onRefresh?.();
    } catch (error) {
      console.error("Failed to archive/unarchive resume:", error);
      toast.error("Failed to update resume. Please try again.");
    } finally {
      setIsArchiving(false);
    }
  };

  const handleDelete = async () => {
    if (isDeleting) return;
    if (!window.confirm(`Delete "${resume.title}"? This can't be undone.`)) {
      return;
    }
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/resumes/${resume.id}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Failed to delete");

      toast.success("Resume deleted.");
      onRefresh?.();
    } catch (error) {
      console.error("Failed to delete resume:", error);
      toast.error("Failed to delete resume. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    handleEdit,
    handleDownload,
    handleDuplicate,
    handleChangeTemplate,
    handleShareLink,
    handleToggleArchive,
    handleDelete,
    isDownloading,
    isDuplicating,
    isArchiving,
    isDeleting,
  };
}
