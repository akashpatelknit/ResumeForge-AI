import React from "react";
import { LucideIcon, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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

const accentColorClasses = {
  purple: "from-purple-500/10 to-purple-600/5 border-purple-200/50",
  blue: "from-blue-500/10 to-blue-600/5 border-blue-200/50",
  green: "from-green-500/10 to-green-600/5 border-green-200/50",
  pink: "from-pink-500/10 to-pink-600/5 border-pink-200/50",
};

const iconColorClasses = {
  purple: "text-purple-600 bg-purple-100",
  blue: "text-blue-600 bg-blue-100",
  green: "text-green-600 bg-green-100",
  pink: "text-pink-600 bg-pink-100",
};

const badgeColorClasses = {
  green: "bg-green-100 text-green-700 border-green-200",
  blue: "bg-blue-100 text-blue-700 border-blue-200",
  purple: "bg-purple-100 text-purple-700 border-purple-200",
  red: "bg-red-100 text-red-700 border-red-200",
};

export default function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  trendPositive,
  badge,
  badgeColor = "green",
  accentColor,
}: StatsCardProps) {
  return (
    <Card
      className={`
        group relative overflow-hidden bg-linear-to-br ${accentColorClasses[accentColor]}
        border shadow-sm hover:shadow-xl transition-all duration-300 
        hover:-translate-y-1 cursor-pointer h-full
      `}
    >
      <div className="p-5 py-0 h-full flex flex-col">
        {/* Icon */}
        <div className="flex items-start justify-between mb-3">
          <div
            className={`p-2.5 rounded-xl ${iconColorClasses[accentColor]} group-hover:scale-110 transition-transform duration-300`}
          >
            <Icon className="w-4 h-4" />
          </div>
          {badge && (
            <Badge
              variant="outline"
              className={`${badgeColorClasses[badgeColor]} border font-semibold text-xs px-2.5 py-0.5`}
            >
              {badge}
            </Badge>
          )}
        </div>

        {/* Value */}
        <div className="space-y-1 flex-1">
          <h3 className="text-sm font-medium text-gray-600">{title}</h3>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>

        {/* Trend */}
        {trend && (
          <div className="flex items-center gap-1.5 mt-auto pt-3">
            <TrendingUp
              className={`w-4 h-4 ${
                trendPositive ? "text-green-600" : "text-red-600"
              }`}
            />
            <span
              className={`text-sm font-medium ${
                trendPositive ? "text-green-600" : "text-red-600"
              }`}
            >
              {trend}
            </span>
          </div>
        )}
      </div>

      {/* Decorative gradient overlay */}
      <div
        className={`absolute inset-0 bg-linear-to-br ${accentColorClasses[accentColor]} opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10`}
      ></div>
    </Card>
  );
}
