import { describe, expect, it } from "vitest";
import type { DatasetSummary } from "../../_lib/datasetTypes";
import { matchesQuery } from "./datasetSearch";

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
