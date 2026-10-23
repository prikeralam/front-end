import { describe, expect, it } from "vitest";
import { reviewActions } from "./workflowSteps";

const targets = (status: Parameters<typeof reviewActions>[0]) => reviewActions(status).map((s) => s.next);

describe("reviewActions", () => {
  it("lets an unpublished item be republished, sent to review or returned to draft", () => {
    expect(targets("unpublished")).toEqual(["published", "in_review", "draft"]);
  });

  it("lets an approved item be published or sent back to draft", () => {
    expect(targets("approved")).toEqual(["published", "draft"]);
  });

  it("keeps the existing steps for review and published items", () => {
    expect(targets("in_review")).toEqual(["approved", "draft"]);
    expect(targets("published")).toEqual(["unpublished"]);
  });

  it("offers reviewers nothing on a draft (submitting is a separate step)", () => {
    expect(targets("draft")).toEqual([]);
  });
});
