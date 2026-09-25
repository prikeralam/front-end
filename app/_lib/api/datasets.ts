import "server-only";
import type { DatasetDetail, DatasetSummary, ResourcePreview } from "../datasetTypes";
import { api } from "./client";
import {
  isFeatureCollection,
  isTablePreview,
  toDashboard,
  toDatasetDetail,
  toDatasetSummary,
  toResourcePreview,
  themeNameById,
  topLevelNameBySubTheme,
  type DashboardCard,
  type GeoJsonFeatureCollection,
} from "./datasetAdapter";
import { collectAllPages } from "./pagination";
import { unwrap } from "./request";
import { listThemes } from "./themes";

const DATASETS_PATH = "/api/v1/datasets/";
const DATASET_PATH = "/api/v1/datasets/{slug}/";
const TABLE_PREVIEW_PATH = "/api/v1/datasets/{slug}/preview/table/";
const MAP_PREVIEW_PATH = "/api/v1/datasets/{slug}/preview/map/";
const DASHBOARDS_PATH = "/api/v1/dashboards/";

/** Published datasets the caller may see (anonymous: `public` and `on_request`), oldest first. */
export async function listDatasets(): Promise<DatasetSummary[]> {
  const [datasets, themes] = await Promise.all([
    collectAllPages(async (page) => unwrap(await api.GET(DATASETS_PATH, { params: { query: { page } } }), DATASETS_PATH)),
    listThemes(),
  ]);
  const topLevel = topLevelNameBySubTheme(themes);
  return datasets.sort((a, b) => a.id - b.id).map((dataset) => toDatasetSummary(dataset, topLevel));
}

/** `null` when the dataset is not visible to the caller (the API answers 404 for hidden objects too). */
export async function getDatasetDetail(slug: string): Promise<DatasetDetail | null> {
  const [result, themes] = await Promise.all([api.GET(DATASET_PATH, { params: { path: { slug } } }), listThemes()]);
  if (result.response.status === 404) return null;
  return toDatasetDetail(unwrap(result, DATASET_PATH), topLevelNameBySubTheme(themes));
}

export type DatasetPreviews = {
  table: ResourcePreview | null;
  map: GeoJsonFeatureCollection | null;
};

/**
 * First page of the table preview (csv, parquet, zip) or the parsed GeoJSON (geojson datasets). A preview the backend
 * cannot produce (unreadable or oversized file, 422/413), refuses, or fails to fetch is `null`, so the rest of the page still renders.
 */
export async function getDatasetPreviews(dataset: Pick<DatasetDetail, "slug" | "title" | "fileFormat">): Promise<DatasetPreviews> {
  const { slug } = dataset;
  try {
    if (dataset.fileFormat === "GeoJSON") {
      const result = await api.GET(MAP_PREVIEW_PATH, { params: { path: { slug } } });
      const body: unknown = result.data;
      return { table: null, map: result.response.ok && isFeatureCollection(body) ? body : null };
    }
    const result = await api.GET(TABLE_PREVIEW_PATH, { params: { path: { slug } } });
    const body: unknown = result.data;
    return { table: result.response.ok && isTablePreview(body) ? toResourcePreview(dataset.title, dataset.fileFormat ?? "", body) : null, map: null };
  } catch (error) {
    console.error(`Failed to load the preview for dataset ${slug}`, error);
    return { table: null, map: null };
  }
}

/** Published dashboards with their theme names resolved. */
export async function listDashboards(): Promise<DashboardCard[]> {
  const [dashboards, themes] = await Promise.all([
    collectAllPages(async (page) => unwrap(await api.GET(DASHBOARDS_PATH, { params: { query: { page } } }), DASHBOARDS_PATH)),
    listThemes(),
  ]);
  const names = themeNameById(themes);
  return dashboards.sort((a, b) => a.id - b.id).map((dashboard) => toDashboard(dashboard, names));
}

/** Names of the top-level themes, in API order: the valid `/data/theme/[theme]` values. */
export async function listThemeNames(): Promise<string[]> {
  return (await listThemes()).filter((theme) => theme.parent === null).map((theme) => theme.name);
}
