"use client";

import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { AlertTriangle, Box, Crown, FileDown, FileText, Layers, Lock, Pencil, Save, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { PlanConfig } from "@/app/generated/prisma/client";

type EditableField = "proPriceInr" | "freeResumeLimit" | "freeAiGenerationLimit" | "proAiCreditLimit";

interface PlanRow {
  icon: typeof FileText;
  label: string;
  value: ReactNode;
  editField?: EditableField;
}

function EditableRow({
  row,
  editingField,
  setEditingField,
  onChange,
}: {
  row: PlanRow;
  editingField: EditableField | null;
  setEditingField: (field: EditableField | null) => void;
  onChange: (field: EditableField, value: string) => void;
}) {
  const Icon = row.icon;
  const isEditing = row.editField && editingField === row.editField;

  return (
    <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-4 py-3.5 last:border-b-0">
      <div className="flex min-w-0 items-center gap-2.5">
        <Icon className="h-4 w-4 shrink-0 text-gray-400" />
        <span className="truncate text-sm text-gray-700">{row.label}</span>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {isEditing ? (
          <input
            type="number"
            min={0}
            autoFocus
            defaultValue={typeof row.value === "number" ? row.value : undefined}
            onFocus={(e) => e.target.select()}
            onChange={(e) => onChange(row.editField!, e.target.value)}
            onBlur={() => setEditingField(null)}
            onKeyDown={(e) => e.key === "Enter" && setEditingField(null)}
            className="h-8 w-20 rounded-md border border-brand-purple/40 px-2 text-right text-sm text-gray-900 outline-none focus:ring-2 focus:ring-brand-purple/10"
          />
        ) : (
          <span className="text-sm font-medium text-gray-900">{row.value}</span>
        )}
        <button
          type="button"
          onClick={() =>
            row.editField
              ? setEditingField(row.editField)
              : toast.info("This is fixed product copy, not a stored setting yet.")
          }
          className="cursor-pointer rounded-md border border-gray-200 p-1.5 text-gray-400 hover:bg-gray-50 hover:text-gray-600"
          aria-label={`Edit ${row.label}`}
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

function PlanCard({
  icon: Icon,
  iconBg,
  iconColor,
  name,
  tagline,
  priceInr,
  priceEditField,
  popular,
  rows,
  editingField,
  setEditingField,
  onChange,
}: {
  icon: typeof Box;
  iconBg: string;
  iconColor: string;
  name: string;
  tagline: string;
  priceInr: number;
  // undefined for Free — its ₹0 price isn't a stored value, so it's never
  // editable.
  priceEditField?: EditableField;
  popular?: boolean;
  rows: PlanRow[];
  editingField: EditableField | null;
  setEditingField: (field: EditableField | null) => void;
  onChange: (field: EditableField, value: string) => void;
}) {
  const isEditingPrice = priceEditField && editingField === priceEditField;

  return (
    <div
      className={cn(
        "relative rounded-2xl border bg-white p-6 shadow-sm",
        popular ? "border-brand-purple ring-1 ring-brand-purple" : "border-gray-200",
      )}
    >
      {popular && (
        <span className="absolute top-6 right-6 inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-brand-purple">
          Popular
        </span>
      )}

      <div className="flex items-center gap-3">
        <div className={cn("flex h-11 w-11 items-center justify-center rounded-full", iconBg)}>
          <Icon className={cn("h-5 w-5", iconColor)} />
        </div>
        <div>
          <p className="text-lg font-semibold text-gray-900">{name}</p>
          <p className="text-sm text-gray-500">{tagline}</p>
        </div>
      </div>

      <div className="mt-5 flex items-baseline gap-1.5">
        {isEditingPrice ? (
          <span className="flex items-baseline gap-1 text-3xl font-bold text-gray-900">
            ₹
            <input
              type="number"
              min={0}
              autoFocus
              defaultValue={priceInr}
              onFocus={(e) => e.target.select()}
              onChange={(e) => onChange(priceEditField!, e.target.value)}
              onBlur={() => setEditingField(null)}
              onKeyDown={(e) => e.key === "Enter" && setEditingField(null)}
              className="w-20 rounded-md border border-brand-purple/40 px-1.5 text-3xl font-bold text-gray-900 outline-none focus:ring-2 focus:ring-brand-purple/10"
            />
          </span>
        ) : (
          <span className="text-3xl font-bold text-gray-900">₹{priceInr}</span>
        )}
        <span className="text-sm text-gray-500">/ month</span>
        {priceEditField && !isEditingPrice && (
          <button
            type="button"
            onClick={() => setEditingField(priceEditField)}
            className="ml-1 cursor-pointer rounded-md border border-gray-200 p-1.5 text-gray-400 hover:bg-gray-50 hover:text-gray-600"
            aria-label="Edit price"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <p className="mt-6 text-xs font-medium tracking-wide text-gray-500 uppercase">Plan Limits &amp; Features</p>
      <div className="mt-2 overflow-hidden rounded-xl border border-gray-200">
        {rows.map((row) => (
          <EditableRow
            key={row.label}
            row={row}
            editingField={editingField}
            setEditingField={setEditingField}
            onChange={onChange}
          />
        ))}
      </div>
    </div>
  );
}

export function PlanConfigForm({ initialConfig }: { initialConfig: PlanConfig }) {
  const [proPriceInr, setProPriceInr] = useState(initialConfig.proPriceInr);
  const [freeResumeLimit, setFreeResumeLimit] = useState(initialConfig.freeResumeLimit);
  const [freeAiGenerationLimit, setFreeAiGenerationLimit] = useState(initialConfig.freeAiGenerationLimit);
  const [proAiCreditLimit, setProAiCreditLimit] = useState(initialConfig.proAiCreditLimit);
  const [editingField, setEditingField] = useState<EditableField | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const isDirty =
    proPriceInr !== initialConfig.proPriceInr ||
    freeResumeLimit !== initialConfig.freeResumeLimit ||
    freeAiGenerationLimit !== initialConfig.freeAiGenerationLimit ||
    proAiCreditLimit !== initialConfig.proAiCreditLimit;

  function handleChange(field: EditableField, raw: string) {
    const value = Number(raw);
    if (Number.isNaN(value) || value < 0) return;
    if (field === "proPriceInr") setProPriceInr(value);
    if (field === "freeResumeLimit") setFreeResumeLimit(value);
    if (field === "freeAiGenerationLimit") setFreeAiGenerationLimit(value);
    if (field === "proAiCreditLimit") setProAiCreditLimit(value);
  }

  async function handleSave() {
    setIsSaving(true);
    try {
      const response = await fetch("/api/admin/plan-config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proPriceInr, freeResumeLimit, freeAiGenerationLimit, proAiCreditLimit }),
      });
      if (!response.ok) throw new Error();
      toast.success("Plan config saved.");
    } catch {
      toast.error("Failed to save plan config.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <PlanCard
          icon={Box}
          iconBg="bg-gray-100"
          iconColor="text-gray-500"
          name="Free"
          tagline="For job seekers getting started"
          priceInr={0}
          rows={[
            { icon: FileText, label: "Resumes per user", value: freeResumeLimit, editField: "freeResumeLimit" },
            {
              icon: Sparkles,
              label: "AI credits / month",
              value: freeAiGenerationLimit,
              editField: "freeAiGenerationLimit",
            },
            { icon: Layers, label: "Template access", value: "Basic (5 templates)" },
            { icon: FileDown, label: "PDF export", value: "Standard" },
          ]}
          editingField={editingField}
          setEditingField={setEditingField}
          onChange={handleChange}
        />

        <PlanCard
          popular
          icon={Crown}
          iconBg="bg-purple-100"
          iconColor="text-brand-purple"
          name="Pro"
          tagline="For professionals who want more"
          priceInr={proPriceInr}
          priceEditField="proPriceInr"
          rows={[
            { icon: FileText, label: "Resumes per user", value: "Unlimited" },
            {
              icon: Sparkles,
              label: "AI credits / month",
              value: proAiCreditLimit,
              editField: "proAiCreditLimit",
            },
            { icon: Layers, label: "Template access", value: "All templates" },
            { icon: FileDown, label: "PDF export", value: "High quality" },
          ]}
          editingField={editingField}
          setEditingField={setEditingField}
          onChange={handleChange}
        />
      </div>

      <div className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
        <AlertTriangle className="h-5 w-5 shrink-0 text-amber-500" />
        <div>
          <p className="text-sm font-semibold text-amber-900">Important</p>
          <p className="mt-0.5 text-sm text-amber-800">
            Changing the price here only updates what&apos;s displayed and enforced in-app — you must also update
            the plan in your Razorpay dashboard separately for actual billing to match.
          </p>
        </div>
      </div>

      <div className="flex flex-col items-end gap-1.5">
        <Button
          onClick={handleSave}
          disabled={!isDirty || isSaving}
          className={cn(
            "gap-2",
            isDirty ? "bg-brand-purple text-white hover:bg-brand-purple/90" : "bg-gray-200 text-gray-400",
          )}
        >
          {isDirty ? <Save className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
          {isSaving ? "Saving…" : "Save Changes"}
        </Button>
        {!isDirty && <p className="text-xs text-gray-400">Make changes to any limit above to enable saving.</p>}
      </div>
    </div>
  );
}
