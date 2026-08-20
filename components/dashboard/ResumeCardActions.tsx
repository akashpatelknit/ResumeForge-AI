"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Edit,
  Download,
  Loader2,
  MoreVertical,
  Copy,
  RefreshCw,
  Share2,
  Archive,
  ArchiveRestore,
  Trash2,
  Wand2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { AppResume } from "@/types/resume";
import { useResumeActions } from "@/hooks/useResumeActions";
import TailorResumeModal from "./TailorResumeModal";

interface ResumeCardActionsProps {
  resume: AppResume;
  // Grid cards want Edit/Download to fill the row width (flex-1); a
  // compact list row wants them at their natural width instead.
  fill?: boolean;
  // Called after an action that changes the resume list (Duplicate,
  // Archive/Unarchive, Delete) so the parent can re-fetch. Optional so this
  // component still works standalone.
  onRefresh?: () => void;
}

// Single source of truth for what a user can do to a resume — used by both
// the grid card and the list row specifically so the two views can never
// drift into offering different actions. The actual request logic lives in
// useResumeActions so a third surface (dashboard's compact row menu) can
// reuse it too.
export default function ResumeCardActions({
  resume,
  fill = true,
  onRefresh,
}: ResumeCardActionsProps) {
  const [showTailorModal, setShowTailorModal] = useState(false);
  const {
    handleEdit,
    handleDownload,
    handleDuplicate,
    handleChangeTemplate,
    handleShareLink,
    handleToggleArchive,
    handleDelete,
    DeleteConfirmDialog,
    isDownloading,
    isDuplicating,
    isArchiving,
    isDeleting,
  } = useResumeActions(resume, onRefresh);

  return (
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        onClick={handleEdit}
        className={`${fill ? "flex-1" : ""} bg-linear-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700`}
      >
        <Edit className="w-3.5 h-3.5 mr-1.5" />
        Edit
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={handleDownload}
        disabled={isDownloading}
        className={fill ? "flex-1" : ""}
      >
        {isDownloading ? (
          <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
        ) : (
          <Download className="w-3.5 h-3.5 mr-1.5" />
        )}
        Download
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" variant="outline" className="px-2">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              setShowTailorModal(true);
            }}
          >
            <Wand2 className="w-4 h-4 mr-2" />
            Tailor for a Job
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleDuplicate} disabled={isDuplicating}>
            <Copy className="w-4 h-4 mr-2" />
            Duplicate
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleChangeTemplate}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Change Template
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleShareLink}>
            <Share2 className="w-4 h-4 mr-2" />
            Share Link
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleToggleArchive} disabled={isArchiving}>
            {resume.isArchived ? (
              <ArchiveRestore className="w-4 h-4 mr-2" />
            ) : (
              <Archive className="w-4 h-4 mr-2" />
            )}
            {resume.isArchived ? "Unarchive" : "Archive"}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-red-600"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <TailorResumeModal
        open={showTailorModal}
        onOpenChange={setShowTailorModal}
        resumeId={resume.id}
        resumeTitle={resume.title}
      />
      {DeleteConfirmDialog}
    </div>
  );
}
