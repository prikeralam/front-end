import { describe, expect, it } from "vitest";
import { gmailComposeUrl, OFFICE_MAILBOX } from "./gmailCompose";

describe("gmailComposeUrl", () => {
  it("opens compose in the office mailbox, addressed and titled", () => {
    const url = new URL(gmailComposeUrl("asha@example.com", "Your application to PRI (Fellowship)"));
    expect(url.origin + url.pathname).toBe("https://mail.google.com/mail/");
    expect(url.searchParams.get("authuser")).toBe(OFFICE_MAILBOX);
    expect(url.searchParams.get("view")).toBe("cm");
    expect(url.searchParams.get("to")).toBe("asha@example.com");
    expect(url.searchParams.get("su")).toBe("Your application to PRI (Fellowship)");
  });

  it("leaves the subject out when there is none", () => {
    expect(new URL(gmailComposeUrl("a@b.in")).searchParams.has("su")).toBe(false);
  });

  it("keeps an address with a plus or ampersand intact", () => {
    expect(new URL(gmailComposeUrl("a+b&c@x.in")).searchParams.get("to")).toBe("a+b&c@x.in");
  });
});
