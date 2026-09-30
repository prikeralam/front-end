"use server";

import { backendRequest } from "../api/backendRequest";
import { toInboxMessage, type ApiContactMessage, type InboxMessage, type InboxStatus } from "../api/inboxAdapter";
import { getAccessToken } from "../auth/serverAuth";

// The contact inbox (backend Module G). Editors and admins read messages sent through /contact and mark them handled;
// the backend answers 403 to anyone else. Arguments are validated because Server Actions are public POST endpoints.

const PATH = "/api/v1/contact-messages/";
const MAX_PAGE = 100_000;

export type InboxPage =
  | { status: "ok"; messages: InboxMessage[]; count: number; hasNext: boolean; hasPrevious: boolean }
  | { status: "signed-out" | "forbidden" | "invalid" | "error" };

export type InboxUpdate = { ok: true; message: InboxMessage } | { ok: false; error: string };

const isStatus = (value: unknown): value is InboxStatus => value === "new" || value === "handled";
const signedOut = "Your session has ended. Please sign in again.";

/** One page of messages, newest first, optionally only new or only handled ones. */
export async function listInboxAction({ status = "", page = 1 }: { status?: InboxStatus | ""; page?: number } = {}): Promise<InboxPage> {
  if (status !== "" && !isStatus(status)) return { status: "invalid" };
  if (!Number.isInteger(page) || page < 1 || page > MAX_PAGE) return { status: "invalid" };

  const accessToken = await getAccessToken();
  if (!accessToken) return { status: "signed-out" };

  const params = new URLSearchParams({ page: String(page) });
  if (status) params.set("status", status);
  const result = await backendRequest("GET", `${PATH}?${params}`, { accessToken });
  if (result.status === 401) return { status: "signed-out" };
  if (result.status === 403) return { status: "forbidden" };
  const body = result.data as { count?: number; next?: string | null; previous?: string | null; results?: ApiContactMessage[] } | null;
  if (!result.ok || !body || !Array.isArray(body.results)) return { status: "error" };

  return { status: "ok", messages: body.results.map(toInboxMessage), count: body.count ?? body.results.length, hasNext: !!body.next, hasPrevious: !!body.previous };
}

/** Marks a message handled, or new again. */
export async function setInboxStatusAction(id: number, status: InboxStatus): Promise<InboxUpdate> {
  if (!Number.isInteger(id) || id < 1 || id >= 2 ** 31) return { ok: false, error: "That message no longer exists." };
  if (!isStatus(status)) return { ok: false, error: "The server rejected that." };

  const accessToken = await getAccessToken();
  if (!accessToken) return { ok: false, error: signedOut };

  const result = await backendRequest("PATCH", `${PATH}${id}/`, { accessToken, json: { status } });
  if (result.ok && result.data && typeof result.data === "object") return { ok: true, message: toInboxMessage(result.data as ApiContactMessage) };
  if (result.status === 401) return { ok: false, error: signedOut };
  if (result.status === 403) return { ok: false, error: "Only editors and admins can manage the inbox." };
  if (result.status === 404) return { ok: false, error: "That message no longer exists." };
  return { ok: false, error: "Something went wrong on the server. Please try again." };
}
