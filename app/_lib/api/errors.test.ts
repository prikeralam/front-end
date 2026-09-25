import { describe, expect, it } from "vitest";
import { describeErrorBody } from "./errors";

describe("describeErrorBody", () => {
  it("returns DRF's detail message", () => {
    expect(describeErrorBody({ detail: "Not found." })).toBe("Not found.");
  });

  it("joins field validation errors", () => {
    expect(describeErrorBody({ group: ["Invalid choice."], page: ["Bad page."] })).toBe(
      "group: Invalid choice.; page: Bad page.",
    );
  });

  it("falls back for empty or non-object bodies", () => {
    expect(describeErrorBody(undefined)).toBe("Unknown error");
    expect(describeErrorBody("boom")).toBe("Unknown error");
  });
});
