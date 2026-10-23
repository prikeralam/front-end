export const DATASETS_PER_PAGE = 10;

/** One page of `items` (1-based, clamped to the pages there are), plus how many pages there are in all. */
export function pageOf<T>(items: readonly T[], page: number, perPage = DATASETS_PER_PAGE): { items: T[]; page: number; pages: number } {
  const pages = Math.max(1, Math.ceil(items.length / perPage));
  const current = Math.min(Math.max(1, Math.floor(page) || 1), pages);
  return { items: items.slice((current - 1) * perPage, current * perPage), page: current, pages };
}
