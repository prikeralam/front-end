import { describe, expect, it } from "vitest";
import { optionMatches } from "./optionSearch";

describe("optionMatches", () => {
  const option = { value: "school-results-kerala", label: "PRI-EDU-0012 · School-wise SSLC examination results" };

  it("matches the label (catalog ID or title) or the slug, ignoring case", () => {
    for (const q of ["pri-edu-0012", "sslc", "  School-wise ", "results-kerala"]) expect(optionMatches(option, q), q).toBe(true);
  });

  it("matches everything for an empty search and nothing unrelated", () => {
    expect(optionMatches(option, " ")).toBe(true);
    expect(optionMatches(option, "health")).toBe(false);
  });
});
