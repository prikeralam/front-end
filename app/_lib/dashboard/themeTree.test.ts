import { describe, expect, it } from "vitest";
import { buildThemeTree, slugify } from "./themeTree";

describe("buildThemeTree", () => {
  it("nests sub-themes under their theme, both in name order", () => {
    const tree = buildThemeTree([
      { id: 5, slug: "health", name: "Health", parent: null },
      { id: 1, slug: "education", name: "Education", parent: null, description: "Schools and colleges" },
      { id: 13, slug: "school-education", name: "School Education", parent: 1 },
      { id: 9, slug: "higher-secondary", name: "Higher Secondary", parent: 1, description: "Plus One, Plus Two" },
      { id: 11, slug: "primary-care", name: "Primary Care", parent: 5 },
    ]);
    expect(tree.map((t) => t.name)).toEqual(["Education", "Health"]);
    expect(tree[0].description).toBe("Schools and colleges");
    expect(tree[0].subthemes).toEqual([
      { id: 9, slug: "higher-secondary", name: "Higher Secondary", description: "Plus One, Plus Two" },
      { id: 13, slug: "school-education", name: "School Education", description: "" },
    ]);
    expect(tree[1].subthemes.map((s) => s.slug)).toEqual(["primary-care"]);
  });

  it("keeps a theme without sub-themes", () => {
    expect(buildThemeTree([{ id: 3, slug: "economics", name: "Economics" }])).toEqual([
      { id: 3, slug: "economics", name: "Economics", description: "", subthemes: [] },
    ]);
  });
});

describe("slugify", () => {
  it.each([
    ["Higher Secondary", "higher-secondary"],
    ["  Police & Justice  ", "police-justice"],
    ["Public-Finance 2026", "public-finance-2026"],
    ["Café Économie", "cafe-economie"],
    ["---", ""],
  ])("%s -> %s", (name, slug) => {
    expect(slugify(name)).toBe(slug);
  });

  it("stays within 50 characters without a trailing dash", () => {
    const slug = slugify(`${"a".repeat(49)} b`);
    expect(slug.length).toBeLessThanOrEqual(50);
    expect(slug.endsWith("-")).toBe(false);
  });
});
