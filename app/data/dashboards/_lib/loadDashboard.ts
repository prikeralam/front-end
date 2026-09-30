import "server-only";
import { getDatasetPreviews, getDatasetTable } from "../../../_lib/api/datasets";
import type { DashboardData } from "../_ui/DashboardView";
import { datasetsOf, type DashboardSpec } from "./spec";

/**
 * Reads every dataset a dashboard uses, through the same preview endpoints the dataset pages use, so a dataset the
 * visitor can't open comes back empty and its blocks say so. Map blocks read the GeoJSON preview; the rest read tables.
 */
export async function loadDashboardData(spec: DashboardSpec): Promise<DashboardData> {
  const mapDatasets = new Set(spec.blocks.filter((b) => b.type === "map").map((b) => b.dataset));
  const data: DashboardData = { tables: {}, maps: {} };
  await Promise.all(
    datasetsOf(spec).map(async (slug) => {
      try {
        if (mapDatasets.has(slug)) data.maps[slug] = (await getDatasetPreviews({ slug, title: slug, fileFormat: "GeoJSON" })).map;
        else data.tables[slug] = await getDatasetTable(slug);
      } catch (error) {
        console.error(`Failed to load dataset ${slug} for dashboard ${spec.slug}`, error);
        if (mapDatasets.has(slug)) data.maps[slug] = null;
        else data.tables[slug] = null;
      }
    }),
  );
  return data;
}
