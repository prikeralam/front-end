import "server-only";

/**
 * Server-only CKAN Action API client. CKAN_API_KEY must never reach the
 * browser — every app/api/datasets/* route handler is the only thing
 * allowed to import this module.
 */

const CKAN_URL = process.env.CKAN_URL ?? "http://localhost:5000";
const CKAN_API_KEY = process.env.CKAN_API_KEY;

export type CkanExtra = { key: string; value: string };

export type CkanResource = {
  id: string;
  name: string;
  format: string;
  url: string;
  created: string;
};

export type CkanPackage = {
  id: string;
  name: string;
  title: string;
  notes: string;
  private: boolean;
  state: string;
  organization: { name: string; title: string } | null;
  groups: { name: string; title: string }[];
  tags: { name: string }[];
  extras: CkanExtra[];
  resources: CkanResource[];
};

export class CkanError extends Error {
  constructor(
    public action: string,
    public status: number,
    public body: unknown
  ) {
    super(`CKAN action "${action}" failed with status ${status}`);
  }
}

async function ckanAction<T>(action: string, params: Record<string, unknown> = {}, method: "GET" | "POST" = "GET"): Promise<T> {
  const headers: Record<string, string> = {};
  if (CKAN_API_KEY) headers["Authorization"] = CKAN_API_KEY;

  let url = `${CKAN_URL}/api/3/action/${action}`;
  const init: RequestInit = { method, headers, cache: "no-store" };

  if (method === "GET") {
    const qs = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === null || value === "") continue;
      qs.set(key, String(value));
    }
    const q = qs.toString();
    if (q) url += `?${q}`;
  } else {
    headers["Content-Type"] = "application/json";
    init.body = JSON.stringify(params);
  }

  const res = await fetch(url, init);
  const body = await res.json();

  if (!res.ok || body.success === false) {
    throw new CkanError(action, res.status, body);
  }
  return body.result as T;
}

export function extraValue(pkg: CkanPackage, key: string): string | undefined {
  return pkg.extras.find((e) => e.key === key)?.value;
}

/** Includes private packages — caller (route handler) is responsible for
 * re-checking visibility against Prisma's DatasetVisibilityOverride before
 * returning anything to a non-staff requester. This function is a thin
 * CKAN wrapper, not the access-control boundary. */
export function searchDatasets(opts: { q?: string; theme?: string; geography?: string; year?: string; rows?: number; start?: number }) {
  const fq: string[] = [];
  if (opts.theme) fq.push(`groups:${opts.theme.toLowerCase().replace(/ /g, "-")}`);

  return ckanAction<{ count: number; results: CkanPackage[] }>("package_search", {
    q: opts.q,
    fq: fq.length ? fq.join(" AND ") : undefined,
    rows: opts.rows ?? 20,
    start: opts.start ?? 0,
    include_private: true,
  });
}

export function getDataset(slug: string) {
  return ckanAction<CkanPackage>("package_show", { id: slug });
}

export function listAllDatasets() {
  return ckanAction<{ count: number; results: CkanPackage[] }>("package_search", { rows: 1000, include_private: true });
}
