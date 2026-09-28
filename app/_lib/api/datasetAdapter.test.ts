import { describe, expect, it } from "vitest";
import type { components } from "./schema";
import {
  accessStateOf,
  isFeatureCollection,
  isTablePreview,
  themeNameById,
  toDashboard,
  toDatasetDetail,
  toDatasetSummary,
  toResourcePreview,
  topLevelNameBySubTheme,
} from "./datasetAdapter";

type ApiDataset = components["schemas"]["Dataset"];

const dataset: ApiDataset = {
  id: 2,
  slug: "religious-composition",
  title: "Religious composition of Kerala's population",
  description: "Figures as quoted in PRI's data stories.",
  file: "http://localhost:8000/media/datasets/religious-composition.parquet",
  format: "parquet",
  sub_theme: 10,
  geography: "Kerala",
  year: 2024,
  source: "PRI Research Team",
  update_frequency: "",
  visibility: "public",
  status: "published",
  created_by: 10,
  reviewed_by: null,
  created_at: "2026-09-25T06:52:45Z",
  updated_at: "2026-09-25T06:52:48Z",
  published_at: "2026-09-25T06:52:46Z",
};

const themes: components["schemas"]["Theme"][] = [
  { id: 7, slug: "demography", name: "Demography", parent: null, subthemes: [{ id: 10, slug: "religious-composition", name: "Religious Composition" }] },
  { id: 10, slug: "religious-composition", name: "Religious Composition", parent: 7, subthemes: [] },
];

describe("accessStateOf", () => {
  it("is full when the API sent a file URL", () => {
    expect(accessStateOf(dataset)).toBe("full");
  });

  it("is requestable for an on_request dataset whose file the API withheld, otherwise locked", () => {
    const withheld = { ...dataset, file: undefined } as unknown as ApiDataset;

    expect(accessStateOf({ ...withheld, visibility: "on_request" })).toBe("requestable");
    expect(accessStateOf({ ...withheld, visibility: "internal_only" })).toBe("locked");
  });
});

describe("toDatasetSummary / toDatasetDetail", () => {
  const topLevel = topLevelNameBySubTheme(themes);

  it("maps the API shape, resolving the top-level theme and normalising enums", () => {
    expect(toDatasetSummary(dataset, topLevel)).toMatchObject({
      slug: "religious-composition",
      visibility: "public",
      accessState: "full",
      theme: "Demography",
      geography: "Kerala",
      year: "2024",
      source: "PRI Research Team",
      frequency: undefined,
      lastUpdated: "25 Sep 2026",
      fileFormat: "Parquet",
    });
    expect(toDatasetSummary({ ...dataset, visibility: "on_request", format: "geojson" }, topLevel)).toMatchObject({ visibility: "on-request", fileFormat: "GeoJSON" });
    expect(toDatasetSummary({ ...dataset, visibility: "internal_only" }, topLevel).visibility).toBe("internal");
  });

  it("leaves theme null for an unknown sub-theme and year unset when the API has none", () => {
    const summary = toDatasetSummary({ ...dataset, sub_theme: 404, year: null }, topLevel);

    expect(summary.theme).toBeNull();
    expect(summary.year).toBeUndefined();
  });

  it("exposes the single file as a download, and none when it is withheld", () => {
    expect(toDatasetDetail(dataset, topLevel).files).toEqual([{ label: dataset.title, path: dataset.file }]);
    expect(toDatasetDetail({ ...dataset, file: undefined } as unknown as ApiDataset, topLevel).files).toEqual([]);
  });
});

describe("table preview", () => {
  const body = { page: 1, page_size: 50, header: ["group", "share"], rows: [["Hindus", 54.7], ["Others", null]] };

  it("recognises the real body shape and rejects anything else", () => {
    expect(isTablePreview(body)).toBe(true);
    expect(isTablePreview({ header: ["a"] })).toBe(false);
    expect(isTablePreview(null)).toBe(false);
  });

  it("stringifies cells and blanks nulls", () => {
    expect(toResourcePreview("Religious composition", "Parquet", body)).toEqual({
      label: "Religious composition",
      format: "Parquet",
      columns: ["group", "share"],
      rows: [["Hindus", "54.7"], ["Others", ""]],
    });
  });
});

describe("isFeatureCollection", () => {
  it("accepts a FeatureCollection only", () => {
    expect(isFeatureCollection({ type: "FeatureCollection", features: [] })).toBe(true);
    expect(isFeatureCollection({ type: "Feature" })).toBe(false);
    expect(isFeatureCollection(undefined)).toBe(false);
  });
});

describe("toDashboard", () => {
  it("resolves the direct theme id to a name", () => {
    const dashboard: components["schemas"]["Dashboard"] = {
      id: 1,
      slug: "education-access-dashboard",
      title: "Education access dashboard",
      description: "Enrolment by district",
      embed_url: "https://example.org/embed/1",
      embed_type: "datawrapper",
      theme: 7,
      status: "published",
      created_by: 1,
      reviewed_by: null,
      created_at: "2026-09-25T06:52:46Z",
      updated_at: "2026-09-25T06:52:46Z",
      published_at: null,
    };

    expect(toDashboard(dashboard, themeNameById(themes))).toEqual({
      slug: "education-access-dashboard",
      title: "Education access dashboard",
      description: "Enrolment by district",
      theme: "Demography",
      embedUrl: "https://example.org/embed/1",
      embedType: "datawrapper",
    });
  });
});
