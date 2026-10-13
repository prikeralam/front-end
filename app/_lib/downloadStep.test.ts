import { describe, expect, it } from "vitest";
import { downloadStep } from "./downloadStep";
import type { Session } from "./session";

const visitor: Session = { name: "Asha", email: "asha@example.org", role: "public", emailVerified: true };

describe("downloadStep", () => {
  it("offers the files whenever the backend sent them", () => {
    expect(downloadStep("full", 2, null)).toBe("files");
    expect(downloadStep("full", 0, visitor)).toBe("no-file");
  });

  it("asks a signed-out visitor to sign in before a public download", () => {
    expect(downloadStep("signin", 0, undefined)).toBe("checking");
    expect(downloadStep("signin", 0, null)).toBe("sign-in");
  });

  it("asks a signed-in visitor to confirm their email first", () => {
    expect(downloadStep("signin", 0, { ...visitor, emailVerified: false })).toBe("confirm-email");
    expect(downloadStep("signin", 0, visitor)).toBe("checking");
  });

  it("keeps the on-request and locked states", () => {
    expect(downloadStep("requestable", 0, null)).toBe("sign-in-to-request");
    expect(downloadStep("requestable", 0, visitor)).toBe("request");
    expect(downloadStep("locked", 0, visitor)).toBe("locked");
  });
});
