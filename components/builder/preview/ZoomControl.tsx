"use client";

import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export const ZOOM_MIN = 0.5;
export const ZOOM_MAX = 2;
const ZOOM_STEP = 0.1;

interface ZoomControlProps {
  zoom: number;
  onChange: (zoom: number) => void;
}

// Lives in the builder header (BuilderToolbar's endSlot) rather than inside
// the preview panel itself — this and every other preview/editor control
// belongs in the top header, not floating inside individual panels.
export default function ZoomControl({ zoom, onChange }: ZoomControlProps) {
  return (
    <div className="flex items-center gap-1.5">
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        disabled={zoom <= ZOOM_MIN}
        onClick={() => onChange(Math.max(ZOOM_MIN, +(zoom - ZOOM_STEP).toFixed(2)))}
      >
        <Minus className="size-3.5" />
      </Button>
      <span className="w-11 text-center text-sm font-medium text-gray-700">
        {Math.round(zoom * 100)}%
      </span>
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        disabled={zoom >= ZOOM_MAX}
        onClick={() => onChange(Math.min(ZOOM_MAX, +(zoom + ZOOM_STEP).toFixed(2)))}
      >
        <Plus className="size-3.5" />
      </Button>
    </div>
  );
}
