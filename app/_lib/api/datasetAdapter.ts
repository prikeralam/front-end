import type { components } from "./schema";
import { formatPublicationDate } from "./publicationAdapter";
import type { AccessState, DatasetDetail, DatasetSummary, ResourcePreview } from "../datasetTypes";
import type { Dataset } from "../types";

type ApiDataset = components["schemas"]["Dataset"];
type ApiDashboard = components["schemas"]["Dashboard"];
type ApiTheme = components["schemas"]["Theme"];

const FORMAT_LABELS: Record<ApiDataset["format"], string> = {
  csv: "CSV",
  parquet: "Parquet",
  zip: "ZIP",
  geojson: "GeoJSON",
};

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

/** Every theme id -> name, for dashboards, which link to any theme directly. */
export function themeNameById(themes: readonly ApiTheme[]): Map<number, string> {
  return new Map(themes.map((theme) => [theme.id, theme.name]));
}

export function toDatasetSummary(dataset: ApiDataset, topLevelBySubTheme: ReadonlyMap<number, string>): DatasetSummary {
  return {
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
    fileFormat: FORMAT_LABELS[dataset.format],
  };
}

/** The API holds one file per dataset and no tags; a locked file is simply absent from `files`. */
export function toDatasetDetail(dataset: ApiDataset, topLevelBySubTheme: ReadonlyMap<number, string>): DatasetDetail {
  return {
    ...toDatasetSummary(dataset, topLevelBySubTheme),
    tags: [],
    files: dataset.file ? [{ label: dataset.title, path: dataset.file }] : [],
  };
}

/** `preview/table/` body. OpenAPI types it as `Dataset`, which is wrong, so it is described and checked here. */
export type TablePreviewBody = { page: number; page_size: number; header: string[]; rows: (string | number | boolean | null)[][] };

export function isTablePreview(body: unknown): body is TablePreviewBody {
  if (!body || typeof body !== "object") return false;
  const { header, rows } = body as Record<string, unknown>;
  return Array.isArray(header) && Array.isArray(rows) && rows.every(Array.isArray);
}

export function toResourcePreview(label: string, format: string, body: TablePreviewBody): ResourcePreview {
  return {
    label,
    format,
    columns: body.header,
    rows: body.rows.map((row) => row.map((cell) => (cell === null ? "" : String(cell)))),
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

export type DashboardCard = {
  slug: string;
  title: string;
  description: string;
  theme: string | null;
  embedUrl: string;
  embedType: ApiDashboard["embed_type"];
};

export function toDashboard(dashboard: ApiDashboard, themeNames: ReadonlyMap<number, string>): DashboardCard {
  return {
    slug: dashboard.slug,
    title: dashboard.title,
    description: dashboard.description ?? "",
    theme: themeNames.get(dashboard.theme) ?? null,
    embedUrl: dashboard.embed_url,
    embedType: dashboard.embed_type,
  };
}
