import "server-only";
import { apiBaseUrl } from "./client";
import { describeErrorBody } from "./errors";

/**
 * A plain, uncached request to the backend on behalf of a user, for the CMS Server Actions, whose paths and payloads
 * are chosen at runtime and so cannot use the typed client. Responses are parsed defensively: the backend can answer
 * with an HTML error page or an empty body (204).
 */
export type BackendResult = { ok: boolean; status: number; data: unknown; message: string };

export async function backendRequest(
  method: "GET" | "POST" | "PATCH" | "DELETE",
  path: string,
  { accessToken, json, form }: { accessToken: string; json?: unknown; form?: FormData },
): Promise<BackendResult> {
  const headers: Record<string, string> = { Authorization: `Bearer ${accessToken}`, Accept: "application/json" };
  let body: BodyInit | undefined;
  if (form) body = form; // fetch sets the multipart boundary itself
  else if (json !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(json);
  }

  const response = await fetch(`${apiBaseUrl()}${path}`, { method, headers, body, cache: "no-store" });
  const text = await response.text();
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }
  return { ok: response.ok, status: response.status, data, message: response.ok ? "" : describeErrorBody(data) };
}

/** Every item of a paginated list, following `next` links. */
export async function backendListAll(path: string, accessToken: string): Promise<{ ok: true; items: Record<string, unknown>[] } | { ok: false; status: number }> {
  const items: Record<string, unknown>[] = [];
  for (let page = 1; page <= 200; page++) {
    const result = await backendRequest("GET", `${path}?page=${page}`, { accessToken });
    if (!result.ok) return { ok: false, status: result.status };
    const body = result.data as { results?: Record<string, unknown>[]; next?: string | null } | null;
    items.push(...(body?.results ?? []));
    if (!body?.next) return { ok: true, items };
  }
  return { ok: true, items };
}
