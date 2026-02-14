import React from "react";
import { Card } from "@/components/ui/card";
import {
  Sparkles,
  TrendingUp,
  Target,
  Lightbulb,
  ArrowRight,
} from "lucide-react";

const insights = [
  {
    icon: TrendingUp,
    title: "Boost ATS Score",
    description:
      "Add quantifiable metrics to experience section for +12% improvement",
    color: "text-purple-600 bg-purple-100",
    borderColor: "border-purple-200",
  },
  {
    icon: Target,
    title: "Keyword Optimization",
    description:
      "Your ATS score could improve by optimizing for job-specific keywords",
    color: "text-blue-600 bg-blue-100",
    borderColor: "border-blue-200",
  },
  {
    icon: Lightbulb,
    title: "Template Suggestion",
    description: "Consider using the Professional template for corporate roles",
    color: "text-green-600 bg-green-100",
    borderColor: "border-green-200",
  },
  {
    icon: Sparkles,
    title: "AI Enhancement",
    description: "Use AI to rephrase 3 bullet points for stronger impact",
    color: "text-pink-600 bg-pink-100",
    borderColor: "border-pink-200",
  },
];

export default function AIInsights() {
  return (
    <Card className="overflow-hidden border shadow-sm sticky top-24 p-0">
      {/* Header with gradient */}
      <div className="relative overflow-hidden bg-linear-to-br from-purple-600 via-purple-500 to-blue-600 p-6 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20"></div>

        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5" />
            <h2 className="text-lg font-bold">AI Recommendations</h2>
          </div>
          <p className="text-sm text-white/80">
            Personalized tips to improve your resumes
          </p>
        </div>
      </div>

      {/* Insights List */}
      <div className="p-6 py-0 space-y-4">
        {insights.map((insight, index) => {
          const Icon = insight.icon;
          return (
            <div
              key={index}
              className={`
                group relative p-4 rounded-xl border ${insight.borderColor} bg-white
                hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 cursor-pointer
              `}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`p-2 rounded-lg ${insight.color} shrink-0 group-hover:scale-110 transition-transform`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm text-gray-900 mb-1">
                    {insight.title}
                  </h3>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {insight.description}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 shrink-0 group-hover:translate-x-1 group-hover:text-gray-600 transition-all" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer CTA */}
      <div className="px-6 pb-6">
        <button className="w-full py-3 px-4 bg-linear-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold text-sm hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4" />
          Apply All Suggestions
        </button>
      </div>

      {/* Bottom decoration */}
      <div className="h-1 bg-linear-to-r from-purple-600 via-blue-600 to-purple-600"></div>
    </Card>
  );
}
