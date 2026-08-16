"use client";

import * as React from "react";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

// Resume dates only ever need month + year precision ("2022-06") — this
// mirrors the native <input type="month"> it replaces rather than a full
// day-level shadcn Calendar, which would force picking a day nobody uses.
function parseMonthValue(value?: string | null): { year: number; month: number } | null {
  if (!value) return null;
  const match = /^(\d{4})-(\d{2})$/.exec(value);
  if (!match) return null;
  return { year: Number(match[1]), month: Number(match[2]) };
}

function formatMonthValue(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, "0")}`;
}

export interface MonthYearPickerProps {
  id?: string;
  value?: string | null;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  // When provided, renders a button in the popover that clears the value
  // (calls this instead of onChange) and shows `clearLabel` on the
  // trigger instead of `placeholder` while the value is empty — used for
  // Experience.endDate, where empty means "currently working here".
  onClear?: () => void;
  clearLabel?: string;
}

export function MonthYearPicker({
  id,
  value,
  onChange,
  placeholder = "Select month",
  disabled,
  className,
  onClear,
  clearLabel = "Present",
}: MonthYearPickerProps) {
  const [open, setOpen] = React.useState(false);
  const parsed = parseMonthValue(value);
  const [viewYear, setViewYear] = React.useState(parsed?.year ?? new Date().getFullYear());

  // Re-sync the visible year to whatever the value actually is each time
  // the popover opens, rather than remembering wherever it was last left.
  const handleOpenChange = (next: boolean) => {
    if (next) setViewYear(parsed?.year ?? new Date().getFullYear());
    setOpen(next);
  };

  const handleSelectMonth = (month: number) => {
    onChange(formatMonthValue(viewYear, month));
    setOpen(false);
  };

  const label = parsed
    ? `${MONTH_LABELS[parsed.month - 1]} ${parsed.year}`
    : onClear
      ? clearLabel
      : placeholder;

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start gap-2 font-normal",
            !parsed && "text-muted-foreground",
            className,
          )}
        >
          <CalendarIcon className="h-4 w-4 shrink-0" />
          {label}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-3">
        <div className="mb-2 flex items-center justify-between">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => setViewYear((y) => y - 1)}
            aria-label="Previous year"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium">{viewYear}</span>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => setViewYear((y) => y + 1)}
            aria-label="Next year"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-1">
          {MONTH_LABELS.map((label, idx) => {
            const month = idx + 1;
            const isSelected = parsed?.year === viewYear && parsed?.month === month;
            return (
              <Button
                key={label}
                type="button"
                variant={isSelected ? "default" : "ghost"}
                size="sm"
                className="h-8"
                onClick={() => handleSelectMonth(month)}
              >
                {label}
              </Button>
            );
          })}
        </div>

        {onClear && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="mt-2 w-full text-muted-foreground"
            onClick={() => {
              onClear();
              setOpen(false);
            }}
          >
            Clear ({clearLabel})
          </Button>
        )}
      </PopoverContent>
    </Popover>
  );
}
