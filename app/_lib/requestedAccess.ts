/**
 * The API has no "my access requests" endpoint (backend gap G4): staff can list requests, the requester cannot. So this
 * browser remembers which datasets the signed-in user has asked for, to show "Request pending". It is a hint, not a
 * record: it is per browser, and an approval shows up regardless, because the API then sends the file.
 */
const KEY_PREFIX = "pri_requested_datasets:";

function read(email: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY_PREFIX + email);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((slug): slug is string => typeof slug === "string") : [];
  } catch {
    return [];
  }
}

export function getRequestedDatasets(email: string): string[] {
  return read(email);
}

export function rememberRequestedDataset(email: string, slug: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY_PREFIX + email, JSON.stringify([...new Set([...read(email), slug])]));
  } catch {
    // Private browsing or storage disabled: the hint is simply lost.
  }
}
