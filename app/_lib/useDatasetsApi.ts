"use client";

import { useEffect, useState } from "react";
import { mockSessionHeaders, type MockSession } from "./mockAuth";
import type { DatasetSummary } from "./datasetsService";

export type AccessRequestRow = {
  id: string;
  datasetSlug: string;
  requesterEmail: string;
  requesterName: string;
  status: "pending" | "approved" | "denied";
  createdAt: string;
};

/** All datasets visible to this session (or the public set, if session is null). */
export function useDatasets(session: MockSession | null, deps: unknown[] = []): DatasetSummary[] {
  const [datasets, setDatasets] = useState<DatasetSummary[]>([]);
  useEffect(() => {
    fetch("/api/datasets", { headers: mockSessionHeaders(session) })
      .then((r) => r.json())
      .then((d) => setDatasets(d.results ?? []));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.email, ...deps]);
  return datasets;
}

/** Reviewer-only: the full pending access-request queue. */
export function usePendingAccessRequests(session: MockSession | null, deps: unknown[] = []): AccessRequestRow[] {
  const [rows, setRows] = useState<AccessRequestRow[]>([]);
  useEffect(() => {
    if (!session) return;
    fetch("/api/access-requests", { headers: mockSessionHeaders(session) })
      .then((r) => (r.ok ? r.json() : { results: [] }))
      .then((d) => setRows(d.results ?? []));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.email, ...deps]);
  return rows;
}

/** The caller's own access requests. */
export function useMyAccessRequests(session: MockSession | null, deps: unknown[] = []): AccessRequestRow[] {
  const [rows, setRows] = useState<AccessRequestRow[]>([]);
  useEffect(() => {
    if (!session) return;
    fetch("/api/access-requests?mine=1", { headers: mockSessionHeaders(session) })
      .then((r) => (r.ok ? r.json() : { results: [] }))
      .then((d) => setRows(d.results ?? []));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.email, ...deps]);
  return rows;
}

export async function decideAccessRequestApi(
  session: MockSession,
  datasetSlug: string,
  requesterEmail: string,
  decision: "approved" | "denied"
) {
  await fetch("/api/access-requests", {
    method: "PATCH",
    headers: { ...mockSessionHeaders(session), "Content-Type": "application/json" },
    body: JSON.stringify({ datasetSlug, requesterEmail, decision }),
  });
}
