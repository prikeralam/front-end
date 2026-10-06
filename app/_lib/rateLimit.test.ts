import { describe, expect, it } from "vitest";
import { createRateLimiter } from "./rateLimit";

describe("createRateLimiter", () => {
  it("allows up to the limit per key within the window, then again once it has passed", () => {
    const allow = createRateLimiter({ limit: 2, windowMs: 1000 });
    expect([allow("a", 0), allow("a", 10), allow("a", 20), allow("b", 20)]).toEqual([true, true, false, true]);
    expect(allow("a", 1005)).toBe(true);
  });

  it("forgets the oldest keys beyond its size cap", () => {
    const allow = createRateLimiter({ limit: 1, windowMs: 1000, maxKeys: 2 });
    allow("a", 0);
    allow("b", 0);
    allow("c", 0);
    expect(allow("a", 1)).toBe(true);
    expect(allow("c", 1)).toBe(false);
  });
});
