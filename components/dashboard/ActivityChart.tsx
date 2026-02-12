import React from "react";
import { Card } from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const chartData = [
  { date: "Mon", downloads: 12, views: 24 },
  { date: "Tue", downloads: 15, views: 32 },
  { date: "Wed", downloads: 8, views: 18 },
  { date: "Thu", downloads: 18, views: 38 },
  { date: "Fri", downloads: 22, views: 45 },
  { date: "Sat", downloads: 14, views: 28 },
  { date: "Sun", downloads: 10, views: 22 },
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl shadow-lg p-3">
        <p className="text-xs font-semibold text-gray-600 mb-2">
          {payload[0].payload.date}
        </p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-gray-600">{entry.name}:</span>
            <span className="font-bold text-gray-900">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function ActivityChart() {
  return (
    <Card className="overflow-hidden border shadow-sm">
      <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-purple-50/50 via-blue-50/30 to-transparent">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Activity Overview
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Last 7 days performance
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 text-xs font-medium text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
              Week
            </button>
            <button className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              Month
            </button>
            <button className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              Year
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorDownloads" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#e5e7eb"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              stroke="#9ca3af"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#9ca3af"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ stroke: "#e5e7eb", strokeWidth: 1 }}
            />
            <Legend
              wrapperStyle={{ paddingTop: "20px" }}
              iconType="circle"
              iconSize={8}
              formatter={(value) => (
                <span className="text-sm font-medium text-gray-700">
                  {value}
                </span>
              )}
            />
            <Area
              type="monotone"
              dataKey="downloads"
              name="Downloads"
              stroke="#8b5cf6"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorDownloads)"
              activeDot={{ r: 6, strokeWidth: 2, stroke: "#fff" }}
            />
            <Area
              type="monotone"
              dataKey="views"
              name="Views"
              stroke="#3b82f6"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorViews)"
              activeDot={{ r: 6, strokeWidth: 2, stroke: "#fff" }}
            />
          </AreaChart>
        </ResponsiveContainer>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-100">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-purple-600"></div>
              <span className="text-sm font-medium text-gray-600">
                Total Downloads
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900">99</p>
            <p className="text-xs text-green-600 font-medium mt-1">
              +23% from last week
            </p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-blue-600"></div>
              <span className="text-sm font-medium text-gray-600">
                Total Views
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900">207</p>
            <p className="text-xs text-green-600 font-medium mt-1">
              +18% from last week
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
