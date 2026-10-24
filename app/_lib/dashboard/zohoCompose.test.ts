import { describe, expect, it } from "vitest";
import { zohoComposeUrl } from "./zohoCompose";

const ct = (url: string) => new URL(url).searchParams.get("ct");

describe("zohoComposeUrl", () => {
  it("opens Zoho Mail's compose with the mailto link it expects", () => {
    const url = zohoComposeUrl("asha@example.com", "Your application to PRI (Fellowship)");
    expect(url.startsWith("https://mail.zoho.in/zm/comp.do?ct=")).toBe(true);
    expect(ct(url)).toBe("mailto:asha@example.com?subject=Your%20application%20to%20PRI%20(Fellowship)");
  });

  it("leaves the subject out when there is none", () => {
    expect(ct(zohoComposeUrl("a@b.in"))).toBe("mailto:a@b.in");
  });

  it("keeps a subject with & or ? from spilling into other parameters", () => {
    expect(ct(zohoComposeUrl("a@b.in", "Q&A? yes"))).toBe("mailto:a@b.in?subject=Q%26A%3F%20yes");
  });
});
