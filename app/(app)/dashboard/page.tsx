"use client";

import StatsCard from "@/components/dashboard/StatsCard";
import QuickActions from "@/components/dashboard/QuickActions";
import RecentResumes from "@/components/dashboard/RecentResumes";
import AIInsights from "@/components/dashboard/AIInsights";
import { FileText, Download, Target, Sparkles, LucideIcon } from "lucide-react";
interface StatsCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: string;
  trendPositive?: boolean;
  badge?: string;
  badgeColor?: "green" | "blue" | "purple" | "red";
  accentColor: "purple" | "blue" | "green" | "pink";
}
export default function DashboardPage() {
  const stats: StatsCardProps[] = [
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
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <StatsCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="mb-4">
        <QuickActions />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-8">
          <RecentResumes />
        </div>

        <AIInsights />
      </div>
    </>
  );
}
