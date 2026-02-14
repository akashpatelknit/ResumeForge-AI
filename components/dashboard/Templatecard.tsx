import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Users, Crown, Eye, Check } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Template } from "@/types/template";

interface TemplateCardProps {
  template: Template;
  onPreview: (template: Template) => void;
  isInCompare: boolean;
  onToggleCompare: (templateId: string) => void;
}

export default function TemplateCard({
  template,
  onPreview,
  isInCompare,
  onToggleCompare,
}: TemplateCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Card
      className={`p-0 group relative overflow-hidden transition-all duration-300 cursor-pointer
        ${isInCompare ? "ring-2 ring-purple-500 shadow-2xl" : "shadow-sm hover:shadow-2xl"}
        ${template.isPremium ? "border-yellow-200 hover:shadow-yellow-200/50" : "hover:border-purple-200"}
        hover:scale-[1.03] hover:-translate-y-1
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Compare Checkbox */}
      <div
        className={`absolute top-3 left-3 z-10 transition-opacity duration-200 ${
          isHovered || isInCompare ? "opacity-100" : "opacity-0"
        }`}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleCompare(template.id);
          }}
          className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all
            ${
              isInCompare
                ? "bg-purple-600 border-purple-600"
                : "bg-white border-gray-300 hover:border-purple-400"
            }
          `}
        >
          {isInCompare && <Check className="w-4 h-4 text-white" />}
        </button>
      </div>

      {/* Premium Badge */}
      {template.isPremium && (
        <div className="absolute top-3 right-3 z-10">
          <Badge className="bg-linear-to-r from-yellow-400 to-yellow-600 text-white border-0 shadow-lg">
            <Crown className="w-3 h-3 mr-1" />
            Premium
          </Badge>
        </div>
      )}

      {/* Preview Image */}
      <div className="relative aspect-[8.5/11] bg-linear-to-br from-gray-100 to-gray-50 overflow-hidden">
        <img
          src={template.thumbnail}
          alt={template.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute bottom-4 left-4 right-4">
            <Button
              onClick={() => onPreview(template)}
              variant="outline"
              className="w-full bg-white/95 backdrop-blur-sm hover:bg-white"
            >
              <Eye className="w-4 h-4 mr-2" />
              Quick Preview
            </Button>
          </div>
        </div>

        {/* Premium Blur Effect (for free users viewing premium) */}
        {template.isPremium && (
          <div className="absolute inset-0 backdrop-blur-[2px] bg-white/5 opacity-0 group-hover:opacity-0 transition-opacity" />
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Title & Category */}
        <div className="mb-3">
          <h3 className="font-semibold text-lg text-gray-900 mb-1 group-hover:text-purple-600 transition-colors">
            {template.name}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-1">
            {template.description}
          </p>
        </div>

        {/* Category Badge */}
        <div className="mb-3">
          <Badge variant="outline" className="text-xs capitalize">
            {template.category}
          </Badge>
        </div>

        {/* Features */}
        <div className="mb-4 space-y-1.5">
          {Array.isArray(template.features) &&
            template.features.slice(0, 3).map((feature, index) => (
              <div
                key={index}
                className="flex items-center gap-2 text-xs text-gray-600"
              >
                <div className="w-1 h-1 rounded-full bg-purple-500" />
                <span>{feature}</span>
              </div>
            ))}
          {Array.isArray(template.features) && template.features.length > 3 && (
            <div className="text-xs text-gray-500 ml-3">
              +{template.features.length - 3} more
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-semibold text-gray-900">
              {template.rating}
            </span>
          </div>
          <div className="flex items-center gap-1 text-gray-600">
            <Users className="w-4 h-4" />
            <span className="text-xs">
              {template.usageCount.toLocaleString()}+
            </span>
          </div>
        </div>

        {/* Best For */}
        <div className="mb-4">
          <p className="text-xs text-gray-500 mb-2">Best for:</p>
          <div className="flex flex-wrap gap-1.5">
            {template.bestFor.slice(0, 2).map((role, index) => (
              <Badge
                key={index}
                variant="outline"
                className="text-xs bg-purple-50 text-purple-700 border-purple-200"
              >
                {role}
              </Badge>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onPreview(template)}
          >
            Preview
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="flex-1 bg-linear-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700">
                Use Template
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem>
                <span className="font-medium">Create New Resume</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <div className="px-2 py-1.5 text-xs text-gray-500">
                Apply to existing:
              </div>
              <DropdownMenuItem>Full Stack Developer Resume</DropdownMenuItem>
              <DropdownMenuItem>Senior Frontend Engineer</DropdownMenuItem>
              <DropdownMenuItem>Product Manager CV</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Premium Glow Effect */}
      {template.isPremium && (
        <div className="absolute inset-0 bg-linear-to-r from-yellow-400/10 to-yellow-600/10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      )}
    </Card>
  );
}
