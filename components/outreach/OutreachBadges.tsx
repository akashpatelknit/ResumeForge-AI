import { cn } from "@/lib/utils";
import type { OutreachStatus, OutreachType } from "@/components/outreach/outreachData";
import { OUTREACH_TYPE_LABELS, STATUS_LABELS } from "@/components/outreach/outreachData";

export const OUTREACH_TYPE_STYLES: Record<OutreachType, { bg: string; text: string; dot: string }> = {
  cold: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
  general: { bg: "bg-gray-100", text: "text-gray-600", dot: "bg-gray-400" },
  referral: { bg: "bg-purple-50", text: "text-brand-purple", dot: "bg-brand-purple" },
  quickApply: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
};

export const STATUS_STYLES: Record<OutreachStatus, { text: string; dot: string }> = {
  approved: { text: "text-brand-purple", dot: "bg-brand-purple" },
  generated: { text: "text-blue-600", dot: "bg-blue-500" },
  scheduled: { text: "text-orange-600", dot: "bg-orange-500" },
  generating: { text: "text-indigo-600", dot: "bg-indigo-500" },
  sending: { text: "text-indigo-600", dot: "bg-indigo-500" },
  sent: { text: "text-emerald-600", dot: "bg-emerald-500" },
  replied: { text: "text-teal-600", dot: "bg-teal-500" },
  bounced: { text: "text-red-600", dot: "bg-red-500" },
  draft: { text: "text-gray-500", dot: "bg-gray-400" },
  failed: { text: "text-red-600", dot: "bg-red-500" },
};

// Muted, brand-adjacent tints keyed off the company's initial rather than
// exact brand colors — this is mock UI, not a real logo asset pipeline.
const LOGO_PALETTE = [
  { bg: "bg-blue-50", text: "text-blue-600" },
  { bg: "bg-emerald-50", text: "text-emerald-600" },
  { bg: "bg-rose-50", text: "text-rose-600" },
  { bg: "bg-indigo-50", text: "text-indigo-600" },
  { bg: "bg-orange-50", text: "text-orange-600" },
  { bg: "bg-cyan-50", text: "text-cyan-600" },
  { bg: "bg-amber-50", text: "text-amber-700" },
  { bg: "bg-sky-50", text: "text-sky-600" },
  { bg: "bg-fuchsia-50", text: "text-fuchsia-600" },
  { bg: "bg-teal-50", text: "text-teal-600" },
];

function paletteFor(company: string) {
  let hash = 0;
  for (let i = 0; i < company.length; i++) hash = (hash * 31 + company.charCodeAt(i)) >>> 0;
  return LOGO_PALETTE[hash % LOGO_PALETTE.length];
}

export function CompanyLogo({ company, size = "sm" }: { company: string; size?: "sm" | "lg" }) {
  const { bg, text } = paletteFor(company);
  const dims = size === "lg" ? "h-10 w-10 rounded-xl text-base" : "h-8 w-8 rounded-lg text-sm";
  return (
    <span
      className={cn("flex shrink-0 items-center justify-center font-bold", dims, bg, text)}
      aria-hidden
    >
      {company.charAt(0).toUpperCase()}
    </span>
  );
}

// `type` accepts null for real (not mock) rows on the Cold Outreach
// Dashboard whose outreachType hasn't been chosen yet (nullable until set
// via the Generate & Review panel — see prisma/schema.prisma's SavedJob
// comment) — every other existing call site only ever passes a real
// OutreachType, so this is purely additive.
export function OutreachTypeBadge({ type, className }: { type: OutreachType | null; className?: string }) {
  if (type === null) {
    return (
      <span
        className={cn(
          "inline-flex w-fit items-center rounded-full bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-400 whitespace-nowrap",
          className,
        )}
      >
        Not set
      </span>
    );
  }

  const style = OUTREACH_TYPE_STYLES[type];
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap",
        style.bg,
        style.text,
        className,
      )}
    >
      {OUTREACH_TYPE_LABELS[type]}
    </span>
  );
}

export function StatusBadge({ status }: { status: OutreachStatus }) {
  const style = STATUS_STYLES[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium whitespace-nowrap", style.text)}>
      <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", style.dot)} />
      {STATUS_LABELS[status]}
    </span>
  );
}
