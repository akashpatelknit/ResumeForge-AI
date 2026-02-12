"use client";
import Sidebar from "@/components/shared/Sidebar";
import DashboardHeader from "@/components/shared/DashboardHeader";
import StatsCard from "@/components/dashboard/StatsCard";
import QuickActions from "@/components/dashboard/QuickActions";
import RecentResumes from "@/components/dashboard/RecentResumes";
import ActivityChart from "@/components/dashboard/ActivityChart";
import AIInsights from "@/components/dashboard/AIInsights";
import { FileText, Download, Target, Sparkles } from "lucide-react";

export default function DashboardPage() {
  const stats: Array<{
    title: string;
    value: string;
    icon: any;
    trend?: string;
    trendPositive?: boolean;
    badge?: string;
    badgeColor?: "green" | "blue" | "purple" | "red";
    accentColor: "purple" | "blue" | "green" | "pink";
  }> = [
    {
      title: "Total Resumes",
      value: "12",
      icon: FileText,
      trend: "+2 this month",
      trendPositive: true,
      accentColor: "purple",
    },
    {
      title: "Total Downloads",
      value: "48",
      icon: Download,
      trend: "+15%",
      trendPositive: true,
      accentColor: "blue",
    },
    {
      title: "ATS Score Average",
      value: "87/100",
      icon: Target,
      badge: "Excellent",
      badgeColor: "green",
      accentColor: "green",
    },
    {
      title: "AI Optimizations",
      value: "24",
      icon: Sparkles,
      trend: "+8 this week",
      trendPositive: true,
      accentColor: "pink",
    },
  ];

  return (
    <div className="flex min-h-screen bg-linear-to-br from-slate-50 via-blue-50/30 to-purple-50/20">
      <Sidebar />

      <div className="flex-1 lg:ml-64">
        <DashboardHeader />

        <main className="p-6 lg:p-8 animate-fadeIn">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <div
                key={stat.title}
                style={{ animationDelay: `${index * 100}ms` }}
                className="animate-slideUp"
              >
                <StatsCard {...stat} />
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div
            className="mb-8 animate-slideUp"
            style={{ animationDelay: "400ms" }}
          >
            <QuickActions />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content - 2/3 width */}
            <div className="lg:col-span-2 space-y-8">
              {/* Recent Resumes */}
              <div
                className="animate-slideUp"
                style={{ animationDelay: "500ms" }}
              >
                <RecentResumes />
              </div>

              {/* Activity Chart */}
              {/* <div
                className="animate-slideUp"
                style={{ animationDelay: "600ms" }}
              >
                <ActivityChart />
                <ActivityChart />
                <ActivityChart />
                <ActivityChart />
              </div> */}
            </div>

            {/* Sidebar - 1/3 width */}
            <div
              className="animate-slideUp"
              style={{ animationDelay: "700ms" }}
            >
              <AIInsights />
            </div>
          </div>
        </main>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }

        .animate-slideUp {
          opacity: 0;
          animation: slideUp 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
