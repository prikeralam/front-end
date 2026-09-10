/**
 * Fully mocked, client-side, single-browser auth/access-request prototype.
 * There is no backend yet — this exists purely to demo the intended
 * register → sign-in → role dashboard interaction flow (see
 * docs/PRDs/frontend/04-data-repository-library.md and
 * docs/PRDs/backend/{C-data-repository-dashboard-integration,H-user-access-roles}.md).
 * Nothing here is secure or persisted beyond one browser's localStorage.
 */
import type { Dataset } from "./types";

export type Role = "public" | "researcher" | "editor" | "fellow" | "admin";

export const roleLabels: Record<Role, string> = {
  public: "Donor/Visitor",
  researcher: "Researcher",
  editor: "Editor",
  fellow: "Intern/Fellow",
  admin: "Admin",
};

export const roles: Role[] = ["public", "researcher", "editor", "fellow", "admin"];

export type MockSession = {
  name: string;
  email: string;
  role: Role;
};

export type AccessStatus = "pending" | "approved" | "denied";

export type AccessRequestRecord = {
  datasetSlug: string;
  requesterEmail: string;
  requesterName: string;
  status: AccessStatus;
  requestedAt: string;
};

const SESSION_KEY = "pri_mock_session";
const REQUESTS_KEY = "pri_mock_access_requests";

function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore — private browsing / storage disabled
  }
}

export function getSession(): MockSession | null {
  return readJSON<MockSession | null>(SESSION_KEY, null);
}

export function setSession(session: MockSession) {
  writeJSON(SESSION_KEY, session);
}

export function clearSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(SESSION_KEY);
}

export function getAccessRequests(): AccessRequestRecord[] {
  return readJSON<AccessRequestRecord[]>(REQUESTS_KEY, []);
}

export function requestAccess(datasetSlug: string, session: MockSession) {
  const requests = getAccessRequests();
  const already = requests.some((r) => r.datasetSlug === datasetSlug && r.requesterEmail === session.email);
  if (already) return;
  requests.push({
    datasetSlug,
    requesterEmail: session.email,
    requesterName: session.name,
    status: "pending",
    requestedAt: new Date().toISOString(),
  });
  writeJSON(REQUESTS_KEY, requests);
}

export function decideAccessRequest(datasetSlug: string, requesterEmail: string, decision: "approved" | "denied") {
  const requests = getAccessRequests().map((r) =>
    r.datasetSlug === datasetSlug && r.requesterEmail === requesterEmail ? { ...r, status: decision } : r
  );
  writeJSON(REQUESTS_KEY, requests);
}

export type AccessState = "full" | "requestable" | "locked";

const STAFF_ROLES: Role[] = ["researcher", "editor", "admin"];
/** Roles that can submit a dataset for review, per Module C's "Researcher uploads a dataset" story. */
export const CONTRIBUTOR_ROLES: Role[] = ["researcher", "editor", "admin"];

export function canAccessDataset(dataset: Dataset, session: MockSession | null): AccessState {
  if (!session) return "locked";

  if (dataset.visibility === "public") return "full";

  if (dataset.visibility === "on-request") {
    const approved = getAccessRequests().some(
      (r) => r.datasetSlug === dataset.slug && r.requesterEmail === session.email && r.status === "approved"
    );
    return approved ? "full" : "requestable";
  }

  // internal
  return STAFF_ROLES.includes(session.role) ? "full" : "locked";
}

// ---------------------------------------------------------------------------
// Favorites
// ---------------------------------------------------------------------------
const FAVORITES_KEY = "pri_mock_favorites";

function getFavoritesMap(): Record<string, string[]> {
  return readJSON<Record<string, string[]>>(FAVORITES_KEY, {});
}

export function getFavorites(email: string): string[] {
  return getFavoritesMap()[email] ?? [];
}

export function isFavorite(email: string, slug: string): boolean {
  return getFavorites(email).includes(slug);
}

export function toggleFavorite(email: string, slug: string) {
  const map = getFavoritesMap();
  const current = map[email] ?? [];
  map[email] = current.includes(slug) ? current.filter((s) => s !== slug) : [...current, slug];
  writeJSON(FAVORITES_KEY, map);
}

// ---------------------------------------------------------------------------
// Downloads (site-wide counters + per-user history)
// ---------------------------------------------------------------------------
const DOWNLOADS_KEY = "pri_mock_downloads";

export type DownloadRecord = { slug: string; email: string; at: string };

export function getDownloadLog(): DownloadRecord[] {
  return readJSON<DownloadRecord[]>(DOWNLOADS_KEY, []);
}

export function logDownload(slug: string, session: MockSession) {
  const log = getDownloadLog();
  log.push({ slug, email: session.email, at: new Date().toISOString() });
  writeJSON(DOWNLOADS_KEY, log);
}

export function getDownloadCount(slug: string): number {
  return getDownloadLog().filter((r) => r.slug === slug).length;
}

export function getDownloadHistory(email: string): DownloadRecord[] {
  return getDownloadLog()
    .filter((r) => r.email === email)
    .sort((a, b) => b.at.localeCompare(a.at));
}

// ---------------------------------------------------------------------------
// API access
// ---------------------------------------------------------------------------
const API_KEYS_KEY = "pri_mock_api_keys";

function randomKey(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let out = "pri_live_";
  for (let i = 0; i < 32; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export function getOrCreateApiKey(email: string): string {
  const map = readJSON<Record<string, string>>(API_KEYS_KEY, {});
  if (!map[email]) {
    map[email] = randomKey();
    writeJSON(API_KEYS_KEY, map);
  }
  return map[email];
}

export function regenerateApiKey(email: string): string {
  const map = readJSON<Record<string, string>>(API_KEYS_KEY, {});
  map[email] = randomKey();
  writeJSON(API_KEYS_KEY, map);
  return map[email];
}

// ---------------------------------------------------------------------------
// Watched themes (a lightweight, honest stand-in for "notifications" — no
// fabricated freshness claims, just a personalized shortcut to themes the
// user has actually browsed).
// ---------------------------------------------------------------------------
const WATCHED_THEMES_KEY = "pri_mock_watched_themes";

export function getWatchedThemes(email: string): string[] {
  const map = readJSON<Record<string, string[]>>(WATCHED_THEMES_KEY, {});
  return map[email] ?? [];
}

export function watchTheme(email: string, theme: string) {
  const map = readJSON<Record<string, string[]>>(WATCHED_THEMES_KEY, {});
  const current = map[email] ?? [];
  if (current.includes(theme)) return;
  map[email] = [...current, theme];
  writeJSON(WATCHED_THEMES_KEY, map);
}

// ---------------------------------------------------------------------------
// Draft dataset submissions (Researcher/Editor/Admin upload → Editor/Admin review)
// ---------------------------------------------------------------------------
const DRAFTS_KEY = "pri_mock_drafts";

export type DraftStatus = "pending" | "approved" | "rejected";

export type DraftDataset = {
  id: string;
  title: string;
  description: string;
  theme: string;
  geography: string;
  year: string;
  fileFormat: string;
  tags: string[];
  submittedByEmail: string;
  submittedByName: string;
  submittedAt: string;
  status: DraftStatus;
};

export function getDraftDatasets(): DraftDataset[] {
  return readJSON<DraftDataset[]>(DRAFTS_KEY, []);
}

export function submitDraftDataset(input: Omit<DraftDataset, "id" | "submittedAt" | "status">) {
  const drafts = getDraftDatasets();
  drafts.push({
    ...input,
    id: `draft-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    submittedAt: new Date().toISOString(),
    status: "pending",
  });
  writeJSON(DRAFTS_KEY, drafts);
}

export function decideDraftDataset(id: string, decision: "approved" | "rejected") {
  const drafts = getDraftDatasets().map((d) => (d.id === id ? { ...d, status: decision } : d));
  writeJSON(DRAFTS_KEY, drafts);
}
