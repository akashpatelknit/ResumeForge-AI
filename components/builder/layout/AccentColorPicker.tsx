"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { ACCENT_COLOR_PRESETS } from "@/types/styleConfig";

interface AccentColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

// Five preset swatches + a custom option, matching the reference panel.
// The custom swatch is a label wrapping a hidden native color input, so
// clicking it opens the OS color picker directly instead of a bespoke one.
export default function AccentColorPicker({
  value,
  onChange,
}: AccentColorPickerProps) {
  const isCustom = !ACCENT_COLOR_PRESETS.includes(value);

  return (
    <div className="flex items-center gap-3">
      {ACCENT_COLOR_PRESETS.map((color) => (
        <button
          key={color}
          type="button"
          aria-label={`Use accent color ${color}`}
          onClick={() => onChange(color)}
          className={cn(
            "flex size-9 items-center justify-center rounded-full border-2 transition",
            value === color ? "border-gray-900" : "border-transparent",
          )}
          style={{ backgroundColor: color }}
        >
          {value === color && <Check className="size-4 text-gray-900" />}
        </button>
      ))}

      <label
        aria-label="Choose a custom accent color"
        className={cn(
          "relative flex size-9 cursor-pointer items-center justify-center rounded-full border-2",
          isCustom ? "border-gray-900" : "border-transparent",
        )}
        style={{
          background:
            "conic-gradient(red, yellow, lime, cyan, blue, magenta, red)",
        }}
      >
        {isCustom && <Check className="size-4 text-white drop-shadow" />}
        <input
          type="color"
          value={isCustom ? value : "#000000"}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 size-full cursor-pointer opacity-0"
        />
      </label>
    </div>
  );
}
