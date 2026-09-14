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
  upsertDirectoryUser(session);
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

export const STAFF_ROLES: Role[] = ["researcher", "editor", "admin"];
/** Roles that can submit a dataset for review, per Module C's "Researcher uploads a dataset" story. */
export const CONTRIBUTOR_ROLES: Role[] = ["researcher", "editor", "admin"];

const REVIEWER_ROLES: Role[] = ["editor", "admin"];

/** Editor/Admin: can approve/deny dataset access requests (Module C). */
export function canReviewAccessRequests(session: MockSession | null): boolean {
  return !!session && REVIEWER_ROLES.includes(session.role);
}

/** Editor/Admin: can approve/reject drafted datasets or drafted content (Module A/C's shared review step). */
export function canReviewDrafts(session: MockSession | null): boolean {
  return !!session && REVIEWER_ROLES.includes(session.role);
}

/** Researcher/Editor/Admin: can submit a new dataset (Module C) or content draft (Module A). */
export function canContributeContent(session: MockSession | null): boolean {
  return !!session && CONTRIBUTOR_ROLES.includes(session.role);
}

/** Admin only: can view the user directory and grant/revoke roles (Module H, user story 8). */
export function isAdmin(session: MockSession | null): boolean {
  return !!session && session.role === "admin";
}

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

// ---------------------------------------------------------------------------
// Draft publication submissions (Researcher/Editor/Admin draft → Editor/Admin
// review). Demonstrates Module A's shared Draft→Review→Approve→Publish
// workflow applied to a publication-shaped submission — this is NOT Module
// B's full Publication Repository (no versioning, DOI, or citation export);
// that module is Future-phase/unbuilt. This is a lightweight stand-in scoped
// to the workflow state machine only.
// ---------------------------------------------------------------------------
const PUBLICATION_DRAFTS_KEY = "pri_mock_publication_drafts";

export type DraftPublication = {
  id: string;
  title: string;
  abstract: string;
  format: string;
  theme: string;
  language: string;
  submittedByEmail: string;
  submittedByName: string;
  submittedAt: string;
  status: DraftStatus;
};

export function getDraftPublications(): DraftPublication[] {
  return readJSON<DraftPublication[]>(PUBLICATION_DRAFTS_KEY, []);
}

export function submitDraftPublication(input: Omit<DraftPublication, "id" | "submittedAt" | "status">) {
  const drafts = getDraftPublications();
  drafts.push({
    ...input,
    id: `pubdraft-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    submittedAt: new Date().toISOString(),
    status: "pending",
  });
  writeJSON(PUBLICATION_DRAFTS_KEY, drafts);
}

export function decideDraftPublication(id: string, decision: "approved" | "rejected") {
  const drafts = getDraftPublications().map((d) => (d.id === id ? { ...d, status: decision } : d));
  writeJSON(PUBLICATION_DRAFTS_KEY, drafts);
}

// ---------------------------------------------------------------------------
// Recent activity — a lightweight, honest activity feed derived from records
// that already exist (access requests, dataset drafts, publication drafts),
// merged by timestamp. Not a real audit log: Module H's cross-module,
// server-side audit log (GET /api/audit-log/) is Future-phase/unbuilt. This
// stores nothing new — it only reads and merges what's already there.
// ---------------------------------------------------------------------------
export type ActivityItem = {
  at: string;
  kind: "access-request" | "dataset-draft" | "publication-draft";
  summary: string;
  status: string;
};

export function getRecentActivity(limit = 8): ActivityItem[] {
  const items: ActivityItem[] = [
    ...getAccessRequests().map((r) => ({
      at: r.requestedAt,
      kind: "access-request" as const,
      summary: `${r.requesterName} requested access to ${r.datasetSlug}`,
      status: r.status,
    })),
    ...getDraftDatasets().map((d) => ({
      at: d.submittedAt,
      kind: "dataset-draft" as const,
      summary: `${d.submittedByName} submitted dataset "${d.title}"`,
      status: d.status,
    })),
    ...getDraftPublications().map((d) => ({
      at: d.submittedAt,
      kind: "publication-draft" as const,
      summary: `${d.submittedByName} submitted publication "${d.title}"`,
      status: d.status,
    })),
  ];
  return items.sort((a, b) => b.at.localeCompare(a.at)).slice(0, limit);
}

// ---------------------------------------------------------------------------
// User directory & role management (Module H, "grant or revoke a user's
// role" — user story 8). This is a record of every account that has signed
// in on this browser, not a real multi-device user table: there's no backend
// yet, so an Admin can only manage accounts this browser has actually seen.
// Changing a role here updates the directory immediately, and also updates
// the live session in this browser if it belongs to the account being
// changed — that's as far as "takes effect immediately" can honestly go
// without a real server.
// ---------------------------------------------------------------------------
const USER_DIRECTORY_KEY = "pri_mock_user_directory";

export type DirectoryUser = {
  name: string;
  email: string;
  role: Role;
  firstSignInAt: string;
  updatedAt: string;
};

function getDirectoryMap(): Record<string, DirectoryUser> {
  return readJSON<Record<string, DirectoryUser>>(USER_DIRECTORY_KEY, {});
}

function upsertDirectoryUser(session: MockSession) {
  const map = getDirectoryMap();
  const existing = map[session.email];
  map[session.email] = {
    name: session.name,
    email: session.email,
    role: session.role,
    firstSignInAt: existing?.firstSignInAt ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  writeJSON(USER_DIRECTORY_KEY, map);
}

export function getUserDirectory(): DirectoryUser[] {
  return Object.values(getDirectoryMap()).sort((a, b) => a.name.localeCompare(b.name));
}

/** Admin-only: grant or revoke a user's role (Module H). */
export function setUserRole(email: string, role: Role) {
  const map = getDirectoryMap();
  const existing = map[email];
  if (!existing) return;
  map[email] = { ...existing, role, updatedAt: new Date().toISOString() };
  writeJSON(USER_DIRECTORY_KEY, map);

  const current = getSession();
  if (current && current.email === email) {
    writeJSON(SESSION_KEY, { ...current, role });
  }
}
