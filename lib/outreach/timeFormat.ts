// The Send Scheduler UI's <Select> options are 12-hour strings like
// "09:00 AM" (app/(app)/dashboard/outreach/settings/page.tsx's
// timeOptions()); UserOutreachSettings stores 24-hour "HH:MM" since that's
// what the scheduling algorithm (lib/outreach/scheduling.ts) compares
// directly against Date#getHours()/getMinutes(). These convert at the API
// boundary so neither side needs to know about the other's format.

export function to24Hour(time12: string): string {
  const match = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(time12.trim());
  if (!match) {
    throw new Error(`Invalid 12-hour time: ${time12}`);
  }
  const [, hourStr, minuteStr, period] = match;
  let hour = Number(hourStr) % 12;
  if (period.toUpperCase() === "PM") hour += 12;
  return `${String(hour).padStart(2, "0")}:${minuteStr}`;
}

export function to12Hour(time24: string): string {
  const match = /^(\d{1,2}):(\d{2})$/.exec(time24.trim());
  if (!match) {
    throw new Error(`Invalid 24-hour time: ${time24}`);
  }
  const [, hourStr, minuteStr] = match;
  const hour = Number(hourStr);
  const period = hour < 12 ? "AM" : "PM";
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${String(hour12).padStart(2, "0")}:${minuteStr} ${period}`;
}
