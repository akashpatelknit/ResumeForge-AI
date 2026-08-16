"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { AdminTemplateRow } from "@/lib/admin/templates";

type ToggleField = "isPro" | "isActive" | "isFeatured";

export function TemplatesTable({ initialTemplates }: { initialTemplates: AdminTemplateRow[] }) {
  const [templates, setTemplates] = useState(initialTemplates);
  const [pendingKey, setPendingKey] = useState<string | null>(null);

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

  return (
    <div className="rounded-md border border-slate-800">
      <Table>
        <TableHeader>
          <TableRow className="border-slate-800 hover:bg-transparent">
            <TableHead className="text-slate-400">Template</TableHead>
            <TableHead className="text-slate-400">Pro-gated</TableHead>
            <TableHead className="text-slate-400">Active</TableHead>
            <TableHead className="text-slate-400">Featured</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {templates.map((template) => (
            <TableRow key={template.templateId} className="border-slate-800 hover:bg-slate-900/50">
              <TableCell>
                <div className="flex items-center gap-2">
                  <span className="text-slate-200">{template.name}</span>
                  {template.comingSoon && (
                    <Badge variant="outline" className="border-slate-700 text-slate-400">
                      Coming soon
                    </Badge>
                  )}
                </div>
                <div className="text-xs text-slate-500">{template.description}</div>
              </TableCell>
              <TableCell>
                <Switch
                  checked={template.isPro}
                  disabled={pendingKey === `${template.templateId}:isPro`}
                  onCheckedChange={(checked) => toggle(template.templateId, "isPro", checked)}
                />
              </TableCell>
              <TableCell>
                <Switch
                  checked={template.isActive}
                  disabled={pendingKey === `${template.templateId}:isActive`}
                  onCheckedChange={(checked) => toggle(template.templateId, "isActive", checked)}
                />
              </TableCell>
              <TableCell>
                <Switch
                  checked={template.isFeatured}
                  disabled={pendingKey === `${template.templateId}:isFeatured`}
                  onCheckedChange={(checked) => toggle(template.templateId, "isFeatured", checked)}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
