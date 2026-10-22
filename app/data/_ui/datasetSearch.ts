import type { DatasetSummary } from "../../_lib/datasetTypes";

/** Case-insensitive match across what a reader would search by: catalog ID, title, description, theme, place, source, shape, period. */
export function matchesQuery(d: DatasetSummary, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [d.code, d.title, d.description, d.theme, d.geography, d.source, d.granularity, d.timePeriod, d.year]
    .filter(Boolean)
    .some((field) => String(field).toLowerCase().includes(q));
}

/** A dataset is shown when it matches the search and, if a theme is chosen, belongs to it. */
export function filterDatasets(datasets: DatasetSummary[], query: string, theme: string): DatasetSummary[] {
  return datasets.filter((d) => (!theme || d.theme === theme) && matchesQuery(d, query));
}
