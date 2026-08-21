"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ExternalLink, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import PdfCanvasThumbnail from "@/components/pdf/PdfCanvasThumbnail";
import ResumeRowMenu from "./ResumeRowMenu";
import type { AppResume } from "@/types/resume";

interface RecentResumesProps {
  resumes: AppResume[];
  isLoading: boolean;
  // Set briefly by the parent when the ATS Score Average stat card is
  // clicked, to draw the eye to the lowest-scoring row it scrolled to.
  highlightResumeId?: string | null;
  onRefresh?: () => void;
}

const PREVIEW_COUNT = 5;

const getScoreColor = (score: number) => {
  if (score >= 85) return "text-green-600 bg-green-100";
  if (score >= 70) return "text-blue-600 bg-blue-100";
  return "text-yellow-600 bg-yellow-100";
};

const getScoreLabel = (score: number) => {
  if (score >= 85) return "Excellent";
  if (score >= 70) return "Good";
  return "Fair";
};

export default function RecentResumes({
  resumes,
  isLoading,
  highlightResumeId,
  onRefresh,
}: RecentResumesProps) {
  const router = useRouter();

  // Default sort: lowest ATS score first — the resumes needing the most
  // attention lead the list, rather than whatever was edited most recently.
  const sorted = [...resumes]
    .sort((a, b) => (a.atsScore ?? 0) - (b.atsScore ?? 0))
    .slice(0, PREVIEW_COUNT);

  return (
    <Card id="recent-resumes" className="overflow-hidden border shadow-sm p-0">
      <div className="p-6 border-b border-gray-100 bg-linear-to-r from-gray-50 to-transparent">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Recent Resumes</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Sorted by ATS score — lowest first
            </p>
          </div>
          <a
            href="/dashboard/resumes"
            className="flex items-center gap-2 text-sm font-medium text-purple-600 hover:text-purple-700 transition-colors group"
          >
            View All
            <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </a>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-gray-400 text-sm">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading resumes...
        </div>
      ) : sorted.length === 0 ? (
        <div className="py-16 text-center text-sm text-gray-500">
          No resumes yet — create one to see it here.
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Resume
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Template
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Modified
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    ATS Score
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {sorted.map((resume) => (
                  <tr
                    key={resume.id}
                    id={`resume-row-${resume.id}`}
                    onClick={() => router.push(`/builder/${resume.id}`)}
                    className={`hover:bg-gray-50/50 transition-colors group cursor-pointer ${
                      highlightResumeId === resume.id
                        ? "bg-purple-50 ring-1 ring-inset ring-purple-300"
                        : ""
                    }`}
                  >
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900 group-hover:text-purple-600 transition-colors">
                        {resume.title}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className="font-medium capitalize">
                        {resume.templateId}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">
                        {new Date(resume.updatedAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-gray-900">
                            {resume.atsScore}/100
                          </span>
                          <Badge
                            className={`text-xs px-2 py-0 ${getScoreColor(resume.atsScore)}`}
                          >
                            {getScoreLabel(resume.atsScore)}
                          </Badge>
                        </div>
                        <Progress value={resume.atsScore} className="h-1.5" />
                      </div>
                    </td>
                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end">
                        <ResumeRowMenu resume={resume} onRefresh={onRefresh} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-gray-100">
            {sorted.map((resume) => (
              <div
                key={resume.id}
                id={`resume-row-${resume.id}`}
                onClick={() => router.push(`/builder/${resume.id}`)}
                className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                  highlightResumeId === resume.id
                    ? "bg-purple-50 ring-1 ring-inset ring-purple-300"
                    : ""
                }`}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-12 h-14 rounded-lg overflow-hidden shadow-sm ring-1 ring-gray-200 shrink-0">
                    <PdfCanvasThumbnail resume={resume} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">
                      {resume.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs capitalize">
                        {resume.templateId}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {new Date(resume.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div onClick={(e) => e.stopPropagation()}>
                    <ResumeRowMenu resume={resume} onRefresh={onRefresh} />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-900">
                      ATS Score: {resume.atsScore}/100
                    </span>
                    <Badge className={`text-xs ${getScoreColor(resume.atsScore)}`}>
                      {getScoreLabel(resume.atsScore)}
                    </Badge>
                  </div>
                  <Progress value={resume.atsScore} className="h-1.5" />
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </Card>
  );
}
