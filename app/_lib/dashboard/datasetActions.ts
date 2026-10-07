"use server";

import { backendRequest } from "../api/backendRequest";
import { uncachedApi } from "../api/client";
import { getDatasetDetail, listDatasets } from "../api/datasets";
import { unwrap } from "../api/request";
import { getAccessToken } from "../auth/serverAuth";
import { DATASET_FORMATS, fileFitsFormat, isDatasetFormat } from "../datasetFormats";
import type { AccessRequestRow, AccessState, DatasetFile, DatasetSummary } from "../datasetTypes";

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
export async function getDatasetAccessAction(slug: string): Promise<{ accessState: AccessState; files: DatasetFile[] } | null> {
  if (typeof slug !== "string" || !SLUG.test(slug)) return null;
  const detail = await getDatasetDetail(slug, { accessToken: await getAccessToken() });
  return detail ? { accessState: detail.accessState, files: detail.files } : null;
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

// Other formats of a dataset (website-backend #70). The backend decides who may change them (the dataset's creator
// while it is a draft, editors and admins always); these actions validate the arguments and report its answer.

const MAX_FORMAT_FILE_BYTES = 10 * 1024 * 1024;

export type ExtraFormat = { id: number; format: string; label: string; size?: number };
export type ExtraFormatsResult = { status: "ok"; mainFormat: string; extras: ExtraFormat[] } | { status: "signed-out" | "not-found" | "error" };
export type FormatChange = { ok: true } | { ok: false; message: string };

const signedOutChange: FormatChange = { ok: false, message: "Your session has ended. Please sign in again." };
const labelOf = (code: string) => DATASET_FORMATS.find((f) => f.code === code)?.label ?? code.toUpperCase();

function refusal(status: number, data: unknown): FormatChange {
  if (status === 401) return signedOutChange;
  if (status === 403) return { ok: false, message: "Your role isn't allowed to change this dataset's files." };
  if (status === 404) return { ok: false, message: "That dataset or file no longer exists." };
  if (status === 400 && data && typeof data === "object") {
    const messages = Object.values(data as Record<string, unknown>).flatMap((v) => (Array.isArray(v) ? v : [v])).filter((v) => typeof v === "string");
    if (messages.length) return { ok: false, message: messages.join(" ") };
  }
  return { ok: false, message: "Something went wrong on the server. Please try again." };
}

/** The dataset's main format and its other formats, as the signed-in user sees them. */
export async function listExtraFormatsAction(slug: string): Promise<ExtraFormatsResult> {
  if (typeof slug !== "string" || !SLUG.test(slug)) return { status: "not-found" };
  const accessToken = await getAccessToken();
  if (!accessToken) return { status: "signed-out" };
  const result = await backendRequest("GET", `/api/v1/datasets/${slug}/`, { accessToken });
  if (result.status === 401) return { status: "signed-out" };
  if (result.status === 404) return { status: "not-found" };
  const body = result.data as { format?: unknown; files?: unknown } | null;
  if (!result.ok || !body || typeof body.format !== "string") return { status: "error" };
  const extras: ExtraFormat[] = [];
  for (const entry of Array.isArray(body.files) ? body.files : []) {
    const { id, format, size } = entry as { id?: unknown; format?: unknown; size?: unknown };
    if (typeof id !== "number" || typeof format !== "string") continue; // the main file has no id
    extras.push({ id, format, label: labelOf(format), ...(typeof size === "number" ? { size } : {}) });
  }
  return { status: "ok", mainFormat: body.format, extras };
}

/** Adds the same data in another format. `form` holds `format` and `file`. */
export async function addExtraFormatAction(slug: string, form: FormData): Promise<FormatChange> {
  if (typeof slug !== "string" || !SLUG.test(slug)) return { ok: false, message: "That dataset no longer exists." };
  if (!(form instanceof FormData)) return { ok: false, message: "Choose a format and a file." };
  const format = form.get("format");
  const file = form.get("file");
  if (!isDatasetFormat(format)) return { ok: false, message: "Choose a format." };
  if (!(file instanceof File) || file.size === 0) return { ok: false, message: "Choose a file to upload." };
  if (file.size > MAX_FORMAT_FILE_BYTES) return { ok: false, message: "That file is larger than 10 MB." };
  if (!fileFitsFormat(file.name, format)) return { ok: false, message: `That file doesn't look like ${labelOf(format)} (check its extension).` };

  const accessToken = await getAccessToken();
  if (!accessToken) return signedOutChange;
  const upload = new FormData();
  upload.append("format", format);
  upload.append("file", file, file.name);
  const result = await backendRequest("POST", `/api/v1/datasets/${slug}/files/`, { accessToken, form: upload });
  return result.ok ? { ok: true } : refusal(result.status, result.data);
}

/** Removes one of the dataset's other formats; the backend deletes the stored file. */
export async function removeExtraFormatAction(slug: string, id: number): Promise<FormatChange> {
  if (typeof slug !== "string" || !SLUG.test(slug) || !Number.isInteger(id) || id < 1 || id >= 2 ** 31) {
    return { ok: false, message: "That file no longer exists." };
  }
  const accessToken = await getAccessToken();
  if (!accessToken) return signedOutChange;
  const result = await backendRequest("DELETE", `/api/v1/datasets/${slug}/files/${id}/`, { accessToken });
  return result.ok ? { ok: true } : refusal(result.status, result.data);
}
