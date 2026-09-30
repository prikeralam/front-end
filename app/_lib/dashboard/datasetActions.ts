"use server";

import { uncachedApi } from "../api/client";
import { getDatasetDetail, listDatasets } from "../api/datasets";
import { unwrap } from "../api/request";
import { getAccessToken } from "../auth/serverAuth";
import type { AccessRequestRow, AccessState, DatasetSummary } from "../datasetTypes";

// Server Actions are public POST endpoints: every argument is validated here, and the backend enforces who may do what
// (a non-staff caller listing or deciding access requests gets 403 from it, whatever this file allows).

const SLUG = /^[-a-zA-Z0-9_]{1,50}$/;
const ID = /^\d{1,9}$/;

const REQUEST_ACCESS_PATH = "/api/v1/datasets/{slug}/request-access/";
const ACCESS_REQUESTS_PATH = "/api/v1/access-requests/";
const ACCESS_REQUEST_PATH = "/api/v1/access-requests/{id}/";

/** Datasets as the signed-in caller sees them (staff also see internal ones; an approved requester gets the file). */
export async function listDatasetsAction(): Promise<DatasetSummary[]> {
  return listDatasets({ accessToken: await getAccessToken() });
}

/** What this caller can do with one dataset, or `null` when it is not visible to them. */
export async function getDatasetAccessAction(slug: string): Promise<{ accessState: AccessState; downloadUrl: string | null } | null> {
  if (typeof slug !== "string" || !SLUG.test(slug)) return null;
  const detail = await getDatasetDetail(slug, { accessToken: await getAccessToken() });
  return detail ? { accessState: detail.accessState, downloadUrl: detail.files[0]?.path ?? null } : null;
}

export type RequestAccessResult = "requested" | "signed-out" | "not-found" | "error";

/** Asks for access to a dataset. The API is idempotent: a repeat request returns the existing one. */
export async function requestAccessAction(slug: string): Promise<RequestAccessResult> {
  if (typeof slug !== "string" || !SLUG.test(slug)) return "not-found";
  const accessToken = await getAccessToken();
  if (!accessToken) return "signed-out";

  // The endpoint takes no body; the generated types wrongly require a `Dataset`, hence the cast.
  const { response } = await uncachedApi(accessToken).POST(REQUEST_ACCESS_PATH, { params: { path: { slug } }, body: undefined as never });
  if (response.ok) return "requested";
  if (response.status === 401) return "signed-out";
  return response.status === 404 ? "not-found" : "error";
}

/** Staff only: the pending access-request queue. Anyone else gets an empty list, since the backend answers 403. */
export async function listAccessRequestsAction(): Promise<AccessRequestRow[]> {
  const accessToken = await getAccessToken();
  if (!accessToken) return [];

  const client = uncachedApi(accessToken);
  const [result, datasets] = await Promise.all([
    client.GET(ACCESS_REQUESTS_PATH, { params: { query: { status: "pending" } } }),
    listDatasets({ accessToken }),
  ]);
  if (result.response.status === 401 || result.response.status === 403) return [];

  const slugById = new Map(datasets.flatMap((d) => (d.id === undefined ? [] : [[d.id, d.slug] as const])));
  return unwrap(result, ACCESS_REQUESTS_PATH).results.map((request) => ({
    id: String(request.id),
    datasetSlug: slugById.get(request.dataset) ?? `dataset-${request.dataset}`,
    requesterName: `User #${request.user}`,
    requesterEmail: "",
    status: request.status,
    createdAt: request.requested_at,
  }));
}

/** Staff only: approve or deny one request. `false` when the backend refused (not staff, or the request is gone). */
export async function decideAccessRequestAction(id: string, decision: "approved" | "denied"): Promise<boolean> {
  if (typeof id !== "string" || !ID.test(id) || (decision !== "approved" && decision !== "denied")) return false;
  const accessToken = await getAccessToken();
  if (!accessToken) return false;

  const { response } = await uncachedApi(accessToken).PATCH(ACCESS_REQUEST_PATH, {
    params: { path: { id: Number(id) } },
    body: { status: decision },
  });
  return response.ok;
}
