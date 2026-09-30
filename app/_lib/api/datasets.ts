import "server-only";
import { unstable_rethrow } from "next/navigation";
import type { DatasetDetail, DatasetSummary, ResourcePreview } from "../datasetTypes";
import { api, uncachedApi } from "./client";
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
  type TablePreviewBody,
} from "./datasetAdapter";
import { collectAllPages } from "./pagination";
import { unwrap } from "./request";
import { listThemes } from "./themes";

export type { DashboardCard };

const DATASETS_PATH = "/api/v1/datasets/";
const DATASET_PATH = "/api/v1/datasets/{slug}/";
const TABLE_PREVIEW_PATH = "/api/v1/datasets/{slug}/preview/table/";
const MAP_PREVIEW_PATH = "/api/v1/datasets/{slug}/preview/map/";
const DASHBOARDS_PATH = "/api/v1/dashboards/";

/** Anonymous reads share the cached client; a token means the answer depends on the caller, so it is never cached. */
export type Caller = { accessToken?: string | null };
const clientFor = ({ accessToken }: Caller = {}) => (accessToken ? uncachedApi(accessToken) : api);

/** Published datasets the caller may see (anonymous: `public` and `on_request`), oldest first. */
export async function listDatasets(caller: Caller = {}): Promise<DatasetSummary[]> {
  const client = clientFor(caller);
  const [datasets, themes] = await Promise.all([
    collectAllPages(async (page) => unwrap(await client.GET(DATASETS_PATH, { params: { query: { page } } }), DATASETS_PATH)),
    listThemes(),
  ]);
  const topLevel = topLevelNameBySubTheme(themes);
  return datasets.sort((a, b) => a.id - b.id).map((dataset) => toDatasetSummary(dataset, topLevel));
}

/** `null` when the dataset is not visible to the caller (the API answers 404 for hidden objects too). */
export async function getDatasetDetail(slug: string, caller: Caller = {}): Promise<DatasetDetail | null> {
  const [result, themes] = await Promise.all([clientFor(caller).GET(DATASET_PATH, { params: { path: { slug } } }), listThemes()]);
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
export async function getDatasetPreviews(dataset: Pick<DatasetDetail, "slug" | "title" | "fileFormat">, caller: Caller = {}): Promise<DatasetPreviews> {
  const { slug } = dataset;
  const client = clientFor(caller);
  try {
    if (dataset.fileFormat === "GeoJSON") {
      const result = await client.GET(MAP_PREVIEW_PATH, { params: { path: { slug } } });
      const body: unknown = result.data;
      return { table: null, map: result.response.ok && isFeatureCollection(body) ? body : null };
    }
    const result = await client.GET(TABLE_PREVIEW_PATH, { params: { path: { slug } } });
    const body: unknown = result.data;
    return { table: result.response.ok && isTablePreview(body) ? toResourcePreview(dataset.title, dataset.fileFormat ?? "", body) : null, map: null };
  } catch (error) {
    unstable_rethrow(error);
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

/** Top-level themes with their descriptions, in API order. */
export async function listTopThemes(): Promise<{ name: string; description: string }[]> {
  return (await listThemes()).filter((theme) => theme.parent === null).map((theme) => ({ name: theme.name, description: theme.description ?? "" }));
}

/** Stop paging after this many preview pages (50 rows each), so a huge file can't stall a dashboard. */
const MAX_TABLE_PAGES = 40;

/**
 * A dataset's whole table, read page by page from the table preview, as the caller may see it: the preview
 * endpoint enforces the same access rules as the dataset itself. `null` when there's no table to read (a map dataset,
 * an unreadable file, or a dataset the caller can't open).
 */
export async function getDatasetTable(slug: string, caller: Caller = {}): Promise<{ columns: string[]; rows: TablePreviewBody["rows"] } | null> {
  const client = clientFor(caller);
  const rows: TablePreviewBody["rows"] = [];
  let columns: string[] = [];
  for (let page = 1; page <= MAX_TABLE_PAGES; page++) {
    // The endpoint takes `?page=`, but the OpenAPI schema doesn't declare it (a backend schema gap), hence the cast.
    const result = await client.GET(TABLE_PREVIEW_PATH, { params: { path: { slug }, query: { page } } } as never);
    const body: unknown = result.data;
    if (!result.response.ok || !isTablePreview(body)) return page === 1 ? null : { columns, rows };
    columns = body.header;
    rows.push(...body.rows);
    if (body.rows.length < body.page_size) break;
  }
  return { columns, rows };
}
