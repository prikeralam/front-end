import { describe, expect, it } from "vitest";
import { describeAuditEntry, toAuditRow } from "./auditAdapter";

describe("describeAuditEntry", () => {
  it("describes a workflow status transition", () => {
    expect(
      describeAuditEntry({ action: "status_transition", target: "testimonial:1", metadata: { previous_status: "in_review", new_status: "published" } }),
    ).toBe("Moved testimonial #1 from in review to published");
  });

  it("describes a role change", () => {
    expect(describeAuditEntry({ action: "role_change", target: "user:2", metadata: { old_role: "researcher", new_role: "editor" } })).toBe(
      "Changed the role of user #2 from researcher to editor",
    );
  });

  it("describes an access request review", () => {
    expect(describeAuditEntry({ action: "access_request_review", target: "accessrequest:2", metadata: { old_status: "pending", new_status: "approved" } })).toBe(
      "Reviewed accessrequest #2: from pending to approved",
    );
  });

  it("copes with missing or malformed metadata", () => {
    expect(describeAuditEntry({ action: "status_transition", target: "contentblock:4", metadata: { new_status: "published" } })).toBe("Moved contentblock #4 to published");
    expect(describeAuditEntry({ action: "status_transition", target: "contentblock:4", metadata: null })).toBe("Moved contentblock #4");
    expect(describeAuditEntry({ action: "role_change", target: "user:1", metadata: { old_role: 3 } })).toBe("Changed the role of user #1");
  });

  it("falls back to a readable generic line for unknown actions", () => {
    expect(describeAuditEntry({ action: "dataset_purged", target: "dataset:9", metadata: {} })).toBe("Dataset purged: dataset #9");
    expect(describeAuditEntry({ action: "thing.happened", target: "x:1", metadata: {} })).toBe("Thing happened: x #1");
  });

  it("describes account events and exports", () => {
    expect(describeAuditEntry({ action: "user.registered", target: "user:21", metadata: {} })).toBe("New visitor signed up (user #21)");
    expect(describeAuditEntry({ action: "user_deactivate", target: "user:5", metadata: {} })).toBe("Deactivated the account user #5");
    expect(describeAuditEntry({ action: "users_export", target: "users:export", metadata: { rows: 1, newsletter_only: true } })).toBe("Exported the newsletter list as CSV (1 row)");
    expect(describeAuditEntry({ action: "users_export", target: "users:export", metadata: { rows: 12, newsletter_only: false } })).toBe("Exported accounts as CSV (12 rows)");
  });
});

describe("toAuditRow", () => {
  it("shows the actor as a user id, the API's only identifier", () => {
    expect(
      toAuditRow({ id: 4, actor: 12, module: "datarepo", action: "access_request_review", target: "accessrequest:2", metadata: {}, timestamp: "2026-09-25T10:06:38Z" }),
    ).toMatchObject({ id: 4, actor: "User #12", module: "datarepo", at: "2026-09-25T10:06:38Z" });
  });
});
