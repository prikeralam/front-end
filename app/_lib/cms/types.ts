/** Shapes shared by the CMS screens (client) and the CMS Server Actions (server). No runtime imports: safe anywhere. */

export type WorkflowStatus = "draft" | "in_review" | "approved" | "published" | "unpublished";

export const workflowStatusLabel: Record<WorkflowStatus, string> = {
  draft: "Draft",
  in_review: "In review",
  approved: "Approved",
  published: "Published",
  unpublished: "Unpublished",
};

export const WORKFLOW_STATUSES = Object.keys(workflowStatusLabel) as WorkflowStatus[];

export type ContentTypeKey =
  | "content-block"
  | "testimonial"
  | "person-profile"
  | "partner"
  | "document"
  | "project"
  | "publication"
  | "dataset"
  | "mention"
  | "recognition"
  | "collection"
  | "job"
  | "event";

export const contentTypeLabel: Record<ContentTypeKey, string> = {
  "content-block": "Content block",
  testimonial: "Testimonial",
  "person-profile": "Person profile",
  partner: "Partner",
  document: "Document",
  project: "Project",
  publication: "Publication",
  dataset: "Dataset",
  mention: "Mention",
  recognition: "Recognition",
  collection: "Collection",
  job: "Job opening",
  event: "Event or campaign",
};

export const ALL_CONTENT_TYPES = Object.keys(contentTypeLabel) as ContentTypeKey[];

export type FieldOption = { value: string; label: string };

/** Fields whose options come from the backend (`getFormOptionsAction`) rather than a fixed list. */
export type DynamicOptions = "sub-themes" | "authors" | "publications" | "datasets";

export type FieldConfig = {
  key: string;
  label: string;
  /**
   * `image` is an optional upload paired with a link field (`urlKey`); the upload wins when both are set. `lines` is a
   * textarea sent as a list, one item per line; `time` is an HH:MM clock time.
   */
  kind: "text" | "textarea" | "lines" | "select" | "multiselect" | "date" | "time" | "number" | "file" | "image";
  options?: FieldOption[];
  optionsFrom?: DynamicOptions;
  /** Not required to submit. */
  optional?: boolean;
  /** What a blank optional field sends; `null` when unset. For fields the API won't take as null, e.g. an order. */
  emptyValue?: string | number;
  /** Set when creating, then fixed (a slug is part of the object's address). */
  createOnly?: boolean;
  /** Extensions offered by the file picker, e.g. ".pdf,.docx". */
  accept?: string;
  /** Upload size cap for a `file` field, in MB; 10 when unset. */
  maxMb?: number;
  /** For `image` fields: the API's link field that sits beside the upload, e.g. `photo_url`. */
  urlKey?: string;
  help?: string;
};

/** One content object as the CMS screens see it, whatever resource it came from. */
export type CmsRecord = {
  /** What the API addresses this object by: the slug for content blocks, publications and datasets, else the id. */
  key: string;
  type: ContentTypeKey;
  status: WorkflowStatus;
  /** User id of the creator, for "is this mine?" checks. The backend enforces the real rules. */
  createdBy: number;
  updatedAt: string;
  title: string;
  subtitle: string;
  /** Form values, keyed by `FieldConfig.key`. File fields are always empty here. */
  values: Record<string, string>;
  fileUrl?: string;
  /** The image to show in lists: the uploaded file, else the linked URL. */
  imageUrl?: string;
};

export type CmsListResult =
  | { status: "ok"; records: CmsRecord[] }
  | { status: "signed-out" }
  | { status: "forbidden" }
  | { status: "error" };

export type CmsMutation = { ok: true; record?: CmsRecord } | { ok: false; message: string };
