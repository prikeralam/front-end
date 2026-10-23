import { describe, expect, it } from "vitest";
import { pageOf } from "./paging";

const items = Array.from({ length: 23 }, (_, i) => i + 1);

describe("pageOf", () => {
  it("cuts ten to a page", () => {
    expect(pageOf(items, 1)).toEqual({ items: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], page: 1, pages: 3 });
    expect(pageOf(items, 3)).toEqual({ items: [21, 22, 23], page: 3, pages: 3 });
  });

  it("clamps a page out of range, e.g. after a filter shrinks the list", () => {
    expect(pageOf(items, 9).page).toBe(3);
    expect(pageOf(items, 0).page).toBe(1);
  });

  it("is one empty page for no items", () => {
    expect(pageOf([], 1)).toEqual({ items: [], page: 1, pages: 1 });
  });
});
