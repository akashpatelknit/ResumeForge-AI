"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Crown, Eye, Check, Clock } from "lucide-react";
import { Template } from "@/types/template";
import TemplateThumbnail from "./TemplateThumbnail";

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

  if (template.comingSoon) {
    return (
      <Card className="relative overflow-hidden p-0 rounded-xl shadow-sm opacity-70 saturate-0">
        <div className="relative aspect-[3/4] bg-gray-50 overflow-hidden">
          <TemplateThumbnail />
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
            <Badge className="bg-gray-900 text-white text-[10px] px-2.5 py-1 border-0">
              <Clock className="w-3 h-3 mr-1" />
              Coming Soon
            </Badge>
          </div>
        </div>
        <div className="p-3 space-y-1">
          <h3 className="text-sm font-semibold text-gray-700 line-clamp-1">
            {template.name}
          </h3>
          <p className="text-xs text-gray-400 line-clamp-2">
            {template.description}
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card
      className={`
        group relative overflow-hidden cursor-pointer
        transition-all duration-300
        p-0 rounded-xl
        ${isInCompare ? "ring-2 ring-purple-500 shadow-lg" : "shadow-sm hover:shadow-xl"}
        hover:-translate-y-1 hover:scale-[1.02]
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onPreview(template)}
    >
      {/* ================= THUMBNAIL ================= */}
      <div className="relative aspect-[3/4] bg-gray-100 overflow-hidden border-b border-gray-100">
        <TemplateThumbnail className="transition-transform duration-500 group-hover:scale-105" />

        {/* Compare Checkbox */}
        <div
          className={`absolute top-2 left-2 z-10 transition-opacity ${
            isHovered || isInCompare ? "opacity-100" : "opacity-0"
          }`}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleCompare(template.id);
            }}
            className={`w-5 h-5 rounded-md border flex items-center justify-center
              ${
                isInCompare
                  ? "bg-purple-600 border-purple-600"
                  : "bg-white border-gray-300"
              }
            `}
          >
            {isInCompare && <Check className="w-3 h-3 text-white" />}
          </button>
        </div>

        {/* Premium Badge */}
        {template.isPremium && (
          <Badge className="absolute top-2 right-2 bg-amber-500 text-white text-[10px] px-2 py-0.5 border-0">
            <Crown className="w-3 h-3 mr-1" />
            Pro
          </Badge>
        )}

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
          <Button
            size="sm"
            className="bg-white text-gray-900 hover:bg-gray-100 text-xs font-semibold"
            onClick={(e) => {
              e.stopPropagation();
              onPreview(template);
            }}
          >
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
        </div>
      </div>

      {/* ================= INFO ================= */}
      <div className="p-4 space-y-1.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-semibold text-gray-900 line-clamp-1 group-hover:text-purple-600 transition-colors">
            {template.name}
          </h3>
          <div className="flex items-center gap-1 shrink-0">
            <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
            <span className="text-xs font-medium text-gray-800">
              {template.rating}
            </span>
          </div>
        </div>
        <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
          {template.description}
        </p>
      </div>
    </Card>
  );
}
