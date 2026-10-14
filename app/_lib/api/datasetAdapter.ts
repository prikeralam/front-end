import type { components } from "./schema";
import { formatPublicationDate } from "./publicationAdapter";
import type { AccessState, DatasetDetail, DatasetFile, DatasetSummary, ResourcePreview } from "../datasetTypes";
import type { Dataset } from "../types";

type ApiDataset = components["schemas"]["Dataset"];
type ApiTheme = components["schemas"]["Theme"];

export const FORMAT_LABELS: Record<ApiDataset["format"], string> = {
  csv: "CSV",
  parquet: "Parquet",
  zip: "ZIP",
  geojson: "GeoJSON",
  json: "JSON",
  xlsx: "Excel",
};

const formatLabel = (code: string) => FORMAT_LABELS[code as ApiDataset["format"]] ?? code.toUpperCase();

/** `files` is typed loosely in the schema, so each entry is checked here; anything malformed is skipped. */
function toFiles(dataset: ApiDataset): DatasetFile[] {
  const listed = Array.isArray(dataset.files) ? dataset.files : [];
  const files: DatasetFile[] = [];
  for (const entry of listed) {
    const { format, url, size } = entry as { format?: unknown; url?: unknown; size?: unknown };
    if (typeof format !== "string" || typeof url !== "string" || !url) continue;
    files.push({ label: formatLabel(format), format, path: url, ...(typeof size === "number" ? { size } : {}) });
  }
  // A backend from before several formats existed sends only `file`.
  if (files.length === 0 && dataset.file) files.push({ label: formatLabel(dataset.format), format: dataset.format, path: dataset.file });
  return files;
}

const VISIBILITY: Record<NonNullable<ApiDataset["visibility"]>, Dataset["visibility"]> = {
  public: "public",
  on_request: "on-request",
  internal_only: "internal",
};

/**
 * The backend drops `file` from responses to anyone `/download/` would refuse, so a present file means full access;
 * an `on_request` dataset without one is requestable, anything else is locked.
 */
export function accessStateOf(dataset: ApiDataset): AccessState {
  if (dataset.file) return "full";
  if (dataset.visibility === "public") return "signin";
  return dataset.visibility === "on_request" ? "requestable" : "locked";
}

/** Sub-theme id -> its top-level theme's name (datasets link to a sub-theme, the UI groups by top-level theme). */
export function topLevelNameBySubTheme(themes: readonly ApiTheme[]): Map<number, string> {
  const index = new Map<number, string>();
  for (const theme of themes) {
    for (const sub of theme.subthemes ?? []) index.set(sub.id, theme.name);
  }
  return index;
}

export function toDatasetSummary(dataset: ApiDataset, topLevelBySubTheme: ReadonlyMap<number, string>): DatasetSummary {
  return {
    id: dataset.id,
    slug: dataset.slug,
    title: dataset.title,
    description: dataset.description ?? "",
    visibility: VISIBILITY[dataset.visibility ?? "public"],
    accessState: accessStateOf(dataset),
    theme: topLevelBySubTheme.get(dataset.sub_theme) ?? null,
    geography: dataset.geography || undefined,
    year: dataset.year ? String(dataset.year) : undefined,
    source: dataset.source || undefined,
    frequency: dataset.update_frequency || undefined,
    lastUpdated: formatPublicationDate(dataset.updated_at.slice(0, 10)),
    updatedAt: dataset.updated_at,
    fileFormat: FORMAT_LABELS[dataset.format],
    formats: (Array.isArray(dataset.formats) && dataset.formats.length ? dataset.formats : [dataset.format]).map(formatLabel),
    granularity: dataset.granularity || undefined,
    timePeriod: dataset.time_period || undefined,
    rowCount: dataset.row_count ?? undefined,
    columnCount: dataset.column_count ?? undefined,
  };
}

/** The API has no tags; locked files are simply absent from `files`. */
export function toDatasetDetail(dataset: ApiDataset, topLevelBySubTheme: ReadonlyMap<number, string>): DatasetDetail {
  return {
    ...toDatasetSummary(dataset, topLevelBySubTheme),
    columns: Array.isArray(dataset.columns) ? dataset.columns.filter((c): c is string => typeof c === "string") : [],
    citation: dataset.citation || undefined,
    tags: [],
    files: toFiles(dataset),
  };
}

/** `preview/table/` body. OpenAPI types it as `Dataset`, which is wrong, so it is described and checked here. */
export type TablePreviewBody = { page: number; page_size: number; header: string[]; rows: (string | number | boolean | null)[][] };

export function isTablePreview(body: unknown): body is TablePreviewBody {
  if (!body || typeof body !== "object") return false;
  const { header, rows } = body as Record<string, unknown>;
  return Array.isArray(header) && Array.isArray(rows) && rows.every(Array.isArray);
}

/** Rows a dataset page shows as its preview; the API sends a page of 50, which dashboards still read in full. */
export const PREVIEW_ROWS = 5;

export function toResourcePreview(label: string, format: string, body: TablePreviewBody): ResourcePreview {
  return {
    label,
    format,
    columns: body.header,
    rows: body.rows.slice(0, PREVIEW_ROWS).map((row) => row.map((cell) => (cell === null ? "" : String(cell)))),
  };
}

/** `preview/map/` body: GeoJSON returned as stored. */
export type GeoJsonFeature = {
  type: "Feature";
  properties: Record<string, unknown> | null;
  geometry: { type: string; coordinates: unknown } | null;
};
export type GeoJsonFeatureCollection = { type: "FeatureCollection"; features: GeoJsonFeature[] };

export function isFeatureCollection(body: unknown): body is GeoJsonFeatureCollection {
  return !!body && typeof body === "object" && (body as { type?: unknown }).type === "FeatureCollection" && Array.isArray((body as { features?: unknown }).features);
}
