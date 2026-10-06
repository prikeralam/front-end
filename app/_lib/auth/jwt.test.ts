import { describe, expect, it } from "vitest";
import { secondsUntilExpiry } from "./jwt";

const tokenWith = (claims: unknown) => `header.${Buffer.from(JSON.stringify(claims)).toString("base64url")}.signature`;

describe("secondsUntilExpiry", () => {
  const now = 1_000_000_000_000; // ms

  it("returns the seconds left until exp", () => {
    expect(secondsUntilExpiry(tokenWith({ exp: now / 1000 + 300 }), now)).toBe(300);
  });

  it("never returns a negative number for an expired token", () => {
    expect(secondsUntilExpiry(tokenWith({ exp: now / 1000 - 60 }), now)).toBe(0);
  });

  it("returns null when the token has no readable expiry", () => {
    expect(secondsUntilExpiry(tokenWith({ sub: "1" }), now)).toBeNull();
    expect(secondsUntilExpiry(tokenWith({ exp: "soon" }), now)).toBeNull();
    expect(secondsUntilExpiry("not-a-jwt", now)).toBeNull();
    expect(secondsUntilExpiry("a.%%%.c", now)).toBeNull();
  });
});
