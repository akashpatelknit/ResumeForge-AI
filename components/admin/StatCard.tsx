import { ArrowUp, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// Shared by the Dashboard and Subscriptions overview rows. Colors up/down
// by sign alone (green up, red down) rather than by whether the metric is
// "good" or "bad" — e.g. Cancelled This Month going down still renders
// green-up/red-down purely on arithmetic sign, matching the reference
// design's convention rather than a metric-aware good/bad judgment.
export function StatCard({
  label,
  value,
  icon: Icon,
  iconBg,
  iconColor,
  changePct,
  changeFallback = "No change data yet",
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  // null when there's no honest comparison to show — renders changeFallback
  // instead of a fabricated percentage.
  changePct: number | null;
  changeFallback?: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className={cn("mb-4 flex h-11 w-11 items-center justify-center rounded-full", iconBg)}>
        <Icon className={cn("h-5 w-5", iconColor)} />
      </div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
      {changePct !== null ? (
        <p className="mt-2 flex items-center gap-1.5 text-xs">
          <span
            className={cn(
              "flex items-center gap-0.5 font-medium",
              changePct >= 0 ? "text-emerald-600" : "text-red-600",
            )}
          >
            <ArrowUp className={cn("h-3 w-3", changePct < 0 && "rotate-180")} />
            {Math.abs(changePct).toFixed(1)}%
          </span>
          <span className="text-gray-400">vs last month</span>
        </p>
      ) : (
        <p className="mt-2 text-xs text-gray-400">{changeFallback}</p>
      )}
    </div>
  );
}
