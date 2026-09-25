import { describe, expect, it, vi } from "vitest";
import { collectAllPages, type Page } from "./pagination";

const page = (results: number[], next: string | null): Page<number> => ({
  count: 3,
  next,
  previous: null,
  results,
});

describe("collectAllPages", () => {
  it("follows `next` until the last page and concatenates results in order", async () => {
    const fetchPage = vi
      .fn<(n: number) => Promise<Page<number>>>()
      .mockResolvedValueOnce(page([1, 2], "http://api/?page=2"))
      .mockResolvedValueOnce(page([3], null));

    await expect(collectAllPages(fetchPage)).resolves.toEqual([1, 2, 3]);
    expect(fetchPage.mock.calls.map(([n]) => n)).toEqual([1, 2]);
  });

  it("returns an empty list for an empty result set", async () => {
    await expect(collectAllPages(async () => page([], null))).resolves.toEqual([]);
  });
});
