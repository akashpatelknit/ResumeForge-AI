import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Check, Minus, Star, Crown } from "lucide-react";
import { Template } from "@/types/template";

interface TemplateComparisonProps {
  templates: Template[];
  onClose: () => void;
}

export default function TemplateComparison({
  templates,
  onClose,
}: TemplateComparisonProps) {
  // Get all unique features across all templates
  const allFeatures = Array.from(new Set(templates.flatMap((t) => t.features)));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fadeIn">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Main Content */}
      <div className="w-full max-w-6xl h-[90vh] bg-white rounded-lg shadow-2xl overflow-hidden flex flex-col m-4">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-linear-to-r from-purple-50 to-blue-50">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Compare Templates
          </h2>
          <p className="text-gray-600">
            Compare features side-by-side to find the perfect template
          </p>
        </div>

        {/* Comparison Content */}
        <div className="flex-1 overflow-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0">
            {templates.map((template, index) => (
              <div
                key={template.id}
                className={`${
                  index !== templates.length - 1
                    ? "border-r border-gray-200"
                    : ""
                }`}
              >
                {/* Template Header */}
                <div className="p-6 border-b border-gray-200 bg-gray-50">
                  {/* Preview */}
                  <div className="relative aspect-[8.5/11] bg-white rounded-lg overflow-hidden mb-4 shadow-sm">
                    <img
                      src={template.thumbnail}
                      alt={template.name}
                      className="w-full h-full object-cover"
                    />
                    {template.isPremium && (
                      <Badge className="absolute top-2 right-2 bg-linear-to-r from-yellow-400 to-yellow-600 text-white border-0">
                        <Crown className="w-3 h-3 mr-1" />
                        Premium
                      </Badge>
                    )}
                  </div>

                  {/* Name & Category */}
                  <h3 className="font-bold text-lg text-gray-900 mb-1">
                    {template.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    {template.description}
                  </p>
                  <Badge variant="outline" className="capitalize mb-3">
                    {template.category}
                  </Badge>

                  {/* Rating */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-semibold">
                        {template.rating}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {template.usageCount.toLocaleString()}+ uses
                    </div>
                  </div>

                  {/* CTA */}
                  <Button className="w-full bg-linear-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700">
                    Use This Template
                  </Button>
                </div>

                {/* Feature Comparison */}
                <div className="p-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Features</h4>
                  <div className="space-y-3">
                    {allFeatures.map((feature, featureIndex) => {
                      const hasFeature =
                        feature !== undefined &&
                        template.features?.includes(feature);

                      return (
                        <div
                          key={featureIndex}
                          className="flex items-start gap-2"
                        >
                          {hasFeature ? (
                            <Check className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                          ) : (
                            <Minus className="w-5 h-5 text-gray-300 shrink-0 mt-0.5" />
                          )}
                          <span
                            className={`text-sm ${
                              hasFeature ? "text-gray-900" : "text-gray-400"
                            }`}
                          >
                            {feature}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Best For */}
                  <div className="mt-6">
                    <h4 className="font-semibold text-gray-900 mb-3">
                      Best for
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {template.bestFor.map((role, roleIndex) => (
                        <Badge
                          key={roleIndex}
                          variant="outline"
                          className="bg-purple-50 text-purple-700 border-purple-200 text-xs"
                        >
                          {role}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Comparing {templates.length} templates
            </p>
            <Button variant="outline" onClick={onClose}>
              Close Comparison
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
