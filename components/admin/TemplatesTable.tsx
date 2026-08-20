"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { FileText, MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NumberedPagination } from "@/components/admin/NumberedPagination";
import type { AdminTemplateRow } from "@/lib/admin/templates";

type ToggleField = "isPro" | "isActive" | "isFeatured";
type SortKey = "newest" | "most-used" | "alphabetical";

const PAGE_SIZE = 6;

export function TemplatesTable({ initialTemplates }: { initialTemplates: AdminTemplateRow[] }) {
  const [templates, setTemplates] = useState(initialTemplates);
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [sort, setSort] = useState<SortKey>("newest");
  const [page, setPage] = useState(1);

  async function toggle(templateId: string, field: ToggleField, nextValue: boolean) {
    const key = `${templateId}:${field}`;
    setPendingKey(key);
    try {
      const response = await fetch(`/api/admin/templates/${templateId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: nextValue }),
      });
      if (!response.ok) throw new Error();

      setTemplates((prev) => prev.map((t) => (t.templateId === templateId ? { ...t, [field]: nextValue } : t)));
      toast.success("Template updated.");
    } catch {
      toast.error("Failed to update template.");
    } finally {
      setPendingKey(null);
    }
  }

  // "Newest" preserves the registry's own order (config/templates.ts) since
  // templates don't carry a createdAt of their own — everything else sorts
  // over data we actually have.
  const sorted = useMemo(() => {
    if (sort === "most-used") return [...templates].sort((a, b) => b.usageCount - a.usageCount);
    if (sort === "alphabetical") return [...templates].sort((a, b) => a.name.localeCompare(b.name));
    return templates;
  }, [templates, sort]);

  const total = sorted.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const rangeStart = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, total);
  const pageRows = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-5">
      <div className="flex justify-end gap-2.5">
        <button
          type="button"
          onClick={() => toast.info("Filtering isn't wired up yet — coming in a follow-up pass.")}
          className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-white px-3.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Filter
        </button>
        <Select
          value={sort}
          onValueChange={(value) => {
            setSort(value as SortKey);
            setPage(1);
          }}
        >
          <SelectTrigger className="h-9 w-37.5 border-gray-200 bg-white text-sm text-gray-700">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Sort: Newest</SelectItem>
            <SelectItem value="most-used">Sort: Most used</SelectItem>
            <SelectItem value="alphabetical">Sort: A–Z</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {pageRows.map((template) => (
          <div
            key={template.templateId}
            className="flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
          >
            <div className="relative flex aspect-4/3 items-center justify-center bg-gray-50">
              <div className="flex h-3/5 w-3/5 items-center justify-center rounded-lg border border-dashed border-gray-300">
                {template.thumbnail ? (
                  // eslint-disable-next-line @next/next/no-img-element -- matches components/builder/TemplateCard.tsx's existing convention for these registry thumbnails
                  <img src={template.thumbnail} alt="" className="h-16 w-16 opacity-70" />
                ) : (
                  <FileText className="h-10 w-10 text-gray-400" strokeWidth={1.5} />
                )}
              </div>
            </div>

            <div className="flex flex-1 flex-col gap-4 p-5">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
                  {template.isPro && (
                    <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-brand-purple">
                      Pro
                    </span>
                  )}
                  {template.comingSoon && (
                    <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500">
                      Coming soon
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-gray-500">{template.description}</p>
              </div>

              <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                <span className="text-sm text-gray-500">Status</span>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={template.isActive}
                    disabled={template.comingSoon || pendingKey === `${template.templateId}:isActive`}
                    onCheckedChange={(checked) => toggle(template.templateId, "isActive", checked)}
                  />
                  <span className={cn("text-sm font-medium", template.isActive ? "text-emerald-600" : "text-gray-400")}>
                    {template.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                <span className="text-sm text-gray-500">
                  Used by {template.usageCount.toLocaleString()} {template.usageCount === 1 ? "user" : "users"}
                </span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="cursor-pointer rounded-md border border-gray-200 p-3.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 sm:p-1.5"
                      aria-label={`Actions for ${template.name}`}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      className="cursor-pointer"
                      disabled={pendingKey === `${template.templateId}:isPro`}
                      onClick={() => toggle(template.templateId, "isPro", !template.isPro)}
                    >
                      {template.isPro ? "Remove Pro gate" : "Make Pro-gated"}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="cursor-pointer"
                      disabled={pendingKey === `${template.templateId}:isFeatured`}
                      onClick={() => toggle(template.templateId, "isFeatured", !template.isFeatured)}
                    >
                      {template.isFeatured ? "Unfeature" : "Feature this template"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-gray-500">
          Showing {rangeStart} to {rangeEnd} of {total.toLocaleString()} templates
        </p>
        <NumberedPagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </div>
  );
}
