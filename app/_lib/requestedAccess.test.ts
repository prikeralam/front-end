import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getRequestedDatasets, rememberRequestedDataset } from "./requestedAccess";

function stubStorage(initial: Record<string, string> = {}) {
  const data = { ...initial };
  vi.stubGlobal("window", {
    localStorage: {
      getItem: (key: string) => data[key] ?? null,
      setItem: (key: string, value: string) => {
        data[key] = value;
      },
    },
  });
  return data;
}

beforeEach(() => stubStorage());
afterEach(() => vi.unstubAllGlobals());

describe("requested datasets hint", () => {
  it("remembers requests per user without duplicates", () => {
    rememberRequestedDataset("a@x.org", "phc-load-by-area");
    rememberRequestedDataset("a@x.org", "phc-load-by-area");
    rememberRequestedDataset("a@x.org", "other");
    rememberRequestedDataset("b@x.org", "third");

    expect(getRequestedDatasets("a@x.org")).toEqual(["phc-load-by-area", "other"]);
    expect(getRequestedDatasets("b@x.org")).toEqual(["third"]);
  });

  it("returns nothing for unknown users, corrupt storage or no browser", () => {
    expect(getRequestedDatasets("nobody@x.org")).toEqual([]);

    stubStorage({ "pri_requested_datasets:a@x.org": "{not json" });
    expect(getRequestedDatasets("a@x.org")).toEqual([]);

    stubStorage({ "pri_requested_datasets:a@x.org": JSON.stringify([1, "ok", null]) });
    expect(getRequestedDatasets("a@x.org")).toEqual(["ok"]);

    vi.unstubAllGlobals();
    expect(getRequestedDatasets("a@x.org")).toEqual([]);
    expect(() => rememberRequestedDataset("a@x.org", "x")).not.toThrow();
  });
});
