export type Page<T> = {
  count: number;
  next?: string | null;
  previous?: string | null;
  results: T[];
};

/** Follows `?page=N` until the backend reports no further page (lists are 20 per page). */
export async function collectAllPages<T>(fetchPage: (page: number) => Promise<Page<T>>): Promise<T[]> {
  const items: T[] = [];
  for (let page = 1; ; page++) {
    const result = await fetchPage(page);
    items.push(...result.results);
    if (!result.next) return items;
  }
}
