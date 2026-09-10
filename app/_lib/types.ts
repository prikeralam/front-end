/**
 * `real` — copy lifted from PRI's previous site, verified.
 * `placeholder` — invented so the layout reads; needs real input from PRI.
 */
export type ContentStatus = "real" | "placeholder";

/** A photo/logo/chart/map/video the design calls for but PRI has not supplied. */
export type MediaNeed = {
  label: string;
  /** Shape hint shown in the slot, e.g. "16:9", "square", "3:2". */
  ratio: string;
  kind: "photo" | "logo" | "chart" | "map" | "video" | "diagram" | "document";
  /** Real asset path (e.g. "/people/team/rashiq.jpg") once PRI has supplied one — takes priority over any stock/placeholder rendering. */
  src?: string;
};

export type Person = {
  slug: string;
  name: string;
  role: string;
  group: "team" | "patron" | "executive" | "fellow" | "past-fellow" | "author";
  bio?: string;
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
  format: "Report" | "Working Paper" | "Data Story";
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
  status: ContentStatus;
  preview: MediaNeed | null;
};

export type Dashboard = {
  slug: string;
  title: string;
  description: string;
  theme: string;
  status: ContentStatus;
  embed: MediaNeed | null;
};

export type PRIEvent = {
  slug: string;
  title: string;
  description: string;
  type: "Webinar" | "Launch" | "Workshop" | "Advocacy Day" | "Roundtable";
  date: string;
  time: string;
  venue: string;
  timing: "upcoming" | "past";
  status: ContentStatus;
  image: MediaNeed | null;
};

export type Partner = {
  slug: string;
  name: string;
  description: string;
  type: "institution" | "researcher";
  status: ContentStatus;
  logo: MediaNeed | null;
};

export type JobListing = {
  slug: string;
  title: string;
  location: string;
  employment: string;
  closes: string;
  description: string;
  responsibilities: string[];
  status: ContentStatus;
};

export type PRIDocument = {
  title: string;
  kind: string;
  year?: string;
  status: ContentStatus;
  /** Path to the actual file once PRI has supplied one, e.g. "/PDFs/Annual Report 25-26.pdf". */
  href?: string;
};

export type NamedProgram = {
  slug: string;
  name: string;
  description: string;
  funder: string;
  status: ContentStatus;
  image: MediaNeed | null;
};
