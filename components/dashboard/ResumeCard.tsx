import React, { useState } from "react";
import { Card } from "@/components/ui/card";
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

interface ResumeCardProps {
  resume: Resume;
  isSelected: boolean;
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

export default function ResumeCard({
  resume,
  isSelected,
  onToggleSelect,
  onToggleFavorite,
}: ResumeCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const atsBadge = getATSBadge(resume.atsScore ?? 0);

  return (
    <Card
      className={`p-0 group relative overflow-hidden transition-all duration-300 cursor-pointer
        ${isSelected ? "ring-2 ring-purple-500 shadow-xl" : "shadow-sm hover:shadow-xl"}
        ${isHovered ? "border-purple-200" : "border-gray-200"}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Selection Checkbox */}
      <div
        className={`absolute top-3 left-3 z-10 transition-opacity duration-200 ${
          isHovered || isSelected ? "opacity-100" : "opacity-0"
        }`}
      >
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelect(resume.id)}
          className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
        />
      </div>

      {/* Favorite Star */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite(resume.id);
        }}
        className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-all duration-200 shadow-sm"
      >
        <Star
          className={`w-4 h-4 transition-colors ${
            resume.isFavorite
              ? "fill-yellow-400 text-yellow-400"
              : "text-gray-400 hover:text-yellow-400"
          }`}
        />
      </button>

      {/* Thumbnail */}
      <div className="relative aspect-16/10 bg-linear-to-br from-gray-100 to-gray-50 overflow-hidden">
        <img
          src={resume.thumbnail}
          alt={resume.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title & Template */}
        <div className="mb-3">
          <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1 group-hover:text-purple-600 transition-colors">
            {resume.title}
          </h3>
          <Badge variant="outline" className="text-xs">
            {resume.templateId}
          </Badge>
        </div>

        {/* ATS Score */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-gray-600">
                ATS Score
              </span>
              <span className="text-sm font-bold text-gray-900">
                {resume.atsScore}/100
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
          <Badge className={`${atsBadge.color} border text-xs px-2 py-0.5`}>
            {atsBadge.label}
          </Badge>
        </div>

        {/* Stats */}
        {/* <div className="flex items-center gap-4 mb-4 text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <Download className="w-3.5 h-3.5" />
            <span>{resume.downloads}</span>
          </div>
          <div className="flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" />
            <span>{resume.views}</span>
          </div>
          <div className="flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{resume.aiOptimizations}</span>
          </div>
        </div> */}

        {/* Last Modified */}
       <p className="text-xs text-gray-500 mb-4">
  Updated {new Date(resume.updatedAt).toLocaleDateString()} at{" "}
  {new Date(resume.updatedAt).toLocaleTimeString()}
</p>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            className="flex-1 bg-linear-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700"
          >
            <Edit className="w-3.5 h-3.5 mr-1.5" />
            Edit
          </Button>
          <Button size="sm" variant="outline" className="flex-1">
            <Download className="w-3.5 h-3.5 mr-1.5" />
            Download
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
      </div>
    </Card>
  );
}
