import type { Dataset } from "./types";

export type AccessState = "full" | "requestable" | "locked";

export type DatasetSummary = {
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

export type ResourcePreview = { label: string; format: string; columns: string[]; rows: string[][] };
