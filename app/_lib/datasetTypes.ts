import type { Dataset } from "./types";

export type AccessState = "full" | "requestable" | "locked";

export type DatasetSummary = {
  /** API id: access requests reference datasets by id, not slug. */
  id?: number;
  slug: string;
  title: string;
  description: string;
  visibility: Dataset["visibility"];
  accessState: AccessState;
  theme: string | null;
  geography?: string;
  year?: string;
  type?: string;
  source?: string;
  coverage?: string;
  frequency?: string;
  lastUpdated?: string;
  fileFormat: string | null;
};

export type DatasetDetail = DatasetSummary & {
  tags: string[];
  files: { label: string; path: string }[];
};

export type AccessRequestRow = {
  id: string;
  datasetSlug: string;
  /** The API exposes only the requester's user id (backend gap G4/G6), so name and email are best-effort. */
  requesterEmail: string;
  requesterName: string;
  status: "pending" | "approved" | "denied";
  createdAt: string;
};

export type ResourcePreview = { label: string; format: string; columns: string[]; rows: string[][] };
