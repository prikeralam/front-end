"use server";

import { uncachedApi } from "../api/client";
import { toAuditRow, type AuditRow } from "../api/auditAdapter";
import { getAccessToken } from "../auth/serverAuth";

const AUDIT_PATH = "/api/v1/audit-log/";
const MODULE = /^[a-z][a-z0-9_-]{0,49}$/i;
const MAX_PAGE = 100_000;

export type AuditFilters = { module?: string; actor?: string; page?: number };

export type AuditPage =
  | { status: "ok"; rows: AuditRow[]; count: number; hasNext: boolean; hasPrevious: boolean }
  | { status: "signed-out" }
  | { status: "forbidden" }
  | { status: "invalid" }
  | { status: "error" };

/**
 * One page of the cross-module audit log. Admin-only: the backend answers 403 to anyone else and this action reports
 * `forbidden` rather than an empty list, so the page can say so.
 */
export async function listAuditLogAction(filters: AuditFilters = {}): Promise<AuditPage> {
  const { page = 1 } = filters ?? {};
  // An empty filter means "no filter".
  const module = filters?.module || undefined;
  const actor = filters?.actor || undefined;
  if (module !== undefined && (typeof module !== "string" || !MODULE.test(module))) return { status: "invalid" };
  if (actor !== undefined && (typeof actor !== "string" || !/^\d{1,9}$/.test(actor))) return { status: "invalid" };
  if (!Number.isInteger(page) || page < 1 || page > MAX_PAGE) return { status: "invalid" };

  const accessToken = await getAccessToken();
  if (!accessToken) return { status: "signed-out" };

  const result = await uncachedApi(accessToken).GET(AUDIT_PATH, {
    params: { query: { module: module || undefined, actor: actor ? Number(actor) : undefined, page } },
  });
  if (result.response.status === 401) return { status: "signed-out" };
  if (result.response.status === 403) return { status: "forbidden" };
  if (!result.data) return { status: "error" };

  return {
    status: "ok",
    rows: result.data.results.map(toAuditRow),
    count: result.data.count,
    hasNext: !!result.data.next,
    hasPrevious: !!result.data.previous,
  };
}
