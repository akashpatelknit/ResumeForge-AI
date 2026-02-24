import React, { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Star,
  Download,
  Eye,
  Sparkles,
  Edit,
  MoreVertical,
  Copy,
  Share2,
  Archive,
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Resume } from "@/types/resume";
import { useRouter } from "next/navigation";

interface ResumeListViewProps {
  resumes: Resume[];
  selectedResumes: string[];
  onToggleSelect: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

const getATSBadge = (score: number) => {
  if (score >= 90)
    return {
      label: "Excellent",
      color: "bg-green-100 text-green-700 border-green-200",
    };
  if (score >= 75)
    return {
      label: "Good",
      color: "bg-blue-100 text-blue-700 border-blue-200",
    };
  if (score >= 60)
    return {
      label: "Fair",
      color: "bg-yellow-100 text-yellow-700 border-yellow-200",
    };
  return {
    label: "Needs Work",
    color: "bg-red-100 text-red-700 border-red-200",
  };
};

const PAGE_SIZE_OPTIONS = [5, 10, 25, 50];

export default function ResumeListView({
  resumes,
  selectedResumes,
  onToggleSelect,
  onToggleFavorite,
}: ResumeListViewProps) {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const totalPages = Math.ceil(resumes.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedResumes = resumes.slice(startIndex, startIndex + pageSize);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handlePageSizeChange = (value: string) => {
    setPageSize(Number(value));
    setCurrentPage(1);
  };

  // Generate visible page numbers with ellipsis logic
  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("ellipsis");
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push("ellipsis");
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="w-12 px-4 py-3">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Resume
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Template
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                ATS Score
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Stats
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Modified
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginatedResumes.map((resume, index) => {
              const atsBadge = getATSBadge(resume.atsScore ?? 0);

              return (
                <tr
                  key={resume.id}
                  style={{ animationDelay: `${index * 30}ms` }}
                  className="animate-fadeIn hover:bg-gray-50 transition-colors group"
                >
                  {/* Checkbox */}
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={selectedResumes.includes(resume.id)}
                      onChange={() => onToggleSelect(resume.id)}
                      className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                  </td>

                  {/* Resume Title & Preview */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-16 rounded overflow-hidden shadow-sm ring-1 ring-gray-200 shrink-0">
                        <img
                          src={resume.thumbnail}
                          alt={resume.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900 truncate group-hover:text-purple-600 transition-colors">
                            {resume.title}
                          </p>
                          <button
                            onClick={() => onToggleFavorite(resume.id)}
                            className="shrink-0"
                          >
                            <Star
                              className={`w-4 h-4 transition-colors ${
                                resume.isFavorite
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300 hover:text-yellow-400"
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Template */}
                  <td className="px-4 py-4">
                    <Badge variant="outline" className="text-xs">
                      {resume.templateId}
                    </Badge>
                  </td>

                  {/* ATS Score */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 max-w-30">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-bold text-gray-900">
                            {resume.atsScore}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full transition-all duration-500 ${
                              (resume.atsScore ?? 0) >= 90
                                ? "bg-linear-to-r from-green-500 to-green-600"
                                : (resume.atsScore ?? 0) >= 75
                                  ? "bg-linear-to-r from-blue-500 to-blue-600"
                                  : (resume.atsScore ?? 0) >= 60
                                    ? "bg-linear-to-r from-yellow-500 to-yellow-600"
                                    : "bg-linear-to-r from-red-500 to-red-600"
                            }`}
                            style={{ width: `${resume.atsScore}%` }}
                          />
                        </div>
                      </div>
                      <Badge
                        className={`${atsBadge.color} border text-xs px-2 py-0.5 whitespace-nowrap`}
                      >
                        {atsBadge.label}
                      </Badge>
                    </div>
                  </td>

                  {/* Stats */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-4 text-xs text-gray-600">
                      <div className="flex items-center gap-1">
                        <Download className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </td>

                  {/* Modified */}
                  <td className="px-4 py-4">
                    <span className="text-sm text-gray-600">
                      {new Date(resume.updatedAt).toLocaleDateString()} at{" "}
                      {new Date(resume.updatedAt).toLocaleTimeString()}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => router.push(`/builder/${resume.id}`)}
                      >
                        <Edit className="w-3.5 h-3.5 mr-1" />
                        Edit
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="w-3.5 h-3.5" />
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="outline" className="px-2">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem>
                            <Copy className="w-4 h-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => router.push(`/builder/${resume.id}`)}
                          >
                            <Share2 className="w-4 h-4 mr-2" />
                            Share Link
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Archive className="w-4 h-4 mr-2" />
                            Archive
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-1 w-full">
          {/* Results info + page size selector */}
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <span className="whitespace-nowrap">
              Showing{" "}
              <span className="font-medium text-gray-900">
                {startIndex + 1}-
                {Math.min(startIndex + pageSize, resumes.length)}
              </span>{" "}
              of{" "}
              <span className="font-medium text-gray-900">
                {resumes.length}
              </span>{" "}
              resumes
            </span>
            <div className="flex items-center gap-2">
              <span className="text-gray-500 whitespace-nowrap">Rows per page:</span>
              <Select
                value={String(pageSize)}
                onValueChange={handlePageSizeChange}
              >
                <SelectTrigger className="h-8 w-16 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAGE_SIZE_OPTIONS.map((size) => (
                    <SelectItem
                      key={size}
                      value={String(size)}
                      className="text-xs"
                    >
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Page navigation */}
          <Pagination className="w-full flex items-center justify-end">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => handlePageChange(currentPage - 1)}
                  className={
                    currentPage === 1
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>

              {getPageNumbers().map((page, i) =>
                page === "ellipsis" ? (
                  <PaginationItem key={`ellipsis-${i}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                ) : (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => handlePageChange(page)}
                      isActive={currentPage === page}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ),
              )}

              <PaginationItem>
                <PaginationNext
                  onClick={() => handlePageChange(currentPage + 1)}
                  className={
                    currentPage === totalPages
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
