// Minimal concurrency-limited map — no new dependency for something this
// small. Used so resolving experience level for an entire board's jobs
// (needed now that Job Discovery filters by experience, not just displays
// it — see experienceLevel.ts) doesn't fire hundreds of simultaneous
// Gemini calls the first time a board's cache is cold.
export async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let cursor = 0;

  async function worker() {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await fn(items[index], index);
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}
