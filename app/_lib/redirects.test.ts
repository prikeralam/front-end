import { describe, expect, it } from "vitest";
import config from "../../next.config";

describe("redirects", () => {
  it("send the old fellowship pages to Careers, old job links first", async () => {
    const rules = (await config.redirects!()).filter((r) => r.source.startsWith("/fellowship"));
    expect(rules.map((r) => [r.source, r.has ? "?role" : "", r.destination, r.permanent])).toEqual([
      ["/fellowship/apply", "?role", "/careers/jobs/:role/apply", true],
      ["/fellowship/apply", "", "/careers/apply", true],
      ["/fellowship/:slug", "", "/careers#fellowships", true],
      ["/fellowship", "", "/careers#fellowships", true],
    ]);
  });
});
