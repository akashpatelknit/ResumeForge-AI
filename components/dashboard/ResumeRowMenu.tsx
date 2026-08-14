"use client";

import { MoreVertical, Edit, Download, Copy, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { AppResume } from "@/types/resume";
import { useResumeActions } from "@/hooks/useResumeActions";

interface ResumeRowMenuProps {
  resume: AppResume;
  onRefresh?: () => void;
}

// Dashboard-only compact action menu — just the 4 actions the dashboard
// table needs (Edit, Download, Duplicate, Delete) collapsed into one "..."
// trigger, vs. the fuller action set on the My Resumes page
// (ResumeCardActions.tsx). Shares its request logic via useResumeActions so
// there's still only one implementation of each action.
export default function ResumeRowMenu({ resume, onRefresh }: ResumeRowMenuProps) {
  const {
    handleEdit,
    handleDownload,
    handleDuplicate,
    handleDelete,
    isDownloading,
    isDuplicating,
    isDeleting,
  } = useResumeActions(resume, onRefresh);

  const busy = isDownloading || isDuplicating || isDeleting;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700"
          onClick={(e) => e.stopPropagation()}
        >
          {busy ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <MoreVertical className="w-4 h-4" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem onClick={handleEdit}>
          <Edit className="w-4 h-4 mr-2" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleDownload} disabled={isDownloading}>
          <Download className="w-4 h-4 mr-2" />
          Download
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleDuplicate} disabled={isDuplicating}>
          <Copy className="w-4 h-4 mr-2" />
          Duplicate
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
  );
}
