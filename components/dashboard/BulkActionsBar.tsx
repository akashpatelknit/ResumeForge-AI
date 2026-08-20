import React from "react";
import { Button } from "@/components/ui/button";
import { Download, Archive, Trash2, X } from "lucide-react";

interface BulkActionsBarProps {
  selectedCount: number;
  onAction: (action: string) => void;
  onCancel: () => void;
}

export default function BulkActionsBar({
  selectedCount,
  onAction,
  onCancel,
}: BulkActionsBarProps) {
  return (
    <div className="fixed bottom-4 left-1/2 z-50 w-[calc(100vw-2rem)] max-w-xl -translate-x-1/2 animate-slideUp sm:bottom-6 sm:w-auto">
      <div className="flex flex-wrap items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-2xl sm:flex-nowrap sm:gap-4 sm:px-6 sm:py-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
            <span className="text-sm font-bold text-purple-600">
              {selectedCount}
            </span>
          </div>
          <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
            {selectedCount} {selectedCount === 1 ? "resume" : "resumes"}{" "}
            selected
          </span>
        </div>

        <div className="hidden h-6 w-px bg-gray-300 sm:block" />

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onAction("download")}
            className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300"
          >
            <Download className="w-4 h-4 sm:mr-1.5" />
            <span className="hidden sm:inline">Download All</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => onAction("archive")}
            className="hover:bg-gray-100"
          >
            <Archive className="w-4 h-4 sm:mr-1.5" />
            <span className="hidden sm:inline">Archive</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => onAction("delete")}
            className="hover:bg-red-50 hover:text-red-600 hover:border-red-300"
          >
            <Trash2 className="w-4 h-4 sm:mr-1.5" />
            <span className="hidden sm:inline">Delete</span>
          </Button>
        </div>

        <div className="hidden h-6 w-px bg-gray-300 sm:block" />

        <Button
          size="sm"
          variant="ghost"
          onClick={onCancel}
          className="hover:bg-gray-100"
        >
          <X className="w-4 h-4 sm:mr-1.5" />
          <span className="hidden sm:inline">Cancel</span>
        </Button>
      </div>
    </div>
  );
}
