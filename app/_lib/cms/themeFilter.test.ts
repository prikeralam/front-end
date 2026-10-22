import { describe, expect, it } from "vitest";
import type { CmsRecord } from "./types";
import { themeOf, themesOf } from "./themeFilter";

const subThemes = [
  { value: "3", label: "Education › School Education" },
  { value: "4", label: "Education › Higher Secondary" },
  { value: "9", label: "Health › Hospitals" },
];
const record = (key: string, subTheme: string): CmsRecord => ({
  key, type: "dataset", status: "in_review", createdBy: 1, updatedAt: "", title: key, subtitle: "", values: { sub_theme: subTheme },
});

describe("themeOf / themesOf", () => {
  it("reads the top-level theme from the record's sub-theme option", () => {
    expect(themeOf(record("a", "4"), "sub_theme", subThemes)).toBe("Education");
    expect(themeOf(record("b", "9"), "sub_theme", subThemes)).toBe("Health");
  });

  it("is empty for an unknown or missing sub-theme, or before the options load", () => {
    expect(themeOf(record("a", "77"), "sub_theme", subThemes)).toBe("");
    expect(themeOf(record("a", ""), "sub_theme", subThemes)).toBe("");
    expect(themeOf(record("a", "3"), "sub_theme", undefined)).toBe("");
  });

  it("lists each theme present once, sorted", () => {
    expect(themesOf([record("a", "9"), record("b", "3"), record("c", "4"), record("d", "")], "sub_theme", subThemes)).toEqual(["Education", "Health"]);
  });
});
