type ShareTarget = Pick<Navigator, "share" | "clipboard"> | Partial<Pick<Navigator, "share" | "clipboard">>;

export type ShareOutcome = "shared" | "copied" | "cancelled" | "failed";

/**
 * Shares a profile link through the device's share sheet where there is one (phones, some desktops), otherwise
 * copies it to the clipboard. Dismissing the share sheet is not an error.
 */
export async function shareProfile(url: string, title: string, target: ShareTarget = navigator): Promise<ShareOutcome> {
  if (typeof target.share === "function") {
    try {
      await target.share({ title, url });
      return "shared";
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return "cancelled";
      // Some browsers expose share() but refuse it (for example without a user gesture); fall back to copying.
    }
  }
  try {
    await target.clipboard?.writeText(url);
    return target.clipboard ? "copied" : "failed";
  } catch {
    return "failed";
  }
}
