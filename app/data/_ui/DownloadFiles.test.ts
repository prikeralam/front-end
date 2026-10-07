import { describe, expect, it } from "vitest";
import { formatSize } from "./DownloadFiles";

describe("formatSize", () => {
  it("reads bytes as people expect, and stays empty when unknown", () => {
    expect([formatSize(undefined), formatSize(512), formatSize(2048), formatSize(1_258_291), formatSize(45 * 1024 * 1024), formatSize(3 * 1024 ** 3)]).toEqual([
      "",
      "512 B",
      "2.0 KB",
      "1.2 MB",
      "45 MB",
      "3.0 GB",
    ]);
  });
});
