// Pure scheduling algorithm for "Schedule Outreach" — no Prisma/DB access
// here, so the placement logic can be reasoned about (and unit tested)
// independently of how callers load/persist SavedJob rows.
//
// Time-of-day bucketing uses the server runtime's local Date methods
// (getHours/getDay/etc). There's no per-user timezone field on
// UserOutreachSettings yet, so "the sending window" and "daily cap resets
// at midnight" are both relative to wherever the process runs (UTC on
// Vercel) — a known v1 simplification, not a per-user IST/PST window.

export interface OutreachScheduleSettings {
  dailySendLimit: number;
  sendWindowStart: string; // "HH:MM", 24-hour
  sendWindowEnd: string; // "HH:MM", 24-hour
  weekdaysOnly: boolean;
  jitterEnabled: boolean;
  jitterMinSeconds: number;
  jitterMaxSeconds: number;
}

export interface JobToSchedule {
  id: string;
  /** Number of sends this job counts as against the daily cap — one per contact email. */
  units: number;
}

function toMinutesOfDay(hhmm: string): number {
  const [h, m] = hhmm.split(":").map((n) => Number(n));
  return (h || 0) * 60 + (m || 0);
}

function dateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function isValidDay(date: Date, weekdaysOnly: boolean): boolean {
  if (!weekdaysOnly) return true;
  const day = date.getDay();
  return day !== 0 && day !== 6;
}

function atMinutesOfDay(date: Date, minutesOfDay: number): Date {
  const d = new Date(date);
  d.setHours(Math.floor(minutesOfDay / 60), minutesOfDay % 60, 0, 0);
  return d;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function randomInt(min: number, max: number): number {
  if (max <= min) return min;
  return min + Math.floor(Math.random() * (max - min + 1));
}

/**
 * Walk `cursor` forward to the next moment that is a valid sending day, inside
 * the sending window, and whose calendar day still has capacity under the
 * daily cap. `dailyCounts` is mutated as slots are consumed by the caller.
 */
function nextAvailableSlot(
  cursor: Date,
  settings: OutreachScheduleSettings,
  dailyCounts: Map<string, number>,
): Date {
  const startMin = toMinutesOfDay(settings.sendWindowStart);
  const endMin = toMinutesOfDay(settings.sendWindowEnd);

  let d = new Date(cursor);
  // Bounded loop — worst case walks day-by-day; 3 years is far more than
  // any realistic queue depth would ever need and guarantees termination.
  for (let guard = 0; guard < 366 * 3; guard++) {
    if (!isValidDay(d, settings.weekdaysOnly)) {
      d = atMinutesOfDay(addDays(d, 1), startMin);
      continue;
    }

    const minsOfDay = d.getHours() * 60 + d.getMinutes();
    if (minsOfDay < startMin) {
      d = atMinutesOfDay(d, startMin);
      continue;
    }
    if (minsOfDay >= endMin) {
      d = atMinutesOfDay(addDays(d, 1), startMin);
      continue;
    }

    const used = dailyCounts.get(dateKey(d)) ?? 0;
    if (used >= settings.dailySendLimit) {
      d = atMinutesOfDay(addDays(d, 1), startMin);
      continue;
    }

    return d;
  }

  return d;
}

/**
 * Computes a scheduledSendTime for each job in order, respecting the daily
 * cap, sending window, weekdays-only flag, and jitter spacing.
 *
 * `existingDailyCounts` should reflect sends already scheduled for this user
 * (keyed by "YYYY-MM-DD") so a partially-booked day doesn't get overbooked —
 * pass a fresh Map (not shared/mutated elsewhere) since this function
 * mutates it as it allocates slots.
 *
 * A single job whose `units` alone exceeds the daily cap (many contact
 * emails) still gets one slot and is allowed to push that day over cap by
 * itself — splitting one job's emails across multiple days isn't supported.
 */
export function computeOutreachSchedule(
  jobs: JobToSchedule[],
  settings: OutreachScheduleSettings,
  existingDailyCounts: Map<string, number>,
  now: Date = new Date(),
): Map<string, Date> {
  const result = new Map<string, Date>();
  const dailyCounts = new Map(existingDailyCounts);

  let cursor = new Date(now);

  for (const job of jobs) {
    const slot = nextAvailableSlot(cursor, settings, dailyCounts);
    const key = dateKey(slot);
    dailyCounts.set(key, (dailyCounts.get(key) ?? 0) + Math.max(1, job.units));
    result.set(job.id, slot);

    const gapSeconds = settings.jitterEnabled
      ? randomInt(settings.jitterMinSeconds, settings.jitterMaxSeconds)
      : Math.max(settings.jitterMinSeconds, 60);
    cursor = new Date(slot.getTime() + gapSeconds * 1000);
  }

  return result;
}
