import { describe, expect, it } from "vitest";
import { safeNext, splitName, validateSignup } from "./signup";

describe("safeNext", () => {
  it("keeps plain paths on this site and drops anything else", () => {
    expect(safeNext("/data/plus-one-batch-size")).toBe("/data/plus-one-batch-size");
    expect(safeNext("//evil.example")).toBe("");
    expect(safeNext("https://evil.example")).toBe("");
    expect(safeNext("/data?x=1")).toBe("");
    expect(safeNext(undefined)).toBe("");
  });
});

describe("splitName", () => {
  it("splits on the first space", () => {
    expect(splitName("  Asha K  Menon ")).toEqual({ first_name: "Asha", last_name: "K Menon" });
    expect(splitName("Asha")).toEqual({ first_name: "Asha", last_name: "" });
  });
});

describe("validateSignup", () => {
  const good = { name: "Asha", email: "asha@example.org", password: "a-long-pass", organisation: "", purpose: "research", terms: true };

  it("accepts a complete sign-up", () => {
    expect(validateSignup(good)).toEqual({});
  });

  it("explains each problem", () => {
    expect(validateSignup({ ...good, name: " ", email: "nope", password: "short", purpose: "spying", terms: false })).toEqual({
      name: "Enter your name.",
      email: "Enter a valid email address.",
      password: "Use at least 8 characters.",
      purpose: "Choose what you'll use the data for.",
      terms: "Please agree to the terms of use and privacy policy.",
    });
  });
});
