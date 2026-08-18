import "server-only";

// null means "no meaningful comparison" (e.g. zero last month), not zero
// change — callers should render that as a neutral dash rather than "+0%".
export function pctChange(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? null : 100;
  return ((current - previous) / previous) * 100;
}

export function getMonthBoundaries(now = new Date()) {
  const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const startOfLastMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
  return { startOfMonth, startOfLastMonth };
}
