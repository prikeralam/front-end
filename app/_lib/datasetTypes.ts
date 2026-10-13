import type { Dataset } from "./types";

/**
 * What the visitor may do with a dataset's files. `signin`: a public dataset, downloadable by anyone with a signed-in,
 * email-confirmed account (the backend withholds the files until then).
 */
export type AccessState = "full" | "signin" | "requestable" | "locked";

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
  /** ISO timestamp of the last change, for the default citation's year. */
  updatedAt?: string;
  /** The main file's format, the one previews read (e.g. "CSV"). */
  fileFormat: string | null;
  /** Every format the dataset comes in, main first (e.g. ["CSV", "JSON"]). Known even when the files are locked. */
  formats: string[];
  /** e.g. "District, Year". */
  granularity?: string;
  /** e.g. "2014-15 to 2024-25". */
  timePeriod?: string;
  /** Worked out by the backend from the file; absent when it couldn't read it. */
  rowCount?: number;
  columnCount?: number;
};

export type DatasetDetail = DatasetSummary & {
  columns: string[];
  /** PRI's own citation text, when set; otherwise a default is built (`citationFor`). */
  citation?: string;
  tags: string[];
  /** What the caller may download: the main file first, then other formats. Empty when the files are locked. */
  files: DatasetFile[];
};

export type DatasetFile = { label: string; format: string; path: string; size?: number };

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
