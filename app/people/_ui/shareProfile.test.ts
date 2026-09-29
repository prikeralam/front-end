import { describe, expect, it, vi } from "vitest";
import { shareProfile } from "./shareProfile";

const url = "https://priresearch.in/people/asha";

describe("shareProfile", () => {
  it("uses the share sheet when the device has one", async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    expect(await shareProfile(url, "Asha", { share })).toBe("shared");
    expect(share).toHaveBeenCalledWith({ title: "Asha", url });
  });

  it("treats a dismissed share sheet as cancelled, not failed", async () => {
    const share = vi.fn().mockRejectedValue(new DOMException("dismissed", "AbortError"));
    expect(await shareProfile(url, "Asha", { share })).toBe("cancelled");
  });

  it("copies the link when there is no share sheet, or when sharing is refused", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    expect(await shareProfile(url, "Asha", { clipboard: { writeText } as unknown as Clipboard })).toBe("copied");
    expect(writeText).toHaveBeenCalledWith(url);

    const share = vi.fn().mockRejectedValue(new DOMException("not allowed", "NotAllowedError"));
    expect(await shareProfile(url, "Asha", { share, clipboard: { writeText } as unknown as Clipboard })).toBe("copied");
  });

  it("reports failure when neither works", async () => {
    const writeText = vi.fn().mockRejectedValue(new Error("denied"));
    expect(await shareProfile(url, "Asha", { clipboard: { writeText } as unknown as Clipboard })).toBe("failed");
    expect(await shareProfile(url, "Asha", {})).toBe("failed");
  });
});
