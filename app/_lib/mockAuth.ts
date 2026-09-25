/**
 * Fully mocked, client-side, single-browser auth/access-request prototype.
 * There is no backend yet — this exists purely to demo the intended
 * register → sign-in → role dashboard interaction flow (see
 * docs/PRDs/frontend/04-data-repository-library.md and
 * docs/PRDs/backend/{C-data-repository-dashboard-integration,H-user-access-roles}.md).
 * Nothing here is secure or persisted beyond one browser's localStorage.
 */

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
  /** Backend user id, set for real sessions; used to tell whether an object is the signed-in user's own. */
  id?: number;
};

const SESSION_KEY = "pri_mock_session";
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

export type AccessState = "full" | "requestable" | "locked";

/** Roles that can create content and datasets as drafts. */
const CONTRIBUTOR_ROLES: Role[] = ["researcher", "editor", "admin"];
const REVIEWER_ROLES: Role[] = ["editor", "admin"];

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

export function watchTheme(email: string, theme: string) {
  const map = readJSON<Record<string, string[]>>(WATCHED_THEMES_KEY, {});
  const current = map[email] ?? [];
  if (current.includes(theme)) return;
  map[email] = [...current, theme];
  writeJSON(WATCHED_THEMES_KEY, map);
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
