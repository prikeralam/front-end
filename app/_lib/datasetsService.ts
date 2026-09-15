import "server-only";
import { searchDatasets, getDataset, extraValue, CkanError, type CkanPackage } from "./ckan";
import { isVisibleInListing, canAccessDataset, extraFields, type MockRequestSession } from "./datasetAccess";
import { parseCsvPreview } from "./csv";

export type AccessState = "full" | "requestable" | "locked";

export type DatasetSummary = {
  slug: string;
  title: string;
  description: string;
  visibility: string;
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

async function toSummary(pkg: CkanPackage, session: MockRequestSession): Promise<DatasetSummary> {
  const fields = extraFields(pkg);
  const { tier, state } = await canAccessDataset(pkg, session);
  return {
    slug: pkg.name,
    title: pkg.title,
    description: pkg.notes,
    visibility: tier,
    accessState: state,
    theme: pkg.groups[0]?.title ?? null,
    ...fields,
    fileFormat: extraValue(pkg, "fileFormat") ?? pkg.resources[0]?.format ?? null,
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
  const { results } = await searchDatasets({ q: opts.q, theme: opts.theme, rows: 200 });

  const visible: DatasetSummary[] = [];
  for (const pkg of results) {
    if (!(await isVisibleInListing(pkg, opts.session))) continue;

    const fields = extraFields(pkg);
    if (opts.geography && fields.geography !== opts.geography) continue;
    if (opts.year && fields.year !== opts.year) continue;
    if (opts.type && fields.type !== opts.type) continue;

    visible.push(await toSummary(pkg, opts.session));
  }
  return visible;
}

export type DatasetDetail = DatasetSummary & {
  tags: string[];
  files: { label: string; path: string }[];
};

export async function getDatasetDetail(slug: string, session: MockRequestSession): Promise<DatasetDetail | null> {
  let pkg: CkanPackage;
  try {
    pkg = await getDataset(slug);
  } catch (err) {
    if (err instanceof CkanError && err.status === 404) return null;
    throw err;
  }

  if (!(await isVisibleInListing(pkg, session))) return null;

  const summary = await toSummary(pkg, session);
  return {
    ...summary,
    tags: pkg.tags.map((t) => t.name),
    files:
      summary.accessState === "full"
        ? pkg.resources.map((r) => ({ label: r.name, path: `/api/datasets/${slug}/download?resource=${r.id}` }))
        : [],
  };
}

export type ResourcePreview = { label: string; format: string; columns: string[]; rows: string[][] };

/** Fetches each resource's file from CKAN and parses a few sample rows —
 * real preview data, not synthesized. Only for CSV-ish formats; other
 * formats are listed with empty columns/rows so the UI can say "preview not
 * available" rather than trying to render binary content as a table. */
export async function getDatasetPreview(slug: string, session: MockRequestSession): Promise<ResourcePreview[] | null> {
  let pkg: CkanPackage;
  try {
    pkg = await getDataset(slug);
  } catch (err) {
    if (err instanceof CkanError && err.status === 404) return null;
    throw err;
  }

  if (!(await isVisibleInListing(pkg, session))) return null;

  const { state } = await canAccessDataset(pkg, session);
  if (state === "locked") return null;

  return Promise.all(
    pkg.resources.map(async (r): Promise<ResourcePreview> => {
      if (!/csv/i.test(r.format)) return { label: r.name, format: r.format, columns: [], rows: [] };
      try {
        const res = await fetch(r.url, { cache: "no-store" });
        const text = await res.text();
        const { columns, rows } = parseCsvPreview(text);
        return { label: r.name, format: r.format, columns, rows };
      } catch {
        return { label: r.name, format: r.format, columns: [], rows: [] };
      }
    })
  );
}
