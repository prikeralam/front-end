"use server";

import { backendRequest } from "../api/backendRequest";
import {
  APPLICATION_DOCUMENTS,
  toApplicationRow,
  type ApiApplication,
  type ApplicationDocument,
  type ApplicationRow,
  type ApplicationStatus,
} from "../api/applicationAdapter";
import { getAccessToken } from "../auth/serverAuth";

// Applications sent through /fellowship/apply (website-backend's careers app). Editors and admins read them, open the
// CV, cover letter and writing sample, and mark them reviewed; the backend answers 403 to anyone else. Arguments are validated because Server
// Actions are public POST endpoints.

const PATH = "/api/v1/applications/";
const MAX_PAGE = 100_000;
const signedOut = "Your session has ended. Please sign in again.";

export type ApplicationsPage =
  | { status: "ok"; applications: ApplicationRow[]; count: number; hasNext: boolean; hasPrevious: boolean }
  | { status: "signed-out" | "forbidden" | "invalid" | "error" };

export type ApplicationUpdate = { ok: true; application: ApplicationRow } | { ok: false; error: string };
export type ApplicationFile = { ok: true; url: string } | { ok: false; error: string };

const isStatus = (value: unknown): value is ApplicationStatus => value === "new" || value === "reviewed";
const isId = (id: unknown): id is number => Number.isInteger(id) && (id as number) > 0 && (id as number) < 2 ** 31;

/** One page of applications, newest first, optionally only new or only reviewed ones. */
export async function listApplicationsAction({ status = "", page = 1 }: { status?: ApplicationStatus | ""; page?: number } = {}): Promise<ApplicationsPage> {
  if (status !== "" && !isStatus(status)) return { status: "invalid" };
  if (!Number.isInteger(page) || page < 1 || page > MAX_PAGE) return { status: "invalid" };

  const accessToken = await getAccessToken();
  if (!accessToken) return { status: "signed-out" };

  const params = new URLSearchParams({ page: String(page) });
  if (status) params.set("status", status);
  const result = await backendRequest("GET", `${PATH}?${params}`, { accessToken });
  if (result.status === 401) return { status: "signed-out" };
  if (result.status === 403) return { status: "forbidden" };
  const body = result.data as { count?: number; next?: string | null; previous?: string | null; results?: ApiApplication[] } | null;
  if (!result.ok || !body || !Array.isArray(body.results)) return { status: "error" };

  return { status: "ok", applications: body.results.map(toApplicationRow), count: body.count ?? body.results.length, hasNext: !!body.next, hasPrevious: !!body.previous };
}

/** Marks an application reviewed, or new again. */
export async function setApplicationStatusAction(id: number, status: ApplicationStatus): Promise<ApplicationUpdate> {
  if (!isId(id)) return { ok: false, error: "That application no longer exists." };
  if (!isStatus(status)) return { ok: false, error: "The server rejected that." };

  const accessToken = await getAccessToken();
  if (!accessToken) return { ok: false, error: signedOut };

  const result = await backendRequest("PATCH", `${PATH}${id}/`, { accessToken, json: { status } });
  if (result.ok && result.data && typeof result.data === "object") return { ok: true, application: toApplicationRow(result.data as ApiApplication) };
  if (result.status === 401) return { ok: false, error: signedOut };
  if (result.status === 403) return { ok: false, error: "Only editors and admins can manage applications." };
  if (result.status === 404) return { ok: false, error: "That application no longer exists." };
  return { ok: false, error: "Something went wrong on the server. Please try again." };
}

/** A short-lived link to an applicant's CV, cover letter or writing sample. Fetched when staff click, never stored on
 * the page. */
export async function getApplicationFileAction(id: number, document: ApplicationDocument): Promise<ApplicationFile> {
  if (!isId(id) || !(APPLICATION_DOCUMENTS as readonly string[]).includes(document)) return { ok: false, error: "That file isn't available." };

  const accessToken = await getAccessToken();
  if (!accessToken) return { ok: false, error: signedOut };

  const result = await backendRequest("GET", `${PATH}${id}/files/${document}/`, { accessToken });
  const url = (result.data as { file?: unknown } | null)?.file;
  if (result.ok && typeof url === "string" && /^https?:\/\//.test(url)) return { ok: true, url };
  if (result.status === 401) return { ok: false, error: signedOut };
  if (result.status === 403) return { ok: false, error: "Only editors and admins can open applications." };
  if (result.status === 404) return { ok: false, error: document === "writing_sample" ? "No writing sample was sent." : "That application no longer exists." };
  return { ok: false, error: "We couldn't open that file. Please try again." };
}
