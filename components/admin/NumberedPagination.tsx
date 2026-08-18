"use client";

import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

// Builds the "1 2 3 4 5 … 1558" windowed page list — always keeps the
// first page, the last page, and a small range around the current page,
// collapsing everything else into a single ellipsis marker.
function getPageWindow(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages = new Set<number>([1, total]);
  for (let p = current - 1; p <= current + 1; p++) {
    if (p >= 1 && p <= total) pages.add(p);
  }
  if (current <= 3) for (let p = 1; p <= 5; p++) pages.add(p);
  if (current >= total - 2) for (let p = total - 4; p <= total; p++) if (p >= 1) pages.add(p);

  const sorted = Array.from(pages).sort((a, b) => a - b);
  const result: (number | "ellipsis")[] = [];
  let prev = 0;
  for (const p of sorted) {
    if (prev && p - prev > 1) result.push("ellipsis");
    result.push(p);
    prev = p;
  }
  return result;
}

// Shared by every admin table with client-side pagination (Dashboard's
// Users preview, Subscriptions). Purely presentational — the caller owns
// the current page and how a page change is fetched/sliced.
export function NumberedPagination({
  page,
  totalPages,
  onPageChange,
  disabled = false,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
}) {
  const pageWindow = getPageWindow(page, totalPages);

  function goToPage(nextPage: number) {
    if (nextPage < 1 || nextPage > totalPages || nextPage === page) return;
    onPageChange(nextPage);
  }

  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={() => goToPage(page - 1)}
        disabled={page <= 1 || disabled}
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-40"
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {pageWindow.map((entry, i) =>
        entry === "ellipsis" ? (
          <span key={`ellipsis-${i}`} className="flex h-9 w-9 items-center justify-center text-gray-400">
            <MoreHorizontal className="h-4 w-4" />
          </span>
        ) : (
          <button
            key={entry}
            type="button"
            onClick={() => goToPage(entry)}
            disabled={disabled}
            className={cn(
              "inline-flex h-9 w-9 items-center justify-center rounded-lg border text-sm font-medium transition-colors",
              entry === page
                ? "border-brand-purple bg-purple-50 text-brand-purple"
                : "border-gray-200 text-gray-600 hover:bg-gray-50",
            )}
            aria-current={entry === page ? "page" : undefined}
          >
            {entry}
          </button>
        ),
      )}

      <button
        type="button"
        onClick={() => goToPage(page + 1)}
        disabled={page >= totalPages || disabled}
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-40"
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
