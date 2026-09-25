"use client";

import { useEffect, useState } from "react";
import type { AuditRow } from "./api/auditAdapter";
import type { CmsRecord } from "./cms/types";
import { listAuditLogAction } from "./dashboard/auditActions";
import { listAllCmsAction } from "./dashboard/cmsActions";
import type { Session } from "./session";

/** Every CMS object of every type the signed-in user may see. Empty until loaded, and on any failure. */
export function useCmsRecords(session: Session | null, deps: unknown[] = []): CmsRecord[] {
  const [records, setRecords] = useState<CmsRecord[]>([]);
  useEffect(() => {
    if (!session) return;
    let current = true;
    listAllCmsAction()
      .then((list) => current && setRecords(list))
      .catch(() => current && setRecords([]));
    return () => {
      current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.email, ...deps]);
  return records;
}

/** The latest audit-log entries. Admin-only on the backend, so anyone else simply gets none. */
export function useRecentAudit(session: Session | null, limit = 8): AuditRow[] {
  const [rows, setRows] = useState<AuditRow[]>([]);
  useEffect(() => {
    if (!session) return;
    let current = true;
    listAuditLogAction({ page: 1 })
      .then((page) => current && setRows(page.status === "ok" ? page.rows.slice(0, limit) : []))
      .catch(() => current && setRows([]));
    return () => {
      current = false;
    };
  }, [session, limit]);
  return rows;
}
