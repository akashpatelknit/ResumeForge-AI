"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Crown, Eye, Check } from "lucide-react";
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
      className={`
        group relative overflow-hidden cursor-pointer
        transition-all duration-300
        p-0 rounded-xl
        ${isInCompare ? "ring-2 ring-purple-500 shadow-lg" : "shadow-sm hover:shadow-xl"}
        hover:-translate-y-1 hover:scale-[1.02]
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* ================= IMAGE ================= */}
      <div className="relative aspect-[3/4] bg-gray-100 overflow-hidden">
        <img
          src={template.thumbnail}
          alt={template.name}
          draggable={false}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

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
            onClick={() => onPreview(template)}
          >
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
        </div>
      </div>

      {/* ================= INFO ================= */}
      <div className="p-3 space-y-1.5">
        {/* Title */}
        <h3 className="text-sm font-semibold text-gray-900 line-clamp-1 group-hover:text-purple-600 transition-colors">
          {template.name}
        </h3>

        {/* Category + Rating */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span className="capitalize">{template.category}</span>

          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
            <span className="font-medium text-gray-800">{template.rating}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
