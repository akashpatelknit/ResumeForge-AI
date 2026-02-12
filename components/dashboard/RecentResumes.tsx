import React from "react";
import {
  MoreVertical,
  Edit,
  Download,
  Copy,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

const resumes = [
  {
    id: 1,
    title: "Full Stack Developer Resume",
    template: "Modern",
    lastModified: "2 hours ago",
    atsScore: 91,
    thumbnail:
      "https://api.dicebear.com/7.x/shapes/svg?seed=resume1&backgroundColor=8b5cf6",
  },
  {
    id: 2,
    title: "Senior Frontend Engineer CV",
    template: "Professional",
    lastModified: "Yesterday",
    atsScore: 82,
    thumbnail:
      "https://api.dicebear.com/7.x/shapes/svg?seed=resume2&backgroundColor=3b82f6",
  },
  {
    id: 3,
    title: "Product Manager Application",
    template: "Minimal",
    lastModified: "3 days ago",
    atsScore: 75,
    thumbnail:
      "https://api.dicebear.com/7.x/shapes/svg?seed=resume3&backgroundColor=10b981",
  },
  {
    id: 4,
    title: "UX Designer Portfolio Resume",
    template: "Modern",
    lastModified: "1 week ago",
    atsScore: 67,
    thumbnail:
      "https://api.dicebear.com/7.x/shapes/svg?seed=resume4&backgroundColor=ec4899",
  },
  {
    id: 5,
    title: "Data Scientist CV",
    template: "Professional",
    lastModified: "2 weeks ago",
    atsScore: 88,
    thumbnail:
      "https://api.dicebear.com/7.x/shapes/svg?seed=resume5&backgroundColor=f59e0b",
  },
];

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

export default function RecentResumes() {
  return (
    <Card className="overflow-hidden border shadow-sm p-0">
      <div className="p-6 border-b border-gray-100 bg-linear-to-r from-gray-50 to-transparent">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Recent Resumes</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Your latest resume drafts
            </p>
          </div>
          <button className="flex items-center gap-2 text-sm font-medium text-purple-600 hover:text-purple-700 transition-colors group">
            View All
            <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>
        </div>
      </div>

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
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {resumes.map((resume) => (
              <tr
                key={resume.id}
                className="hover:bg-gray-50/50 transition-colors group cursor-pointer"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="font-medium text-gray-900 group-hover:text-purple-600 transition-colors">
                        {resume.title}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <Badge variant="outline" className="font-medium">
                    {resume.template}
                  </Badge>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-600">
                    {resume.lastModified}
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
                <td className="px-6 py-4">
                  <div className="flex items-center gap-0">
                    <button className="p-2 rounded-lg hover:bg-purple-50 text-gray-600 hover:text-purple-600 transition-all group/btn">
                      <Edit className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-blue-50 text-gray-600 hover:text-blue-600 transition-all group/btn">
                      <Download className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-green-50 text-gray-600 hover:text-green-600 transition-all group/btn">
                      <Copy className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-red-50 text-gray-600 hover:text-red-600 transition-all group/btn">
                      <Trash2 className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden divide-y divide-gray-100">
        {resumes.map((resume) => (
          <div
            key={resume.id}
            className="p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-start gap-3 mb-3">
              <div className="w-12 h-14 rounded-lg overflow-hidden shadow-sm ring-1 ring-gray-200">
                <img
                  src={resume.thumbnail}
                  alt={resume.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 truncate">
                  {resume.title}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {resume.template}
                  </Badge>
                  <span className="text-xs text-gray-500">
                    {resume.lastModified}
                  </span>
                </div>
              </div>
            </div>
            <div className="space-y-2 mb-3">
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
            <div className="flex items-center justify-end gap-2">
              <button className="p-2 rounded-lg hover:bg-purple-50 text-gray-600 hover:text-purple-600 transition-all">
                <Edit className="w-4 h-4" />
              </button>
              <button className="p-2 rounded-lg hover:bg-blue-50 text-gray-600 hover:text-blue-600 transition-all">
                <Download className="w-4 h-4" />
              </button>
              <button className="p-2 rounded-lg hover:bg-green-50 text-gray-600 hover:text-green-600 transition-all">
                <Copy className="w-4 h-4" />
              </button>
              <button className="p-2 rounded-lg hover:bg-red-50 text-gray-600 hover:text-red-600 transition-all">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
