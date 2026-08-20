"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FONT_OPTIONS, type PdfFontFamily } from "@/types/styleConfig";

interface FontSelectProps {
  label: string;
  value: PdfFontFamily;
  onChange: (value: PdfFontFamily) => void;
}

export default function FontSelect({ label, value, onChange }: FontSelectProps) {
  return (
    <div className="space-y-1.5">
      <p className="text-sm text-gray-700">{label}</p>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {FONT_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
