import type { DatasetSummary } from "../../_lib/datasetTypes";

/** Case-insensitive match across what a reader would search by: title, description, theme, place, source, shape, period. */
export function matchesQuery(d: DatasetSummary, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [d.title, d.description, d.theme, d.geography, d.source, d.granularity, d.timePeriod, d.year]
    .filter(Boolean)
    .some((field) => String(field).toLowerCase().includes(q));
}
