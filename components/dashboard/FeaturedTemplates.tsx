import React, { useRef } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Crown, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { Template } from "@/types/template";

interface FeaturedTemplatesProps {
  templates: Template[];
  onPreview: (template: Template) => void;
}

export default function FeaturedTemplates({
  templates,
  onPreview,
}: FeaturedTemplatesProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 400;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          <h2 className="text-xl font-bold text-gray-900">
            Featured Templates
          </h2>
        </div>

        {/* Navigation Arrows */}
        <div className="flex gap-2">
          <button
            onClick={() => scroll("left")}
            className="p-2 rounded-lg bg-white border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="p-2 rounded-lg bg-white border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Carousel */}
      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-4 bg-transparent"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {templates.map((template, index) => (
          <Card
            key={template.id}
            style={{ animationDelay: `${index * 100}ms` }}
            className="group relative shrink-0 w-80 overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 animate-fadeIn p-0"
          >
            {/* Featured Badge */}
            <div className="absolute top-3 left-3 z-10">
              <Badge className="bg-linear-to-r from-purple-600 to-blue-600 text-white border-0 shadow-lg">
                <Sparkles className="w-3 h-3 mr-1" />
                Featured
              </Badge>
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

            {/* Preview */}
            <div className="relative aspect-16/10 bg-linear-to-br from-gray-100 to-gray-50 overflow-hidden">
              <img
                src={template.thumbnail}
                alt={template.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>

            {/* Content */}
            <div className="p-5">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-lg text-gray-900 group-hover:text-purple-600 transition-colors">
                    {template.name}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {template.description}
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-semibold text-gray-900">
                    {template.rating}
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  {template.usageCount.toLocaleString()}+ uses
                </div>
              </div>

              {/* Action */}
              <Button
                onClick={() => onPreview(template)}
                className="w-full bg-linear-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700"
              >
                View Template
              </Button>
            </div>

            {/* Decorative Gradient */}
            <div className="absolute inset-0 bg-linear-to-r from-purple-600/5 to-blue-600/5 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </Card>
        ))}
      </div>

      <div className="absolute left-0 top-0 bottom-0 w-8 bg-linear-to-r from-black/5 to-transparent pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-8 bg-linear-to-l from-black/5 to-transparent pointer-events-none" />
    </div>
  );
}
