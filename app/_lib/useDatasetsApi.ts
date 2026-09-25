"use client";

import { useEffect, useState } from "react";
import type { MockSession } from "./mockAuth";
import type { AccessRequestRow, DatasetSummary } from "./datasetTypes";
import { decideAccessRequestAction, listAccessRequestsAction, listDatasetsAction } from "./dashboard/datasetActions";
import { getRequestedDatasets } from "./requestedAccess";

export type { AccessRequestRow } from "./datasetTypes";

/** All datasets visible to this session (or the public set, if session is null). */
export function useDatasets(session: MockSession | null, deps: unknown[] = []): DatasetSummary[] {
  const [datasets, setDatasets] = useState<DatasetSummary[]>([]);
  useEffect(() => {
    let current = true;
    listDatasetsAction()
      .then((list) => current && setDatasets(list))
      .catch(() => current && setDatasets([]));
    return () => {
      current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.email, ...deps]);
  return datasets;
}

/** Reviewer-only: the pending access-request queue. Empty for anyone the backend does not treat as staff. */
export function usePendingAccessRequests(session: MockSession | null, deps: unknown[] = []): AccessRequestRow[] {
  const [rows, setRows] = useState<AccessRequestRow[]>([]);
  useEffect(() => {
    if (!session) return;
    let current = true;
    listAccessRequestsAction()
      .then((list) => current && setRows(list))
      .catch(() => current && setRows([]));
    return () => {
      current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.email, ...deps]);
  return rows;
}

/**
 * The datasets this browser's user has asked for. The API cannot list a requester's own requests (gap G4), so this is
 * a local hint; see `requestedAccess.ts`.
 */
export function useMyAccessRequests(session: MockSession | null, deps: unknown[] = []): AccessRequestRow[] {
  const [rows, setRows] = useState<AccessRequestRow[]>([]);
  useEffect(() => {
    if (!session) return;
    const email = session.email;
    // Defer past the effect body, as the state comes from an external store (localStorage).
    const timer = setTimeout(
      () =>
        setRows(
          getRequestedDatasets(email).map((datasetSlug) => ({
            id: datasetSlug,
            datasetSlug,
            requesterEmail: email,
            requesterName: session.name,
            status: "pending",
            createdAt: "",
          })),
        ),
      0,
    );
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.email, ...deps]);
  return rows;
}

export async function decideAccessRequestApi(requestId: string, decision: "approved" | "denied"): Promise<boolean> {
  return decideAccessRequestAction(requestId, decision);
}
