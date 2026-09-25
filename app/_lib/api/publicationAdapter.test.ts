import { describe, expect, it } from "vitest";
import type { components } from "./schema";
import { formatPublicationDate, themeBySubTheme, toPublication } from "./publicationAdapter";

type ApiPublication = components["schemas"]["Publication"];

const apiPublication: ApiPublication = {
  id: 7,
  slug: "kerala-gulf-migration",
  title: "Kerala's migration economy runs through the Gulf",
  abstract: "Muslims comprise 41.9% of Kerala's emigrants.",
  format: "data_story",
  sub_theme: 12,
  language: "ml",
  date: "2026-03-01",
  authors: [38, 99],
  external_id: "",
  visibility: "public",
  tags: ["Migration"],
  views: 12,
  cover_url: "",
  status: "published",
  created_by: 10,
  reviewed_by: null,
  created_at: "2026-09-25T06:52:45Z",
  updated_at: "2026-09-25T06:52:45Z",
  published_at: "2026-09-25T06:52:46Z",
};

const lookups = {
  themeBySubTheme: new Map([[12, "Migration"]]),
  authorSlugById: new Map([[38, "pri-research-team"]]),
};

describe("toPublication", () => {
  it("maps the API shape onto Publication, resolving theme and author slugs", () => {
    expect(toPublication(apiPublication, lookups)).toMatchObject({
      slug: "kerala-gulf-migration",
      format: "Data Story",
      theme: "Migration",
      date: "2026-03-01",
      authors: ["pri-research-team"],
      language: "Malayalam",
      views: 12,
      status: "real",
    });
  });

  it("drops author ids it cannot resolve and labels an unknown sub-theme Other", () => {
    const mapped = toPublication({ ...apiPublication, sub_theme: 404 }, lookups);

    expect(mapped.authors).toEqual(["pri-research-team"]);
    expect(mapped.theme).toBe("Other");
  });

  it("uses the API cover when present, otherwise the hand-picked stock cover for known stories", () => {
    expect(toPublication({ ...apiPublication, cover_url: "https://cdn.example.org/c.jpg" }, lookups).cover?.src).toBe("https://cdn.example.org/c.jpg");
    expect(toPublication(apiPublication, lookups).cover?.src).toContain("unsplash");
    expect(toPublication({ ...apiPublication, slug: "unknown-story" }, lookups).cover?.src).toBeUndefined();
  });

  it("maps every backend format to a display label", () => {
    const formats = ["report", "working_paper", "brief", "explainer", "infographic", "video", "data_story"] as const;

    expect(formats.map((format) => toPublication({ ...apiPublication, format }, lookups).format)).toEqual([
      "Report",
      "Working Paper",
      "Brief",
      "Explainer",
      "Infographic",
      "Video",
      "Data Story",
    ]);
  });
});

describe("themeBySubTheme", () => {
  it("indexes each sub-theme id to its top-level theme's name", () => {
    const themes: components["schemas"]["Theme"][] = [
      { id: 7, slug: "demography", name: "Demography", parent: null, subthemes: [{ id: 10, slug: "religious-composition", name: "Religious Composition" }] },
      { id: 10, slug: "religious-composition", name: "Religious Composition", parent: 7, subthemes: [] },
      { id: 3, slug: "economics", name: "Economics", parent: null, subthemes: [] },
    ];

    expect(themeBySubTheme(themes)).toEqual(new Map([[10, "Demography"]]));
  });
});

describe("formatPublicationDate", () => {
  it("formats an ISO date", () => {
    expect(formatPublicationDate("2026-03-01")).toBe("1 Mar 2026");
  });

  it("returns anything else as sent", () => {
    expect(formatPublicationDate("To be confirmed")).toBe("To be confirmed");
  });
});
