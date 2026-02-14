import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Download,
  Star,
  Users,
  Crown,
  Check,
} from "lucide-react";
import { Template } from "@/types/template";

interface TemplatePreviewModalProps {
  template: Template;
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
}

export default function TemplatePreviewModal({
  template,
  onClose,
  onNext,
  onPrevious,
}: TemplatePreviewModalProps) {
  const [zoom, setZoom] = useState(100);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 25, 50));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fadeIn">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Navigation Arrows */}
      <button
        onClick={onPrevious}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all hover:scale-110 z-10"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        onClick={onNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all hover:scale-110 z-10"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Zoom Controls */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg p-2 z-10">
        <button
          onClick={handleZoomOut}
          className="p-2 rounded hover:bg-white/20 text-white transition-colors"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <span className="text-white text-sm font-medium px-2">{zoom}%</span>
        <button
          onClick={handleZoomIn}
          className="p-2 rounded hover:bg-white/20 text-white transition-colors"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex w-full max-w-7xl h-[90vh] gap-0">
        {/* Preview Area */}
        <div className="flex-1 flex items-center justify-center p-8 overflow-auto">
          <div
            className="bg-white rounded-lg shadow-2xl transition-transform duration-300"
            style={{
              transform: `scale(${zoom / 100})`,
              width: "612px", // 8.5 inches at 72 DPI
              aspectRatio: "8.5/11",
            }}
          >
            <img
              src={template.fullPreview}
              alt={template.name}
              className="w-full h-full object-cover rounded-lg"
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-96 bg-white rounded-r-lg shadow-2xl overflow-y-auto">
          <div className="p-6">
            {/* Template Info */}
            <div className="mb-6">
              <div className="flex items-start justify-between mb-2">
                <h2 className="text-2xl font-bold text-gray-900">
                  {template.name}
                </h2>
                {template.isPremium && (
                  <Badge className="bg-linear-to-r from-yellow-400 to-yellow-600 text-white border-0">
                    <Crown className="w-3 h-3 mr-1" />
                    Premium
                  </Badge>
                )}
              </div>
              <p className="text-gray-600">{template.description}</p>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6 mb-6 pb-6 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <div>
                  <div className="font-bold text-gray-900">
                    {template.rating}
                  </div>
                  <div className="text-xs text-gray-500">Rating</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="font-bold text-gray-900">
                    {template.usageCount.toLocaleString()}+
                  </div>
                  <div className="text-xs text-gray-500">Users</div>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Features</h3>
              <div className="space-y-2">
                {Array.isArray(template.features) &&
                  template.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Best For */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Best for</h3>
              <div className="flex flex-wrap gap-2">
                {template.bestFor.map((role, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="bg-purple-50 text-purple-700 border-purple-200"
                  >
                    {role}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Category */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">Category</h3>
              <Badge variant="outline" className="capitalize">
                {template.category}
              </Badge>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Button className="w-full bg-linear-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all text-base py-6">
                Use This Template
              </Button>

              <Button variant="outline" className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Download Sample PDF
              </Button>
            </div>

            {/* Premium Upsell (if applicable) */}
            {template.isPremium && (
              <div className="mt-6 p-4 bg-linear-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <Crown className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">
                      Premium Template
                    </h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Upgrade to Pro to unlock this template and all premium
                      features
                    </p>
                    <Button
                      size="sm"
                      className="bg-linear-to-r from-yellow-500 to-yellow-600 text-white hover:from-yellow-600 hover:to-yellow-700"
                    >
                      Upgrade to Pro
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
