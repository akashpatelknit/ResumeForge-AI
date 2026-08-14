import React from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Sparkles, TrendingUp, Lightbulb, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { AppResume } from "@/types/resume";

interface AIInsightsProps {
  resumes: AppResume[];
  isLoading: boolean;
}

interface Recommendation {
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
  color: string;
  borderColor: string;
}

// Capped at 2, and every item here targets a *real* resume (by id/title/
// score) pulled from the actual fetched list — never a fabricated example.
//
// TODO(dashboard): the suggestion *copy* below is still a static template
// ("Run the analyzer for specific fixes"), not model-generated text. The
// ATS analyzer (app/api/ai/analyze-jd/route.ts) already writes real
// per-resume Gemini suggestions into ResumeAnalytics (`ats_analysis`
// events, see lib/db/resumes.ts's trackEvent/getResumeAnalytics), but
// there's no API route yet exposing that history to the client. Once one
// exists, swap the templated description below for that resume's actual
// latest suggestion instead of writing a new one here.
function buildRecommendations(resumes: AppResume[]): Recommendation[] {
  const active = resumes.filter((r) => !r.isArchived);
  if (active.length === 0) return [];

  const recs: Recommendation[] = [];

  const lowest = [...active].sort(
    (a, b) => (a.atsScore ?? 0) - (b.atsScore ?? 0),
  )[0];
  if (lowest && (lowest.atsScore ?? 0) < 85) {
    recs.push({
      icon: TrendingUp,
      title: "Boost ATS Score",
      description: `"${lowest.title}" is scoring ${lowest.atsScore ?? 0}/100 — your lowest. Run the analyzer for specific fixes.`,
      href: "/dashboard/jobs/analyzer",
      color: "text-purple-600 bg-purple-100",
      borderColor: "border-purple-200",
    });
  }

  const incomplete = active.find(
    (r) => !r.summary?.trim() || r.skills.length === 0,
  );
  if (incomplete) {
    const missing = !incomplete.summary?.trim()
      ? "a professional summary"
      : "any skills";
    recs.push({
      icon: Lightbulb,
      title: "Complete Your Resume",
      description: `"${incomplete.title}" is missing ${missing} — that's often the first thing recruiters check.`,
      href: `/builder/${incomplete.id}`,
      color: "text-blue-600 bg-blue-100",
      borderColor: "border-blue-200",
    });
  }

  return recs.slice(0, 2);
}

export default function AIInsights({ resumes, isLoading }: AIInsightsProps) {
  const recommendations = buildRecommendations(resumes);

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

      {/* Recommendations */}
      <div className="p-6 space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-8 text-gray-400 text-sm">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading...
          </div>
        ) : recommendations.length === 0 ? (
          <div className="flex flex-col items-center text-center gap-2 py-8">
            <CheckCircle2 className="w-6 h-6 text-green-500" />
            <p className="text-sm text-gray-600">
              {resumes.length === 0
                ? "Add a resume to get personalized recommendations."
                : "Your resumes look solid — no urgent recommendations right now."}
            </p>
          </div>
        ) : (
          recommendations.map((rec) => {
            const Icon = rec.icon;
            return (
              <Link
                key={rec.title}
                href={rec.href}
                className={`
                  group relative block p-4 rounded-xl border ${rec.borderColor} bg-white
                  hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300
                `}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2 rounded-lg ${rec.color} shrink-0 group-hover:scale-110 transition-transform`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm text-gray-900 mb-1">
                      {rec.title}
                    </h3>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {rec.description}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 shrink-0 group-hover:translate-x-1 group-hover:text-gray-600 transition-all" />
                </div>
              </Link>
            );
          })
        )}
      </div>

      {/* Bottom decoration */}
      <div className="h-1 bg-linear-to-r from-purple-600 via-blue-600 to-purple-600"></div>
    </Card>
  );
}
