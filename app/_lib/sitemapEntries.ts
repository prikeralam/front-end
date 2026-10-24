import type { MetadataRoute } from "next";
import { absoluteUrl } from "./seo";

type Frequency = "daily" | "weekly" | "monthly";
type Entry = MetadataRoute.Sitemap[number];

/** Public pages that exist whatever is published, most important first. */
export const STATIC_PATHS: { path: string; priority: number; changeFrequency: Frequency }[] = [
  { path: "/", priority: 1, changeFrequency: "weekly" },
  { path: "/research", priority: 0.9, changeFrequency: "weekly" },
  { path: "/data", priority: 0.9, changeFrequency: "weekly" },
  { path: "/about", priority: 0.8, changeFrequency: "monthly" },
  { path: "/projects", priority: 0.7, changeFrequency: "monthly" },
  { path: "/people", priority: 0.6, changeFrequency: "monthly" },
  { path: "/people/team", priority: 0.6, changeFrequency: "monthly" },
  { path: "/people/advisory", priority: 0.5, changeFrequency: "monthly" },
  { path: "/partners", priority: 0.5, changeFrequency: "monthly" },
  { path: "/events", priority: 0.6, changeFrequency: "weekly" },
  { path: "/careers", priority: 0.6, changeFrequency: "weekly" },
  { path: "/careers/apply", priority: 0.5, changeFrequency: "monthly" },
  { path: "/data/collections", priority: 0.5, changeFrequency: "weekly" },
  { path: "/about/annual-reports", priority: 0.5, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.5, changeFrequency: "monthly" },
  { path: "/donate", priority: 0.4, changeFrequency: "monthly" },
  { path: "/privacy", priority: 0.2, changeFrequency: "monthly" },
  { path: "/terms", priority: 0.2, changeFrequency: "monthly" },
];

export type SitemapSources = {
  publications: { slug: string; date?: string }[];
  datasets: { slug: string; updatedAt?: string }[];
  themes: string[];
  collections: string[];
  projects: string[];
  people: string[];
  events: { slug: string; startDate: string }[];
  jobs: string[];
};

function entry(path: string, priority: number, changeFrequency: Frequency, modified?: string): Entry {
  const lastModified = modified && /^\d{4}-\d{2}-\d{2}/.test(modified) ? modified.slice(0, 10) : undefined;
  return { url: absoluteUrl(path), priority, changeFrequency, ...(lastModified ? { lastModified } : {}) };
}

/** Every public address to tell search engines about. Duplicates (e.g. a person in two lists) appear once. */
export function sitemapEntries(sources: SitemapSources): MetadataRoute.Sitemap {
  const entries = [
    ...STATIC_PATHS.map(({ path, priority, changeFrequency }) => entry(path, priority, changeFrequency)),
    ...sources.publications.map((p) => entry(`/research/${p.slug}`, 0.8, "monthly", p.date)),
    ...sources.datasets.map((d) => entry(`/data/${d.slug}`, 0.8, "monthly", d.updatedAt)),
    ...sources.themes.map((t) => entry(`/data/theme/${encodeURIComponent(t)}`, 0.6, "weekly")),
    ...sources.collections.map((c) => entry(`/data/collections/${c}`, 0.6, "monthly")),
    ...sources.projects.map((p) => entry(`/projects/${p}`, 0.6, "monthly")),
    ...sources.people.map((p) => entry(`/people/${p}`, 0.4, "monthly")),
    ...sources.events.map((e) => entry(`/events/${e.slug}`, 0.5, "monthly", e.startDate)),
    ...sources.jobs.map((j) => entry(`/careers/jobs/${j}`, 0.6, "weekly")),
  ];
  const seen = new Set<string>();
  return entries.filter((e) => !seen.has(e.url) && seen.add(e.url));
}
