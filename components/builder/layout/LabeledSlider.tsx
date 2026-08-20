"use client";

import { Slider } from "@/components/ui/slider";

interface LabeledSliderProps {
  label: string;
  value: number;
  unit: string;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}

// One row of the Margins & Paddings group — a slider paired with its
// current value, matching the reference layout panel (label above,
// value pinned to the right of the track).
export default function LabeledSlider({
  label,
  value,
  unit,
  min,
  max,
  step,
  onChange,
}: LabeledSliderProps) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </p>
      <div className="flex items-center gap-4">
        <Slider
          value={[value]}
          min={min}
          max={max}
          step={step}
          onValueChange={([v]) => onChange(v)}
          className="flex-1"
        />
        <span className="w-14 shrink-0 text-right text-sm font-medium text-gray-700">
          {value}
          {unit}
        </span>
      </div>
    </div>
  );
}
