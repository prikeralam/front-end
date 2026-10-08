/**
 * `real`: copy lifted from PRI's previous site, verified.
 * `placeholder`: invented so the layout reads; needs real input from PRI.
 */
export type ContentStatus = "real" | "placeholder";

/** A photo/logo/chart/map/video the design calls for but PRI has not supplied. */
export type MediaNeed = {
  label: string;
  /** Shape hint shown in the slot, e.g. "16:9", "square", "3:2". */
  ratio: string;
  kind: "photo" | "logo" | "chart" | "map" | "video" | "diagram" | "document";
  /** Real asset path (e.g. "/people/team/rashiq.jpg") once PRI has supplied one; takes priority over any stock/placeholder rendering. */
  src?: string;
};

export type ProjectStage = "ongoing" | "completed";

/** A homepage hero slide: a project from the API, or the static motto slide. */
export type HeroProject = {
  slug: string;
  title: string;
  blurb: string;
  status: ContentStatus;
  /** Where the project stands; the motto slide has none. */
  stage?: ProjectStage;
  image: MediaNeed;
  /** Overrides the default "Explore project →" / `/projects/{slug}` link, used by the motto slide. */
  ctaLabel?: string;
  ctaHref?: string;
};

export type Person = {
  slug: string;
  name: string;
  role: string;
  group: "team" | "patron" | "advisory" | "executive" | "fellow" | "past-fellow" | "author";
  bio?: string;
  /** Public contact links, shown as icons on the people pages. */
  linkedin?: string;
  email?: string;
  /** Fellows only: their research topic. */
  topic?: string;
  /** Fellows only: research objectives, shown as a bulleted list. */
  objectives?: string[];
  status: ContentStatus;
  photo: MediaNeed | null;
};

export type Publication = {
  slug: string;
  title: string;
  abstract: string;
  format: "Report" | "Working Paper" | "Brief" | "Explainer" | "Infographic" | "Video" | "Data Story";
  theme: string;
  date: string;
  /** `Person.slug` references, not raw display names. */
  authors: string[];
  language: "English" | "Malayalam";
  views: number;
  status: ContentStatus;
  cover: MediaNeed | null;
};

export type Dataset = {
  slug: string;
  title: string;
  description: string;
  theme: string;
  geography: string;
  year: string;
  type: "Survey" | "Administrative" | "Panel" | "Geospatial" | "Index";
  visibility: "public" | "on-request" | "internal";
  source: string;
  coverage: string;
  frequency: string;
  /** When this dataset's data was last refreshed. */
  lastUpdated: string;
  status: ContentStatus;
  preview: MediaNeed | null;
  /** Real downloadable files (path under /public), when supplied. Gated the same as everything else: only shown to sessions with "full" access. */
  files?: { label: string; path: string }[];
  tags?: string[];
  /** Actual file format, when a real file exists. Distinct from `type`, which is a methodology classification. */
  fileFormat?: "CSV" | "Parquet" | "ZIP";
};

export type PRIEvent = {
  slug: string;
  kind: "event" | "campaign";
  title: string;
  summary: string;
  body: string;
  /** ISO dates from the API; `dateLabel` is for display. */
  startDate: string;
  endDate: string | null;
  dateLabel: string;
  location: string;
  image: MediaNeed | null;
  registrationUrl?: string;
  timing: "upcoming" | "past";
};

export type Partner = {
  slug: string;
  name: string;
  description: string;
  type: "institution" | "researcher";
  status: ContentStatus;
  logo: MediaNeed | null;
  /** The partner's own site (https), when staff have added it. */
  website?: string;
};

export type JobListing = {
  slug: string;
  title: string;
  summary: string;
  description: string;
  location: string;
  employment: string;
  /** Rolling roles take applications at any time. */
  rolling: boolean;
  /** Formatted deadline, only for roles that are not rolling. */
  deadline: string | null;
};

export type PRIDocument = {
  title: string;
  kind: string;
  year?: string;
  status: ContentStatus;
  /** URL of the file, once one exists (from the backend for documents). */
  href?: string;
};
