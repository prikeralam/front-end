import type { DatasetDetail } from "./datasetTypes";

/**
 * How to cite a dataset: PRI's own citation text when it has set one, otherwise a standard reference built from the
 * title, the year of the last update and the dataset's address.
 */
export function citationFor(dataset: Pick<DatasetDetail, "title" | "citation" | "updatedAt">, url: string): string {
  if (dataset.citation?.trim()) return dataset.citation.trim();
  const year = dataset.updatedAt ? dataset.updatedAt.slice(0, 4) : "n.d.";
  return `Policy and Research Initiative (${year}). ${dataset.title} [Dataset]. PRI Data Repository. ${url}`;
}
