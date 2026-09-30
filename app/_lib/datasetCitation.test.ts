import { describe, expect, it } from "vitest";
import { citationFor } from "./datasetCitation";

describe("citationFor", () => {
  const url = "https://priresearch.in/data/plus-one-batch-size";

  it("uses PRI's own citation text when it is set", () => {
    expect(citationFor({ title: "Plus One batch size", citation: "  PRI (2026). Custom.  ", updatedAt: "2026-09-10T00:00:00Z" }, url)).toBe("PRI (2026). Custom.");
  });

  it("builds a standard reference from the title, the update year and the address otherwise", () => {
    expect(citationFor({ title: "Plus One batch size", updatedAt: "2026-09-10T00:00:00Z" }, url)).toBe(
      "Policy and Research Initiative (2026). Plus One batch size [Dataset]. PRI Data Repository. https://priresearch.in/data/plus-one-batch-size",
    );
    expect(citationFor({ title: "T", citation: "   " }, url)).toContain("(n.d.)");
  });
});
