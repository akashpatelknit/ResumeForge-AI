import type { DateFormat } from "@/types/styleConfig";

const MONTH_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];
const MONTH_FULL = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// Resume dates are stored as "YYYY-MM" (see lib/seedResumeData.ts,
// components/builder/sections/ExperienceSection.tsx). Anything that doesn't
// match — "Present", a freeform string from an older/imported resume — is
// shown as-is rather than mangled.
export function formatResumeDate(value: string | null | undefined, format: DateFormat): string {
  if (!value) return "Present";

  const match = /^(\d{4})-(\d{2})$/.exec(value.trim());
  if (!match) return value;

  const year = match[1];
  const monthIndex = Number(match[2]) - 1;
  if (monthIndex < 0 || monthIndex > 11) return value;

  switch (format) {
    case "full-name":
      return `${MONTH_FULL[monthIndex]} ${year}`;
    case "numeric":
      return `${match[2]}/${year}`;
    case "year-only":
      return year;
    case "short-name":
    default:
      return `${MONTH_SHORT[monthIndex]} ${year}`;
  }
}
