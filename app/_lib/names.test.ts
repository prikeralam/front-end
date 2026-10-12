import { describe, expect, it } from "vitest";
import { joinNames } from "./names";

describe("joinNames", () => {
  it("joins names the way a byline reads", () => {
    expect(joinNames([])).toBe("");
    expect(joinNames(["A"])).toBe("A");
    expect(joinNames(["A", "B"])).toBe("A and B");
    expect(joinNames(["A", "B", "C"])).toBe("A, B and C");
  });
});
