import "server-only";
import { datasets as contentDatasets } from "../_content/datasets";
import type { Dataset } from "./types";
import { prisma } from "./prisma";
import { readCsvPreview } from "./csv";
import type { Role } from "./datasetAccess";

// Reads from app/_content/datasets.ts (files under /public/datasets) rather
// than a real backend — see that file's header comment and the 2026-09-19
// amendment in docs/PRDs/backend/C-data-repository-dashboard-integration.md.
// Every exported function/type here keeps its previous (CKAN-era) shape so
// none of the ~10 call sites (pages, API routes, dashboard views) need to
// change again once this is swapped for a real API.

export type AccessState = "full" | "requestable" | "locked";
export type MockRequestSession = { email: string; name: string; role: Role } | null;

const STAFF_ROLES: Role[] = ["researcher", "editor", "admin"];

export type DatasetSummary = {
  slug: string;
  title: string;
  description: string;
  visibility: Dataset["visibility"];
  accessState: AccessState;
  theme: string | null;
  geography?: string;
  year?: string;
  type?: string;
  source?: string;
  coverage?: string;
  frequency?: string;
  lastUpdated?: string;
  fileFormat: string | null;
};

function isVisibleInListing(dataset: Dataset, session: MockRequestSession): boolean {
  if (dataset.visibility !== "internal") return true;
  return !!session && STAFF_ROLES.includes(session.role);
}

/** `on-request` datasets aren't part of the current local content set (see
 * app/_content/datasets.ts) — this stays wired to Prisma's AccessRequest
 * table for when one is added, exactly mirroring the pre-migration logic. */
async function accessStateFor(dataset: Dataset, session: MockRequestSession): Promise<AccessState> {
  if (dataset.visibility === "public") return "full";

  if (dataset.visibility === "on-request") {
    if (!session) return "requestable";
    const approved = await prisma.accessRequest.findFirst({
      where: { datasetSlug: dataset.slug, requesterEmail: session.email, status: "approved" },
    });
    return approved ? "full" : "requestable";
  }

  // internal
  if (!session) return "locked";
  return STAFF_ROLES.includes(session.role) ? "full" : "locked";
}

function toSummary(dataset: Dataset, accessState: AccessState): DatasetSummary {
  return {
    slug: dataset.slug,
    title: dataset.title,
    description: dataset.description,
    visibility: dataset.visibility,
    accessState,
    theme: dataset.theme,
    geography: dataset.geography,
    year: dataset.year,
    type: dataset.type,
    source: dataset.source,
    coverage: dataset.coverage,
    frequency: dataset.frequency,
    lastUpdated: dataset.lastUpdated,
    fileFormat: dataset.fileFormat ?? null,
  };
}

export async function listDatasets(opts: {
  q?: string;
  theme?: string;
  geography?: string;
  year?: string;
  type?: string;
  session: MockRequestSession;
}): Promise<DatasetSummary[]> {
  const q = opts.q?.toLowerCase();
  const results: DatasetSummary[] = [];

  for (const dataset of contentDatasets) {
    if (!isVisibleInListing(dataset, opts.session)) continue;
    if (opts.theme && dataset.theme !== opts.theme) continue;
    if (opts.geography && dataset.geography !== opts.geography) continue;
    if (opts.year && dataset.year !== opts.year) continue;
    if (opts.type && dataset.type !== opts.type) continue;
    if (q && !dataset.title.toLowerCase().includes(q) && !dataset.description.toLowerCase().includes(q)) continue;

    results.push(toSummary(dataset, await accessStateFor(dataset, opts.session)));
  }
  return results;
}

export type DatasetDetail = DatasetSummary & {
  tags: string[];
  files: { label: string; path: string }[];
};

export async function getDatasetDetail(slug: string, session: MockRequestSession): Promise<DatasetDetail | null> {
  const dataset = contentDatasets.find((d) => d.slug === slug);
  if (!dataset) return null;
  if (!isVisibleInListing(dataset, session)) return null;

  const accessState = await accessStateFor(dataset, session);
  return {
    ...toSummary(dataset, accessState),
    tags: dataset.tags ?? [],
    files: accessState === "full" ? dataset.files ?? [] : [],
  };
}

export type ResourcePreview = { label: string; format: string; columns: string[]; rows: string[][] };

/** Reads sample rows straight off the CSV under /public — no network round trip. */
export async function getDatasetPreview(slug: string, session: MockRequestSession): Promise<ResourcePreview[] | null> {
  const dataset = contentDatasets.find((d) => d.slug === slug);
  if (!dataset) return null;
  if (!isVisibleInListing(dataset, session)) return null;

  const accessState = await accessStateFor(dataset, session);
  if (accessState === "locked") return null;

  return (dataset.files ?? []).map((f): ResourcePreview => {
    const format = dataset.fileFormat ?? "";
    if (!/\.csv$/i.test(f.path)) return { label: f.label, format, columns: [], rows: [] };

    const { columns, rows } = readCsvPreview(f.path.replace(/^\//, ""));
    return { label: f.label, format: format || "CSV", columns, rows };
  });
}
