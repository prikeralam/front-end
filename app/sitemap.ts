import type { MetadataRoute } from "next";
import { connection } from "next/server";
import { listDatasets, listTopThemes } from "./_lib/api/datasets";
import { listEvents, listJobs } from "./_lib/api/engage";
import { listCollections } from "./_lib/api/impact";
import { listPeopleByGroup } from "./_lib/api/people";
import { listProjects } from "./_lib/api/projects";
import { listPublications } from "./_lib/api/publications";
import { sitemapEntries } from "./_lib/sitemapEntries";

/** Each source on its own: one failing list leaves its pages out rather than failing the whole sitemap. */
async function settle<T>(work: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await work();
  } catch {
    return fallback;
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Built per request (API responses are still cached), so it follows what is published rather than build time.
  await connection();
  const [publications, datasets, themes, collections, projects, people, events, jobs] = await Promise.all([
    settle(async () => (await listPublications()).publications, []),
    settle(() => listDatasets(), []),
    settle(listTopThemes, []),
    settle(listCollections, []),
    settle(listProjects, []),
    settle(async () => (await Promise.all((["team", "patron", "executive", "advisory"] as const).map((g) => listPeopleByGroup(g)))).flat(), []),
    settle(listEvents, []),
    settle(listJobs, []),
  ]);

  return sitemapEntries({
    publications: publications.map((p) => ({ slug: p.slug, date: p.date })),
    datasets: datasets.map((d) => ({ slug: d.slug, updatedAt: d.updatedAt })),
    themes: themes.map((t) => t.name),
    collections: collections.map((c) => c.slug),
    projects: projects.map((p) => p.slug),
    people: people.map((p) => p.slug),
    events: events.map((e) => ({ slug: e.slug, startDate: e.startDate })),
    jobs: jobs.map((j) => j.slug),
  });
}
