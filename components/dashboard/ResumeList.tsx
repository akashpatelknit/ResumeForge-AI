import React from "react";

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
  RefreshCw,
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
import { Resume } from "@/types/resume";

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

export default function ResumeListView({
  resumes,
  selectedResumes,
  onToggleSelect,
  onToggleFavorite,
}: ResumeListViewProps) {
  return (
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
          {resumes.map((resume, index) => {
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
                            (resume.atsScore ?? 0 >= 90)
                              ? "bg-linear-to-r from-green-500 to-green-600"
                              : (resume.atsScore ?? 0 >= 75)
                                ? "bg-linear-to-r from-blue-500 to-blue-600"
                                : (resume.atsScore ?? 0 >= 60)
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
                      {/* <span>{resume.downloads}</span> */}
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" />
                      {/* <span>{resume.views}</span> */}
                    </div>
                    <div className="flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      {/* <span>{resume.aiOptimizations}</span> */}
                    </div>
                  </div>
                </td>

                {/* Modified */}
                <td className="px-4 py-4">
                  <span className="text-sm text-gray-600">
                    {resume.updatedAt.toLocaleDateString()} at{" "}
                    {resume.updatedAt.toLocaleTimeString()}
                  </span>
                </td>

                {/* Actions */}
                <td className="px-4 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <Button size="sm" variant="outline">
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
                        <DropdownMenuItem>
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Change Template
                        </DropdownMenuItem>
                        <DropdownMenuItem>
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
  );
}
