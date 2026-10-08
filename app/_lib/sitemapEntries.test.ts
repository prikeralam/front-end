import { describe, expect, it } from "vitest";
import { STATIC_PATHS, sitemapEntries } from "./sitemapEntries";

const empty = { publications: [], datasets: [], themes: [], collections: [], projects: [], people: [], events: [], jobs: [] };

describe("sitemapEntries", () => {
  it("lists the static pages on the production domain, homepage first", () => {
    const entries = sitemapEntries(empty);
    expect(entries).toHaveLength(STATIC_PATHS.length);
    expect(entries[0]).toMatchObject({ url: "https://priresearch.in/", priority: 1 });
    expect(entries.map((e) => e.url)).not.toContain("https://priresearch.in/dashboard");
  });

  it("adds every published record, with dates where they make sense", () => {
    const entries = sitemapEntries({
      ...empty,
      publications: [{ slug: "plus-one-seats", date: "2026-03-01" }],
      datasets: [{ slug: "plus-one", updatedAt: "2026-09-01T10:00:00Z" }],
      themes: ["Public Finance"],
      people: ["asha", "asha"],
      jobs: ["data-analyst"],
    });
    const byUrl = Object.fromEntries(entries.map((e) => [e.url, e]));
    expect(byUrl["https://priresearch.in/research/plus-one-seats"]).toMatchObject({ lastModified: "2026-03-01" });
    expect(byUrl["https://priresearch.in/data/plus-one"]).toMatchObject({ lastModified: "2026-09-01" });
    expect(byUrl["https://priresearch.in/data/theme/Public%20Finance"]).toBeDefined();
    expect(byUrl["https://priresearch.in/careers/jobs/data-analyst"]).not.toHaveProperty("lastModified");
    expect(entries.filter((e) => e.url.endsWith("/people/asha"))).toHaveLength(1);
  });
});
