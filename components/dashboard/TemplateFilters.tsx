import React from "react";
import { Crown } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface TemplateFiltersProps {
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  getCategoryCount: (category: string) => number;
}

const categories = [
  { id: "all", label: "All Templates", icon: null },
  { id: "modern", label: "Modern", icon: null },
  { id: "professional", label: "Professional", icon: null },
  { id: "creative", label: "Creative", icon: null },
  { id: "minimal", label: "Minimal", icon: null },
  { id: "premium", label: "Premium", icon: Crown },
];

export default function TemplateFilters({
  selectedCategory,
  setSelectedCategory,
  getCategoryCount,
}: TemplateFiltersProps) {
  return (
    <div className="mt-6">
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => {
          const Icon = category.icon;
          const isActive = selectedCategory === category.id;
          const count = getCategoryCount(category.id);

          return (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`
                group relative px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200
                ${
                  isActive
                    ? category.id === "premium"
                      ? "bg-linear-to-r from-yellow-400 to-yellow-600 text-white shadow-lg"
                      : "bg-linear-to-r from-purple-600 to-blue-600 text-white shadow-lg"
                    : "bg-white text-gray-700 border border-gray-200 hover:border-purple-300 hover:shadow-md"
                }
              `}
            >
              <div className="flex items-center gap-2">
                {Icon && <Icon className="w-4 h-4" />}
                <span>{category.label}</span>
                <Badge
                  variant="outline"
                  className={`
                    ml-1 text-xs px-1.5 py-0
                    ${
                      isActive
                        ? "bg-white/20 text-white border-white/30"
                        : "bg-gray-100 text-gray-600 border-gray-300"
                    }
                  `}
                >
                  {count}
                </Badge>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
