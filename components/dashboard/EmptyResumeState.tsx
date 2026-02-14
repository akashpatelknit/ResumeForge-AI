import React from "react";
import { Button } from "@/components/ui/button";
import { FileText, Plus, Linkedin } from "lucide-react";

export default function EmptyResumeState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="relative mb-8">
        {/* Decorative circles */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-0 w-32 h-32 bg-purple-100 rounded-full blur-3xl opacity-60 animate-pulse" />
          <div
            className="absolute bottom-0 right-0 w-32 h-32 bg-blue-100 rounded-full blur-3xl opacity-60 animate-pulse"
            style={{ animationDelay: "1s" }}
          />
        </div>

        {/* Icon */}
        <div className="relative w-24 h-24 rounded-full bg-linear-to-br from-purple-100 to-blue-100 flex items-center justify-center">
          <FileText className="w-12 h-12 text-purple-600" />
        </div>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mb-2">No resumes yet</h2>
      <p className="text-gray-600 text-center max-w-md mb-8">
        Create your first AI-optimized resume in minutes and start landing
        interviews faster
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          size="lg"
          className="bg-linear-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Your First Resume
        </Button>

        <Button
          size="lg"
          variant="outline"
          className="border-2 hover:bg-gray-50"
        >
          <Linkedin className="w-5 h-5 mr-2" />
          Import from LinkedIn
        </Button>
      </div>

      {/* Feature hints */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-3xl">
        {[
          {
            icon: "🎯",
            title: "ATS Optimized",
            description:
              "Get past applicant tracking systems with AI optimization",
          },
          {
            icon: "⚡",
            title: "Quick Creation",
            description: "Build professional resumes in under 10 minutes",
          },
          {
            icon: "🎨",
            title: "Beautiful Templates",
            description: "Choose from professionally designed templates",
          },
        ].map((feature, index) => (
          <div
            key={index}
            className="text-center p-6 rounded-xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="text-3xl mb-3">{feature.icon}</div>
            <h3 className="font-semibold text-gray-900 mb-2">
              {feature.title}
            </h3>
            <p className="text-sm text-gray-600">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
