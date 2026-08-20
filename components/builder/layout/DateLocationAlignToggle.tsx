"use client";

import { cn } from "@/lib/utils";
import type { DateLocationAlign } from "@/types/styleConfig";

interface DateLocationAlignToggleProps {
  value: DateLocationAlign;
  onChange: (value: DateLocationAlign) => void;
}

const OPTIONS: { value: DateLocationAlign; label: string }[] = [
  { value: "left", label: "Left" },
  { value: "right", label: "Right" },
];

// Two-button segmented control, each rendering a live preview of what the
// date/location line looks like at that alignment — matches the reference
// panel rather than a plain label-only toggle.
export default function DateLocationAlignToggle({
  value,
  onChange,
}: DateLocationAlignToggleProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {OPTIONS.map((option) => {
        const active = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              "rounded-lg border px-4 py-3 text-sm transition",
              option.value === "left" ? "text-left" : "text-right",
              active
                ? "border-blue-600 bg-blue-600 text-white"
                : "border-gray-200 bg-white text-gray-700 hover:border-gray-300",
            )}
          >
            <div>Jan 2025 | Location</div>
            <div className={cn("text-xs", active ? "text-blue-100" : "text-gray-400")}>
              {option.label}
            </div>
          </button>
        );
      })}
    </div>
  );
}
