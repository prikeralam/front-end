"use server";

import { backendListAll, backendRequest, type BackendResult } from "../api/backendRequest";
import { listPeopleById } from "../api/people";
import { listThemes } from "../api/themes";
import { getAccessToken } from "../auth/serverAuth";
import {
  KEY_PATTERN,
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
  type FieldOption,
  type WorkflowStatus,
} from "../cms/types";

// Server Actions are public POST endpoints: every argument is validated here (content type, key, status, file), and
// the backend decides who may do what (contributors create and edit their own drafts, editors and admins review,
// publish and delete). This file never grants anything; it only relays and reports.

const MAX_FILE_BYTES = 10 * 1024 * 1024;

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

export type FormOptions = { "sub-themes": FieldOption[]; authors: FieldOption[] };

/** Choices for the form fields that point at other objects: sub-themes (grouped under their theme) and people. */
export async function getFormOptionsAction(): Promise<FormOptions> {
  const [themes, people] = await Promise.all([listThemes(), listPeopleById()]);
  const nameById = new Map(themes.map((theme) => [theme.id, theme.name]));
  return {
    "sub-themes": themes
      .filter((theme) => theme.parent !== null && theme.parent !== undefined)
      .map((theme) => ({ value: String(theme.id), label: `${nameById.get(theme.parent as number) ?? "Theme"} › ${theme.name}` })),
    authors: [...people].map(([id, person]) => ({ value: String(id), label: person.name })),
  };
}

function valuesFrom(type: ContentTypeKey, form: FormData): Record<string, string> {
  return Object.fromEntries(RESOURCES[type].fields.filter((f) => f.kind !== "file").map((f) => [f.key, String(form.get(f.key) ?? "")]));
}

type Upload = { file: File | null; error?: string };

/** A chosen file, checked against the field's allowlist and the size cap; an empty picker is "no file". */
function uploadFrom(type: ContentTypeKey, form: FormData): Upload {
  const field = RESOURCES[type].fields.find((f) => f.kind === "file");
  const entry = form.get("file");
  if (!field || !(entry instanceof File) || entry.size === 0) return { file: null };

  if (entry.size > MAX_FILE_BYTES) return { file: null, error: "That file is larger than 10 MB." };
  const allowed = (field.accept ?? "").split(",").map((ext) => ext.trim().toLowerCase()).filter(Boolean);
  const extension = /\.[^.]+$/.exec(entry.name.toLowerCase())?.[0] ?? "";
  if (allowed.length > 0 && !allowed.includes(extension)) return { file: null, error: `Files of type ${extension || "(none)"} aren't accepted here.` };
  return { file: entry };
}

function multipart(payload: Record<string, unknown>, file: File): FormData {
  const form = new FormData();
  for (const [key, value] of Object.entries(payload)) {
    if (value === null) continue;
    if (Array.isArray(value)) value.forEach((item) => form.append(key, String(item)));
    else form.append(key, String(value));
  }
  form.append("file", file);
  return form;
}

const randomSuffix = () => `-${Math.random().toString(36).slice(2, 6)}`;

async function send(type: ContentTypeKey, mode: "create" | "update", key: string | null, form: FormData): Promise<CmsMutation> {
  const resource = RESOURCES[type];
  const fileField = resource.fields.find((f) => f.kind === "file");
  const upload = uploadFrom(type, form);
  if (upload.error) return { ok: false, message: upload.error };
  if (mode === "create" && fileField && !upload.file) return { ok: false, message: `${fileField.label} is required.` };

  const accessToken = await getAccessToken();
  if (!accessToken) return signedOut;

  const values = valuesFrom(type, form);
  const attempt = async (suffix: string) => {
    const built = toPayload(type, values, mode, suffix);
    if (!built.ok) return built;
    const body = upload.file ? { form: multipart(built.payload, upload.file) } : { json: built.payload };
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
