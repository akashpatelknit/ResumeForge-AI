"use client";

import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PercentStepperProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
}

// -/+ stepper with a centered value box and a min-max range caption below,
// matching the reference Formatting panel's Heading/Body Size and Line
// Spacing controls.
export default function PercentStepper({
  value,
  min,
  max,
  step = 5,
  onChange,
}: PercentStepperProps) {
  const clamp = (v: number) => Math.min(max, Math.max(min, v));

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-8"
          disabled={value <= min}
          onClick={() => onChange(clamp(value - step))}
        >
          <Minus className="size-3.5" />
        </Button>
        <div
          className={cn(
            "flex h-8 w-16 items-center justify-center rounded-md border text-sm font-semibold",
          )}
        >
          {value}%
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-8"
          disabled={value >= max}
          onClick={() => onChange(clamp(value + step))}
        >
          <Plus className="size-3.5" />
        </Button>
      </div>
      <span className="text-xs text-gray-400">
        {min}% - {max}%
      </span>
    </div>
  );
}
