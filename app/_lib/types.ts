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
  authors: string[];
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

export type AdvocacyItem = {
  slug: string;
  title: string;
  summary: string;
  type: "Memo" | "Policy Brief" | "White Paper" | "Letter" | "Scorecard" | "Event Snapshot";
  date: string;
  recipient?: string;
  status: ContentStatus;
  media: MediaNeed | null;
};

export type MediaCase = {
  slug: string;
  headline: string;
  summary: string;
  classification: "Misinformation" | "Hate Speech" | "Biased Coverage";
  source: string;
  date: string;
  response: string;
  status: ContentStatus;
  screenshot: MediaNeed | null;
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
};

export type NamedProgram = {
  slug: string;
  name: string;
  description: string;
  funder: string;
  status: ContentStatus;
  image: MediaNeed | null;
};
