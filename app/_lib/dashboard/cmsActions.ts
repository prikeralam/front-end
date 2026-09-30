"use server";

import { backendListAll, backendRequest, type BackendResult } from "../api/backendRequest";
import { listPeopleById } from "../api/people";
import { listDatasets } from "../api/datasets";
import { listPublications } from "../api/publications";
import { listThemes } from "../api/themes";
import { getAccessToken } from "../auth/serverAuth";
import {
  IMAGE_ACCEPT,
  KEY_PATTERN,
  REMOVE_IMAGE,
  RESOURCES,
  belongsToType,
  objectPath,
  toCmsRecord,
  toPayload,
  type ApiRecord,
} from "../cms/resources";
import {
  ALL_CONTENT_TYPES,
  WORKFLOW_STATUSES,
  type CmsListResult,
  type CmsMutation,
  type CmsRecord,
  type ContentTypeKey,
  type DynamicOptions,
  type FieldOption,
  type WorkflowStatus,
} from "../cms/types";

// Server Actions are public POST endpoints: every argument is validated here (content type, key, status, file), and
// the backend decides who may do what (contributors create and edit their own drafts, editors and admins review,
// publish and delete). This file never grants anything; it only relays and reports.

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

const isType = (value: unknown): value is ContentTypeKey => typeof value === "string" && (ALL_CONTENT_TYPES as string[]).includes(value);
const isKey = (value: unknown): value is string => typeof value === "string" && KEY_PATTERN.test(value);
const isStatus = (value: unknown): value is WorkflowStatus => typeof value === "string" && (WORKFLOW_STATUSES as string[]).includes(value);

function failure(result: BackendResult): CmsMutation {
  switch (result.status) {
    case 401:
      return { ok: false, message: "Your session has ended. Please sign in again." };
    case 403:
      return { ok: false, message: "Your role isn't allowed to do that." };
    case 404:
      return { ok: false, message: "That item no longer exists." };
    case 400:
      return { ok: false, message: result.message || "The server rejected that." };
    default:
      return { ok: false, message: "Something went wrong on the server. Please try again." };
  }
}

const signedOut: CmsMutation = { ok: false, message: "Your session has ended. Please sign in again." };

/** Every object of one content type the caller may see (contributors see published plus their own drafts). */
export async function listCmsAction(type: ContentTypeKey): Promise<CmsListResult> {
  if (!isType(type)) return { status: "error" };
  const accessToken = await getAccessToken();
  if (!accessToken) return { status: "signed-out" };

  const result = await backendListAll(RESOURCES[type].path, accessToken);
  if (!result.ok) return result.status === 401 ? { status: "signed-out" } : result.status === 403 ? { status: "forbidden" } : { status: "error" };

  const records = (result.items as ApiRecord[])
    .filter((item) => belongsToType(type, item))
    .map((item) => toCmsRecord(type, item))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  return { status: "ok", records };
}

/** Every object of every content type the caller may see, newest first. The dashboard home filters it (review queue, "mine"). */
export async function listAllCmsAction(): Promise<CmsRecord[]> {
  const lists = await Promise.all(ALL_CONTENT_TYPES.map((type) => listCmsAction(type)));
  return lists.flatMap((list) => (list.status === "ok" ? list.records : [])).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export type FormOptions = Record<DynamicOptions, FieldOption[]>;

/**
 * Choices for the form fields that point at other objects: sub-themes (grouped under their theme), people, and
 * publications and datasets by slug. Datasets are listed as the signed-in user sees them, so staff can pick internal
 * ones too. A list that fails to load is empty rather than failing the whole form.
 */
export async function getFormOptionsAction(): Promise<FormOptions> {
  const accessToken = await getAccessToken();
  const [themes, people, publications, datasets] = await Promise.all([
    listThemes(),
    listPeopleById(),
    listPublications().catch(() => ({ publications: [] })),
    listDatasets({ accessToken }).catch(() => []),
  ]);
  const nameById = new Map(themes.map((theme) => [theme.id, theme.name]));
  return {
    publications: publications.publications.map((p) => ({ value: p.slug, label: p.title })),
    datasets: datasets.map((d) => ({ value: d.slug, label: d.title })),
    "sub-themes": themes
      .filter((theme) => theme.parent !== null && theme.parent !== undefined)
      .map((theme) => ({ value: String(theme.id), label: `${nameById.get(theme.parent as number) ?? "Theme"} › ${theme.name}` })),
    authors: [...people].map(([id, person]) => ({ value: String(id), label: person.name })),
  };
}

/** Form values for the payload. An image field contributes its link (`urlKey`) and, if ticked, its removal flag. */
function valuesFrom(type: ContentTypeKey, form: FormData): Record<string, string> {
  const values: Record<string, string> = {};
  for (const f of RESOURCES[type].fields) {
    if (f.kind === "file") continue;
    if (f.kind === "multiselect") {
      values[f.key] = form.getAll(f.key).map(String).join(",");
      continue;
    }
    if (f.kind === "image") {
      if (f.urlKey) values[f.urlKey] = String(form.get(f.urlKey) ?? "");
      values[f.key] = form.get(`${f.key}-remove`) === "1" ? REMOVE_IMAGE : "";
    } else values[f.key] = String(form.get(f.key) ?? "");
  }
  return values;
}

type Uploads = { files: [string, File][]; error?: string };

/** Chosen files and images, each checked against its allowlist and size cap; an empty picker is "no file". */
function uploadsFrom(type: ContentTypeKey, form: FormData): Uploads {
  const files: [string, File][] = [];
  for (const field of RESOURCES[type].fields) {
    if (field.kind !== "file" && field.kind !== "image") continue;
    const entry = form.get(field.key);
    if (!(entry instanceof File) || entry.size === 0) continue;

    const image = field.kind === "image";
    if (entry.size > (image ? MAX_IMAGE_BYTES : MAX_FILE_BYTES)) return { files: [], error: image ? "That image is larger than 5 MB." : "That file is larger than 10 MB." };
    const allowed = ((image ? IMAGE_ACCEPT : field.accept) ?? "").split(",").map((ext) => ext.trim().toLowerCase()).filter(Boolean);
    const extension = /\.[^.]+$/.exec(entry.name.toLowerCase())?.[0] ?? "";
    if (allowed.length > 0 && !allowed.includes(extension)) return { files: [], error: `Files of type ${extension || "(none)"} aren't accepted here.` };
    files.push([field.key, entry]);
  }
  return { files };
}

function multipart(payload: Record<string, unknown>, files: [string, File][]): FormData {
  const form = new FormData();
  for (const [key, value] of Object.entries(payload)) {
    if (value === null) continue;
    if (Array.isArray(value)) value.forEach((item) => form.append(key, String(item)));
    else form.append(key, String(value));
  }
  for (const [key, file] of files) form.append(key, file);
  return form;
}

const randomSuffix = () => `-${Math.random().toString(36).slice(2, 6)}`;

async function send(type: ContentTypeKey, mode: "create" | "update", key: string | null, form: FormData): Promise<CmsMutation> {
  const resource = RESOURCES[type];
  const fileField = resource.fields.find((f) => f.kind === "file");
  const uploads = uploadsFrom(type, form);
  if (uploads.error) return { ok: false, message: uploads.error };
  if (mode === "create" && fileField && !uploads.files.some(([key]) => key === fileField.key)) return { ok: false, message: `${fileField.label} is required.` };

  const accessToken = await getAccessToken();
  if (!accessToken) return signedOut;

  const values = valuesFrom(type, form);
  const attempt = async (suffix: string) => {
    const built = toPayload(type, values, mode, suffix);
    if (!built.ok) return built;
    const body = uploads.files.length > 0 ? { form: multipart(built.payload, uploads.files) } : { json: built.payload };
    const path = mode === "create" ? resource.path : objectPath(type, key as string);
    return backendRequest(mode === "create" ? "POST" : "PATCH", path, { accessToken, ...body });
  };

  let result = await attempt("");
  // Auto-generated slugs can collide with an existing object; retry once with a short random suffix.
  if ("data" in result && mode === "create" && resource.slugFrom && result.status === 400 && result.data && typeof result.data === "object" && "slug" in result.data) {
    result = await attempt(randomSuffix());
  }

  if (!("data" in result)) return { ok: false, message: result.message };
  if (!result.ok) return failure(result);
  return { ok: true, record: toCmsRecord(type, result.data as ApiRecord) };
}

export async function createCmsAction(type: ContentTypeKey, form: FormData): Promise<CmsMutation> {
  if (!isType(type) || !(form instanceof FormData)) return { ok: false, message: "That request isn't valid." };
  return send(type, "create", null, form);
}

export async function updateCmsAction(type: ContentTypeKey, key: string, form: FormData): Promise<CmsMutation> {
  if (!isType(type) || !isKey(key) || !(form instanceof FormData)) return { ok: false, message: "That request isn't valid." };
  return send(type, "update", key, form);
}

/** Moves an object through the workflow (draft, in review, approved, published, unpublished). The backend checks the role. */
export async function transitionCmsAction(type: ContentTypeKey, key: string, next: WorkflowStatus): Promise<CmsMutation> {
  if (!isType(type) || !isKey(key) || !isStatus(next)) return { ok: false, message: "That request isn't valid." };
  const accessToken = await getAccessToken();
  if (!accessToken) return signedOut;

  const result = await backendRequest("POST", `${objectPath(type, key)}transition/`, { accessToken, json: { status: next } });
  return result.ok ? { ok: true, record: toCmsRecord(type, result.data as ApiRecord) } : failure(result);
}

export async function deleteCmsAction(type: ContentTypeKey, key: string): Promise<CmsMutation> {
  if (!isType(type) || !isKey(key)) return { ok: false, message: "That request isn't valid." };
  const accessToken = await getAccessToken();
  if (!accessToken) return signedOut;

  const result = await backendRequest("DELETE", objectPath(type, key), { accessToken });
  return result.ok ? { ok: true } : failure(result);
}
