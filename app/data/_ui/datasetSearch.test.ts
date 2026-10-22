import { describe, expect, it } from "vitest";
import type { DatasetSummary } from "../../_lib/datasetTypes";
import { filterDatasets, matchesQuery } from "./datasetSearch";

const dataset: DatasetSummary = {
  slug: "plus-one-batch-size",
  title: "Plus One batch size by district",
  description: "Average students per Plus One batch.",
  visibility: "public",
  accessState: "full",
  theme: "Education",
  geography: "Malappuram",
  source: "General Education Department",
  granularity: "District",
  timePeriod: "2023-24",
  fileFormat: "CSV",
  formats: ["CSV"],
};

describe("matchesQuery", () => {
  it("matches any searchable field, ignoring case and surrounding spaces", () => {
    for (const q of ["plus one", "EDUCATION", "  malappuram ", "general education", "district", "2023"]) {
      expect(matchesQuery(dataset, q), q).toBe(true);
    }
  });

  it("matches everything for an empty query and nothing unrelated", () => {
    expect(matchesQuery(dataset, "   ")).toBe(true);
    expect(matchesQuery(dataset, "migration")).toBe(false);
  });
});

describe("catalog ID and theme filter", () => {
  const sslc: DatasetSummary = { ...dataset, slug: "sslc", code: "PRI-EDU-0009", title: "SSLC results" };
  const beds: DatasetSummary = { ...dataset, slug: "beds", code: "PRI-HLT-0001", title: "Hospital beds", theme: "Health", geography: "Kerala" };

  it("finds a dataset by its catalog ID", () => {
    expect(matchesQuery(sslc, "pri-edu-0009")).toBe(true);
    expect(matchesQuery(sslc, "PRI-HLT")).toBe(false);
  });

  it("narrows by theme, alone or together with a search", () => {
    expect(filterDatasets([sslc, beds], "", "Health").map((d) => d.slug)).toEqual(["beds"]);
    expect(filterDatasets([sslc, beds], "sslc", "Education").map((d) => d.slug)).toEqual(["sslc"]);
    expect(filterDatasets([sslc, beds], "sslc", "Health")).toEqual([]);
    expect(filterDatasets([sslc, beds], "", "")).toHaveLength(2);
  });
});
