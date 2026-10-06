/**
 * The signed-in user as the browser knows them, plus the role rules the UI uses to decide what to show.
 *
 * The server is the source of truth (httpOnly token cookies behind /api/auth/*). `authClient.ts` asks it and mirrors the
 * verified user here, so client components can read a session synchronously. Nothing here grants access: the backend
 * re-checks the role on every call, and these predicates only decide which buttons and screens to offer.
 */

export type Role = "public" | "researcher" | "editor" | "fellow" | "admin";

export const roleLabels: Record<Role, string> = {
  public: "Donor/Visitor",
  researcher: "Researcher",
  editor: "Editor",
  fellow: "Intern/Fellow",
  admin: "Admin",
};

export type Session = {
  name: string;
  email: string;
  role: Role;
  /** Backend user id, used to tell whether an object is the signed-in user's own. */
  id?: number;
  /** Signed in with a temporary password an admin set: the dashboard asks for a new one before anything else. */
  mustChangePassword?: boolean;
};

const SESSION_KEY = "pri_session";
export const SESSION_CHANGED_EVENT = "pri-session-changed";

let lastRaw: string | null | undefined;
let lastParsed: Session | null = null;

/** Like `getSession`, but returns the same object until the stored value changes, as `useSyncExternalStore` requires. */
export function getSessionSnapshot(): Session | null {
  if (typeof window === "undefined") return null;
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(SESSION_KEY);
  } catch {
    raw = null;
  }
  if (raw === lastRaw) return lastParsed;
  lastRaw = raw;
  try {
    lastParsed = raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    lastParsed = null;
  }
  return lastParsed;
}

/** Calls `listener` when this tab signs in or out, or another tab changes the stored session. Returns the unsubscribe. */
export function subscribeToSession(listener: () => void): () => void {
  window.addEventListener(SESSION_CHANGED_EVENT, listener);
  window.addEventListener("storage", listener);
  return () => {
    window.removeEventListener(SESSION_CHANGED_EVENT, listener);
    window.removeEventListener("storage", listener);
  };
}

export function getSession(): Session | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

export function setSession(session: Session): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    // Private browsing or storage disabled: the mirror is simply lost, and the next server check rebuilds it.
  }
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(SESSION_KEY);
}

/** Roles that can create content and datasets as drafts. */
const CONTRIBUTOR_ROLES: Role[] = ["researcher", "editor", "admin"];
const REVIEWER_ROLES: Role[] = ["editor", "admin"];

/** Editor/Admin: can approve, publish and delete drafted content and datasets. */
export function canReviewDrafts(session: Session | null): boolean {
  return !!session && REVIEWER_ROLES.includes(session.role);
}

/** Researcher/Editor/Admin: can create content and dataset drafts. */
export function canContributeContent(session: Session | null): boolean {
  return !!session && CONTRIBUTOR_ROLES.includes(session.role);
}

/** Admin only: can read the audit log. */
export function isAdmin(session: Session | null): boolean {
  return !!session && session.role === "admin";
}
