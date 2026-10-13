import { describe, expect, it } from "vitest";
import type { components } from "./schema";
import {
  accessStateOf,
  isFeatureCollection,
  isTablePreview,
  toDatasetDetail,
  toDatasetSummary,
  toResourcePreview,
  topLevelNameBySubTheme,
  PREVIEW_ROWS,
} from "./datasetAdapter";

type ApiDataset = components["schemas"]["Dataset"];

const dataset: ApiDataset = {
  id: 2,
  slug: "religious-composition",
  title: "Religious composition of Kerala's population",
  description: "Figures as quoted in PRI's data stories.",
  file: "http://localhost:8000/media/datasets/religious-composition.parquet",
  format: "parquet",
  formats: ["parquet"],
  files: [{ id: null, format: "parquet", label: "Parquet", url: "http://localhost:8000/media/datasets/religious-composition.parquet", size: 2048 }],
  file_size: 2048,
  sub_theme: 10,
  geography: "Kerala",
  year: 2024,
  source: "PRI Research Team",
  update_frequency: "",
  visibility: "public",
  granularity: "Religion, Year",
  time_period: "2011 to 2024",
  citation: "",
  row_count: 3,
  column_count: 3,
  columns: ["group", "share_2011", "share_2024"],
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
    // A public dataset's files wait for a signed-in, confirmed account.
    expect(accessStateOf({ ...withheld, visibility: "public" })).toBe("signin");
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
      formats: ["Parquet"],
    });
    expect(toDatasetSummary({ ...dataset, visibility: "on_request", format: "geojson" }, topLevel)).toMatchObject({ visibility: "on-request", fileFormat: "GeoJSON" });
    expect(toDatasetSummary({ ...dataset, visibility: "internal_only" }, topLevel).visibility).toBe("internal");
  });

  it("leaves theme null for an unknown sub-theme and year unset when the API has none", () => {
    const summary = toDatasetSummary({ ...dataset, sub_theme: 404, year: null }, topLevel);

    expect(summary.theme).toBeNull();
    expect(summary.year).toBeUndefined();
  });

  it("exposes every downloadable file, main first, and none when they are withheld", () => {
    expect(toDatasetDetail(dataset, topLevel).files).toEqual([{ label: "Parquet", format: "parquet", path: dataset.file, size: 2048 }]);
    const several = {
      ...dataset,
      formats: ["parquet", "csv", "json"],
      files: [
        ...dataset.files,
        { id: 4, format: "csv", label: "CSV", url: "https://bucket/datasets/r.csv", size: null },
        { id: 5, format: "json", label: "JSON", url: "https://bucket/datasets/r.json", size: 900 },
        { id: 6, format: "xml" },
      ],
    };
    expect(toDatasetDetail(several, topLevel).files.map((f) => [f.label, f.size])).toEqual([["Parquet", 2048], ["CSV", undefined], ["JSON", 900]]);
    expect(toDatasetSummary(several, topLevel).formats).toEqual(["Parquet", "CSV", "JSON"]);
    // Locked: no files, but the formats are still known.
    const locked = { ...several, visibility: "on_request" as const, file: undefined, files: undefined } as unknown as ApiDataset;
    expect(toDatasetDetail(locked, topLevel)).toMatchObject({ accessState: "requestable", files: [], formats: ["Parquet", "CSV", "JSON"] });
    expect(toDatasetDetail(dataset, topLevel)).toMatchObject({
      granularity: "Religion, Year",
      timePeriod: "2011 to 2024",
      rowCount: 3,
      columnCount: 3,
      columns: ["group", "share_2011", "share_2024"],
      citation: undefined,
    });
    // Stats the backend couldn't work out stay absent, rather than showing as 0.
    expect(toDatasetDetail({ ...dataset, row_count: null, column_count: null, columns: [] }, topLevel)).toMatchObject({ rowCount: undefined, columnCount: undefined, columns: [] });
    expect(toDatasetDetail({ ...dataset, file: undefined, files: undefined } as unknown as ApiDataset, topLevel).files).toEqual([]);
    // An older backend sends only `file`.
    expect(toDatasetDetail({ ...dataset, files: undefined } as unknown as ApiDataset, topLevel).files).toEqual([{ label: "Parquet", format: "parquet", path: dataset.file }]);
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

describe("toResourcePreview", () => {
  it("shows only the first few rows of the API's page", () => {
    const rows = Array.from({ length: 50 }, (_, i) => [i, null]);
    const preview = toResourcePreview("x", "CSV", { page: 1, page_size: 50, header: ["n", "empty"], rows });
    expect(PREVIEW_ROWS).toBe(5);
    expect(preview.rows).toEqual([["0", ""], ["1", ""], ["2", ""], ["3", ""], ["4", ""]]);
  });
});
