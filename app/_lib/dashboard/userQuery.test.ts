import { describe, expect, it } from "vitest";
import { userQuery } from "./userQuery";

describe("userQuery", () => {
  it("maps filters onto the API's query", () => {
    const query = userQuery({ q: " asha ", staff: false, confirmed: "yes", newsletter: true, purpose: "research", ordering: "-date_joined", page: 2, pageSize: 25 });
    expect(query?.toString()).toBe("page=2&page_size=25&q=asha&staff=false&email_verified=true&newsletter_opt_in=true&purpose=research&ordering=-date_joined");
    expect(userQuery({ role: "editor", active: "inactive", staff: true })?.toString()).toBe("page=1&role=editor&is_active=false&staff=true");
  });

  it("leaves paging out of an export", () => {
    expect(userQuery({ staff: false, page: 3, pageSize: 50 }, { forExport: true })?.toString()).toBe("staff=false");
  });

  it("refuses anything invalid, since actions are public endpoints", () => {
    expect(userQuery({ role: "owner" as never })).toBeNull();
    expect(userQuery({ purpose: "spying" as never })).toBeNull();
    expect(userQuery({ ordering: "password" as never })).toBeNull();
    expect(userQuery({ pageSize: 500 })).toBeNull();
    expect(userQuery({ q: "x".repeat(101) })).toBeNull();
    expect(userQuery({ staff: "yes" as never })).toBeNull();
  });
});
