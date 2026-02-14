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
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-slideUp">
      <div className="bg-white rounded-xl shadow-2xl border border-gray-200 px-6 py-4 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
            <span className="text-sm font-bold text-purple-600">
              {selectedCount}
            </span>
          </div>
          <span className="text-sm font-medium text-gray-700">
            {selectedCount} {selectedCount === 1 ? "resume" : "resumes"}{" "}
            selected
          </span>
        </div>

        <div className="h-6 w-px bg-gray-300" />

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onAction("download")}
            className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300"
          >
            <Download className="w-4 h-4 mr-1.5" />
            Download All
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => onAction("archive")}
            className="hover:bg-gray-100"
          >
            <Archive className="w-4 h-4 mr-1.5" />
            Archive
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => onAction("delete")}
            className="hover:bg-red-50 hover:text-red-600 hover:border-red-300"
          >
            <Trash2 className="w-4 h-4 mr-1.5" />
            Delete
          </Button>
        </div>

        <div className="h-6 w-px bg-gray-300" />

        <Button
          size="sm"
          variant="ghost"
          onClick={onCancel}
          className="hover:bg-gray-100"
        >
          <X className="w-4 h-4 mr-1.5" />
          Cancel
        </Button>
      </div>
    </div>
  );
}
