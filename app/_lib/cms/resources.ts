import { ALL_DATASET_EXTENSIONS, DATASET_FORMATS, DATASET_MAX_MB } from "../datasetFormats";
import type { CmsRecord, ContentTypeKey, FieldConfig, FieldOption, WorkflowStatus } from "./types";

/**
 * What each CMS content type is on the API, and how a screen's form values map to and from it. Pure and
 * dependency-free so the mapping can be unit tested; the Server Actions in `dashboard/cmsActions.ts` do the I/O.
 */

/** A record as the API returns it: values are untyped until mapped. */
export type ApiRecord = Record<string, unknown> & { id: number; status: WorkflowStatus; created_by: number; updated_at: string };

export type Resource = {
  path: string;
  /** The URL segment that addresses one object. */
  lookup: "id" | "slug";
  /** Fixed values added to every create (e.g. a partner is a person profile in the `partner` group). */
  fixed?: Record<string, unknown>;
  /** Decides whether a listed API record belongs to this content type (people and partners share an endpoint). */
  belongs?: (record: ApiRecord) => boolean;
  /** Where an auto-generated slug comes from, when the form has no slug field. */
  slugFrom?: (values: Record<string, string>) => string;
  fields: FieldConfig[];
  title: (values: Record<string, string>) => string;
  subtitle: (values: Record<string, string>, record: ApiRecord) => string;
};

/** Image uploads the backend accepts (JPG, PNG, WebP up to 5 MB). */
export const IMAGE_ACCEPT = ".jpg,.jpeg,.png,.webp";
/** Form value meaning "remove the uploaded image" (sent to the API as null). */
export const REMOVE_IMAGE = "__remove__";

const options = (...pairs: [string, string][]): FieldOption[] => pairs.map(([value, label]) => ({ value, label }));

export const PERSON_GROUPS = options(
  ["team", "Team"],
  ["patron", "Patron"],
  ["advisory", "Advisory body"],
  ["executive", "Executive council"],
  ["fellow", "Fellow"],
  ["past-fellow", "Past fellow"],
  ["author", "Author"],
);

export const MENTION_KINDS = options(["news", "News"], ["research", "Research paper"], ["report", "Report"], ["legislature", "Legislature"], ["other", "Other"]);

export const RESOURCES: Record<ContentTypeKey, Resource> = {
  "content-block": {
    path: "/api/v1/content-blocks/",
    lookup: "slug",
    fields: [
      { key: "slug", label: "Slug", kind: "text", createOnly: true, help: "Letters, numbers, dashes. The page section is addressed by it." },
      { key: "title", label: "Title", kind: "text" },
      { key: "body", label: "Body", kind: "textarea" },
      { key: "seo_title", label: "SEO title", kind: "text", optional: true },
      { key: "seo_description", label: "SEO description", kind: "textarea", optional: true },
    ],
    title: (v) => v.title,
    subtitle: (v) => `/${v.slug}`,
  },
  testimonial: {
    path: "/api/v1/testimonials/",
    lookup: "id",
    slugFrom: (v) => v.attribution,
    fields: [
      { key: "quote", label: "Quote", kind: "textarea" },
      { key: "attribution", label: "Attributed name", kind: "text" },
      { key: "role", label: "Role / affiliation", kind: "text", optional: true },
    ],
    title: (v) => v.quote,
    subtitle: (v) => [v.attribution, v.role].filter(Boolean).join(" · "),
  },
  "person-profile": {
    path: "/api/v1/people/",
    lookup: "id",
    belongs: (r) => r.group !== "partner",
    slugFrom: (v) => v.name,
    fields: [
      { key: "name", label: "Name", kind: "text" },
      { key: "role_title", label: "Role / title", kind: "text" },
      { key: "group", label: "Group", kind: "select", options: PERSON_GROUPS },
      { key: "bio", label: "Bio", kind: "textarea", optional: true },
      { key: "photo", label: "Photo", kind: "image", urlKey: "photo_url", optional: true },
      { key: "linkedin_url", label: "LinkedIn profile", kind: "text", optional: true, help: "The https://www.linkedin.com/in/… address. Shown as an icon on the public profile." },
      { key: "email", label: "Public email", kind: "text", optional: true, help: "Shown on the public profile. Leave blank to keep it private." },
      { key: "display_order", label: "Display order", kind: "number", optional: true, emptyValue: 0, help: "Lower numbers appear first on the public page (1, 2, 3…). People with the same number keep the order they were added in." },
    ],
    title: (v) => v.name,
    subtitle: (v) => [v.role_title, PERSON_GROUPS.find((g) => g.value === v.group)?.label].filter(Boolean).join(" · "),
  },
  partner: {
    path: "/api/v1/people/",
    lookup: "id",
    fixed: { group: "partner" },
    belongs: (r) => r.group === "partner",
    slugFrom: (v) => v.name,
    fields: [
      { key: "name", label: "Name", kind: "text" },
      // The API has no institution/researcher field; the public site reads "institution" in the role title.
      { key: "role_title", label: "Type", kind: "select", options: options(["Partner institution", "Institution"], ["Partner researcher", "Researcher"]) },
      { key: "bio", label: "Description", kind: "textarea", optional: true },
      { key: "photo", label: "Logo", kind: "image", urlKey: "photo_url", optional: true },
      { key: "website_url", label: "Website", kind: "text", optional: true, help: "The partner's own site, starting with https://. Their card on the Partners page links to it." },
      { key: "display_order", label: "Display order", kind: "number", optional: true, emptyValue: 0, help: "Lower numbers appear first on the public page (1, 2, 3…). People with the same number keep the order they were added in." },
    ],
    title: (v) => v.name,
    subtitle: (v) => v.role_title,
  },
  document: {
    path: "/api/v1/documents/",
    lookup: "id",
    slugFrom: (v) => [v.title, v.year].filter(Boolean).join(" "),
    fields: [
      { key: "title", label: "Title", kind: "text" },
      {
        key: "document_type",
        label: "Kind",
        kind: "select",
        options: options(["annual-report", "Annual report"], ["strategic-plan", "Strategic plan"], ["policy-brief", "Policy brief"], ["issue", "Issue"]),
      },
      { key: "year", label: "Year", kind: "number", optional: true },
      { key: "description", label: "Description", kind: "textarea", optional: true },
      { key: "file", label: "File", kind: "file", accept: ".pdf,.doc,.docx,.xls,.xlsx,.csv,.png,.jpg,.jpeg", help: "Required when creating. Leave empty on edit to keep the current file." },
    ],
    title: (v) => v.title,
    subtitle: (v) => [v.document_type.replace(/-/g, " "), v.year].filter(Boolean).join(" · "),
  },
  project: {
    path: "/api/v1/projects/",
    lookup: "id",
    fields: [
      { key: "slug", label: "Slug", kind: "text" },
      { key: "title", label: "Title", kind: "text" },
      { key: "blurb", label: "Blurb", kind: "textarea" },
      { key: "stage", label: "Stage", kind: "select", options: options(["ongoing", "Ongoing"], ["completed", "Completed"]), help: "Shown as a tag on the project's cards." },
      { key: "image", label: "Image", kind: "image", urlKey: "image_url", optional: true },
      {
        key: "facts",
        label: "Key facts",
        kind: "lines",
        optional: true,
        help: "The fact sheet beside the write-up. One per line, as “Label: value”, e.g. “Project duration: November 2025 - February 2026”.",
      },
      {
        key: "details",
        label: "Write-up",
        kind: "textarea",
        optional: true,
        rows: 16,
        help: "Opening paragraphs first (always shown). Then “## Heading” starts a section and “### Heading” a sub-section; visitors click a heading to open it. Start a line with “- ” for a bullet, wrap words in **double stars** for bold, and leave a blank line between paragraphs.",
      },
      { key: "cta_label", label: "Button label", kind: "text", optional: true },
      { key: "cta_href", label: "Button link", kind: "text", optional: true },
    ],
    title: (v) => v.title,
    subtitle: (v) => `/projects/${v.slug}`,
  },
  publication: {
    path: "/api/v1/publications/",
    lookup: "slug",
    slugFrom: (v) => v.title,
    fields: [
      { key: "title", label: "Title", kind: "text" },
      { key: "abstract", label: "Abstract", kind: "textarea" },
      {
        key: "format",
        label: "Format",
        kind: "select",
        options: options(["report", "Report"], ["working_paper", "Working paper"], ["brief", "Brief"], ["explainer", "Explainer"], ["infographic", "Infographic"], ["video", "Video"], ["data_story", "Data story"]),
      },
      { key: "sub_theme", label: "Sub-theme", kind: "select", optionsFrom: "sub-themes" },
      { key: "language", label: "Language", kind: "select", options: options(["en", "English"], ["ml", "Malayalam"]) },
      { key: "date", label: "Publication date", kind: "date" },
      { key: "authors", label: "Author", kind: "select", optionsFrom: "authors", optional: true },
      { key: "tags", label: "Tags", kind: "text", optional: true, help: "Comma-separated." },
      { key: "visibility", label: "Visibility", kind: "select", options: options(["public", "Public"], ["private", "Private"]) },
      {
        key: "cover",
        label: "Cover image",
        kind: "image",
        urlKey: "cover_url",
        optional: true,
        help: "Needed before publishing: it is the image on the publication's card in the research list. Drafts can be saved without one.",
      },
      {
        key: "story_html",
        label: "Story file (HTML)",
        kind: "file",
        accept: ".html,.htm",
        maxMb: 5,
        optional: true,
        help: "For data stories: the story body as one HTML file, without its own title or byline (the page shows those). Leave empty on edit to keep the current file.",
      },
    ],
    title: (v) => v.title,
    subtitle: (v) => [v.format.replace(/_/g, " "), v.date].filter(Boolean).join(" · "),
  },
  dataset: {
    path: "/api/v1/datasets/",
    lookup: "slug",
    slugFrom: (v) => v.title,
    fields: [
      { key: "title", label: "Title", kind: "text" },
      { key: "description", label: "Description", kind: "textarea", optional: true },
      { key: "format", label: "Main file format", kind: "select", options: DATASET_FORMATS.map((f) => ({ value: f.code, label: `${f.label} (${f.note})` })) },
      { key: "sub_theme", label: "Sub-theme", kind: "select", optionsFrom: "sub-themes" },
      { key: "geography", label: "Geography", kind: "text", optional: true },
      { key: "year", label: "Year", kind: "number", optional: true },
      { key: "source", label: "Source", kind: "text", optional: true },
      { key: "update_frequency", label: "Update frequency", kind: "text", optional: true },
      { key: "granularity", label: "Granularity", kind: "text", optional: true, help: "What one row describes, e.g. “District, Year”." },
      { key: "time_period", label: "Time period", kind: "text", optional: true, help: "e.g. “2014-15 to 2024-25”." },
      { key: "citation", label: "Citation", kind: "textarea", optional: true, help: "Leave blank to use the standard PRI citation." },
      { key: "visibility", label: "Visibility", kind: "select", options: options(["public", "Public"], ["on_request", "On request"], ["internal_only", "Internal only"]) },
      { key: "file", label: "Main data file", kind: "file", accept: ALL_DATASET_EXTENSIONS, maxMb: DATASET_MAX_MB, help: `Up to ${DATASET_MAX_MB} MB. Required when creating. Leave empty on edit to keep the current file. Add the same data in other formats after saving.` },
    ],
    title: (v) => v.title,
    subtitle: (v) => [v.format.toUpperCase(), v.geography, v.year].filter(Boolean).join(" · "),
  },
  mention: {
    path: "/api/v1/mentions/",
    lookup: "slug",
    slugFrom: (v) => [v.publisher, v.title].filter(Boolean).join(" "),
    fields: [
      { key: "title", label: "Title", kind: "text", help: "The headline or title of the piece that cites PRI." },
      { key: "publisher", label: "Publisher", kind: "text", help: "e.g. The Hindu, a journal, a department." },
      { key: "url", label: "Link", kind: "text", help: "The https:// address of the original." },
      { key: "kind", label: "Kind", kind: "select", options: MENTION_KINDS },
      { key: "date", label: "Date", kind: "date" },
      { key: "summary", label: "Summary", kind: "textarea", optional: true },
      { key: "publisher_logo", label: "Publisher logo", kind: "image", optional: true },
      { key: "publication", label: "Cites publication", kind: "select", optionsFrom: "publications", optional: true },
      { key: "dataset", label: "Cites dataset", kind: "select", optionsFrom: "datasets", optional: true },
    ],
    title: (v) => v.title,
    subtitle: (v) => [v.publisher, v.date].filter(Boolean).join(" · "),
  },
  recognition: {
    path: "/api/v1/recognition/",
    lookup: "slug",
    slugFrom: (v) => [v.title, v.year].filter(Boolean).join(" "),
    fields: [
      { key: "title", label: "Title", kind: "text" },
      { key: "awarded_by", label: "Awarded by", kind: "text" },
      { key: "year", label: "Year", kind: "number" },
      { key: "description", label: "Description", kind: "textarea", optional: true },
      { key: "url", label: "Link", kind: "text", optional: true, help: "An https:// page about it, if there is one." },
      { key: "image", label: "Image", kind: "image", optional: true },
    ],
    title: (v) => v.title,
    subtitle: (v) => [v.awarded_by, v.year].filter(Boolean).join(" · "),
  },
  collection: {
    path: "/api/v1/collections/",
    lookup: "slug",
    slugFrom: (v) => v.title,
    fields: [
      { key: "title", label: "Title", kind: "text" },
      { key: "description", label: "Description", kind: "textarea", optional: true },
      { key: "datasets", label: "Datasets", kind: "multiselect", optionsFrom: "datasets", optional: true },
      { key: "publication", label: "Data story", kind: "select", optionsFrom: "publications", optional: true, help: "The publication these datasets are behind, if any." },
    ],
    title: (v) => v.title,
    subtitle: (v) => {
      const count = v.datasets ? v.datasets.split(",").filter((s) => s.trim()).length : 0;
      return `${count} ${count === 1 ? "dataset" : "datasets"}`;
    },
  },
  job: {
    path: "/api/v1/jobs/",
    lookup: "slug",
    slugFrom: (v) => v.title,
    fields: [
      { key: "title", label: "Role", kind: "text" },
      { key: "summary", label: "Summary", kind: "textarea", optional: true, help: "One or two sentences shown under the role." },
      { key: "description", label: "Description", kind: "textarea", optional: true, help: "Responsibilities and what you look for. Line breaks are kept." },
      { key: "location", label: "Location", kind: "text", optional: true },
      { key: "employment_type", label: "Employment type", kind: "text", optional: true, help: "e.g. Full time, Part time, Contract." },
      { key: "rolling", label: "Applications", kind: "select", options: options(["true", "Rolling: apply any time"], ["false", "Until a deadline"]) },
      { key: "deadline", label: "Deadline", kind: "date", optional: true, help: "Only used when applications are not rolling." },
      { key: "display_order", label: "Display order", kind: "number", optional: true, emptyValue: 0, help: "Lower numbers appear first on the careers page." },
    ],
    title: (v) => v.title,
    subtitle: (v) => (v.rolling === "false" && v.deadline ? `Until ${v.deadline}` : "Rolling"),
  },
  event: {
    path: "/api/v1/events/",
    lookup: "slug",
    slugFrom: (v) => [v.title, v.start_date.slice(0, 4)].filter(Boolean).join(" "),
    fields: [
      { key: "kind", label: "Kind", kind: "select", options: options(["event", "Event"], ["campaign", "Campaign"]) },
      { key: "title", label: "Title", kind: "text" },
      { key: "start_date", label: "Start date", kind: "date" },
      { key: "end_date", label: "End date", kind: "date", optional: true, help: "For campaigns and events over several days." },
      { key: "date_note", label: "Date note", kind: "text", optional: true, help: "Only while the exact date isn't fixed, e.g. “December 2026 (3rd or 4th week)”. Shown instead of the date; the start date still sorts the event and decides Upcoming or Past." },
      { key: "start_time", label: "Start time", kind: "time", optional: true },
      { key: "end_time", label: "End time", kind: "time", optional: true },
      { key: "location", label: "Venue", kind: "text", optional: true },
      { key: "mode", label: "Mode", kind: "select", optional: true, options: options(["in_person", "In person"], ["online", "Online"], ["hybrid", "Hybrid"]) },
      { key: "summary", label: "Summary", kind: "textarea", optional: true, help: "One or two sentences, shown under the title and on cards." },
      { key: "focus_areas", label: "Focus areas", kind: "lines", optional: true, help: "One per line. Start a line with a short heading and a colon to show it in bold, e.g. “Demographic transition: Fertility declines across communities”." },
      { key: "speakers", label: "Speakers & participants", kind: "lines", optional: true, help: "One per line, as “Role: Name (detail)”, e.g. “Lead speaker: Muhammed Thufail”." },
      { key: "collaborators", label: "Collaborators", kind: "lines", optional: true, help: "One organisation per line." },
      { key: "body", label: "Other details", kind: "textarea", optional: true, help: "Anything else, e.g. outcomes. Line breaks are kept." },
      { key: "image", label: "Cover image", kind: "image", urlKey: "image_url", optional: true, help: "Shown on the event's card and at the top of its page. Add more photos under Photos after saving." },
      { key: "registration_url", label: "Registration link", kind: "text", optional: true, help: "An https:// form or ticket page. Shown as a Register button until the event is over." },
    ],
    title: (v) => v.title,
    subtitle: (v) => [v.kind === "campaign" ? "Campaign" : "Event", v.date_note || v.start_date, v.location].filter(Boolean).join(" · "),
  },
};

// ---------------------------------------------------------------------------
// Mapping
// ---------------------------------------------------------------------------

/** Unicode combining diacritical marks (U+0300 to U+036F), built from char codes so no escape sequence is needed. */
const COMBINING_MARKS = new RegExp(`[${String.fromCharCode(0x300)}-${String.fromCharCode(0x36f)}]`, "g");

/** "Annual Report 2025–26!" -> "annual-report-2025-26". Leaves room under the API's 50-character slug limit. */
export function slugify(text: string, maxLength = 40): string {
  const slug = text
    .normalize("NFKD")
    .replace(COMBINING_MARKS, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, maxLength)
    .replace(/-+$/g, "");
  return slug || "item";
}

const asString = (value: unknown): string => {
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) return value.join(", ");
  return String(value);
};

/**
 * API record -> form values, keyed by the resource's field keys. File fields stay empty; an image field holds the
 * uploaded file's URL under its own key and the link under its `urlKey`.
 */
export function toValues(resource: Resource, record: ApiRecord): Record<string, string> {
  return Object.fromEntries(
    resource.fields.flatMap((f): [string, string][] => {
      if (f.kind === "file") return [[f.key, ""]];
      if (f.kind === "image") return [[f.key, asString(record[f.key])], ...(f.urlKey ? [[f.urlKey, asString(record[f.urlKey])] as [string, string]] : [])];
      if (f.kind === "lines") return [[f.key, Array.isArray(record[f.key]) ? (record[f.key] as unknown[]).map(String).join("\n") : ""]];
      // The API sends "09:30:00"; the time input takes "09:30".
      if (f.kind === "time") return [[f.key, asString(record[f.key]).slice(0, 5)]];
      return [[f.key, f.key === "authors" ? asString((record.authors as unknown[] | undefined)?.[0]) : asString(record[f.key])]];
    }),
  );
}

export function toCmsRecord(type: ContentTypeKey, record: ApiRecord): CmsRecord {
  const resource = RESOURCES[type];
  const values = toValues(resource, record);
  const image = resource.fields.find((f) => f.kind === "image");
  const imageUrl = image ? values[image.key] || (image.urlKey ? values[image.urlKey] : "") : "";
  return {
    key: String(resource.lookup === "slug" ? record.slug : record.id),
    type,
    status: record.status,
    createdBy: record.created_by,
    updatedAt: record.updated_at,
    title: resource.title(values) || String(record.slug ?? record.id),
    subtitle: resource.subtitle(values, record),
    values,
    fileUrl: typeof record.file === "string" ? record.file : undefined,
    imageUrl: imageUrl || undefined,
  };
}

export type PayloadResult = { ok: true; payload: Record<string, unknown> } | { ok: false; message: string };

/**
 * Form values -> API payload. Empty optional fields are cleared rather than omitted on update (so a user can blank a
 * bio), numbers and lists are converted, and a slug is generated on create when the form has none.
 */
export function toPayload(type: ContentTypeKey, values: Record<string, string>, mode: "create" | "update", uniqueSuffix = ""): PayloadResult {
  const resource = RESOURCES[type];
  const payload: Record<string, unknown> = {};

  for (const field of resource.fields) {
    if (field.kind === "file") continue;
    if (field.kind === "image") {
      // The file itself travels as multipart; here only the link and a removal request.
      if (field.urlKey) payload[field.urlKey] = (values[field.urlKey] ?? "").trim();
      if (values[field.key] === REMOVE_IMAGE) payload[field.key] = null;
      continue;
    }
    if (mode === "update" && field.createOnly) continue;

    const raw = (values[field.key] ?? "").trim();
    if (!raw && !field.optional) return { ok: false, message: `${field.label} is required.` };

    if (field.key === "authors") payload.authors = raw ? [Number(raw)] : [];
    else if (field.kind === "multiselect") payload[field.key] = raw ? raw.split(",").map((t) => t.trim()).filter(Boolean) : [];
    // Links to other objects by slug: an empty choice clears the link.
    else if (field.optionsFrom === "publications" || field.optionsFrom === "datasets") payload[field.key] = raw || null;
    else if (field.key === "tags") payload.tags = raw ? raw.split(",").map((t) => t.trim()).filter(Boolean) : [];
    else if (field.kind === "number") {
      if (raw && !/^-?\d+$/.test(raw)) return { ok: false, message: `${field.label} must be a whole number.` };
      payload[field.key] = raw ? Number(raw) : (field.emptyValue ?? null);
    } else if (field.kind === "date" || field.kind === "time") {
      // The API takes null, not "", for "no date" or "no time".
      if (field.kind === "time" && raw && !/^([01]\d|2[0-3]):[0-5]\d$/.test(raw)) return { ok: false, message: `${field.label} must be a time like 09:30.` };
      payload[field.key] = raw || null;
    } else if (field.kind === "lines") {
      payload[field.key] = raw ? raw.split(/\r?\n/).map((line) => line.trim()).filter(Boolean) : [];
    } else if (field.key === "sub_theme") payload.sub_theme = Number(raw);
    else payload[field.key] = raw;
  }

  if (mode === "create") {
    if (resource.slugFrom) payload.slug = `${slugify(resource.slugFrom(values))}${uniqueSuffix}`;
    Object.assign(payload, resource.fixed);
  }
  return { ok: true, payload };
}

/** Which API records the actions should show for this content type. */
export function belongsToType(type: ContentTypeKey, record: ApiRecord): boolean {
  return RESOURCES[type].belongs?.(record) ?? true;
}

/** Address of one object, e.g. `/api/v1/people/12/`. The key is validated by the caller. */
export function objectPath(type: ContentTypeKey, key: string): string {
  return `${RESOURCES[type].path}${key}/`;
}

export const KEY_PATTERN = /^[-a-zA-Z0-9_]{1,50}$/;
