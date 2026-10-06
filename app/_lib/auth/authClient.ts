import { SESSION_CHANGED_EVENT, clearSession, getSession, setSession, type Session, type Role } from "../session";

/**
 * Browser half of sign-in. The server owns the truth (httpOnly token cookies behind /api/auth/*); this module asks it
 * and mirrors the verified `{name, email, role}` into the existing session shape that the dashboard code reads, so a
 * stale local copy can never outlive the real session for long.
 */

type SessionUser = { id: number; name: string; email: string; role: Role; mustChangePassword?: boolean };

export type SignInResult = { ok: true; session: Session } | { ok: false; reason: "invalid" | "input" | "throttled" | "unreachable" };

export type SessionCheck =
  | { status: "signed-in"; session: Session }
  | { status: "signed-out" }
  /** The server could not be asked; the last known session (if any) is kept rather than signing the user out. */
  | { status: "unreachable"; session: Session | null };

function mirror(user: SessionUser): Session {
  const session: Session = { id: user.id, name: user.name, email: user.email, role: user.role, mustChangePassword: !!user.mustChangePassword };
  setSession(session);
  window.dispatchEvent(new Event(SESSION_CHANGED_EVENT));
  return session;
}

function forget() {
  clearSession();
  window.dispatchEvent(new Event(SESSION_CHANGED_EVENT));
}

export async function signIn(username: string, password: string): Promise<SignInResult> {
  let response: Response;
  try {
    response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
  } catch {
    return { ok: false, reason: "unreachable" };
  }

  if (response.status === 401) return { ok: false, reason: "invalid" };
  if (response.status === 400) return { ok: false, reason: "input" };
  if (response.status === 429) return { ok: false, reason: "throttled" };
  if (!response.ok) return { ok: false, reason: "unreachable" };
  return { ok: true, session: mirror((await response.json()) as SessionUser) };
}

/** Best effort: the local session is dropped even if the server cannot be told. */
export async function signOut(): Promise<void> {
  try {
    await fetch("/api/auth/logout", { method: "POST" });
  } finally {
    forget();
  }
}

export async function checkSession(): Promise<SessionCheck> {
  let response: Response;
  try {
    response = await fetch("/api/auth/session", { cache: "no-store" });
  } catch {
    return { status: "unreachable", session: getSession() };
  }

  if (response.status === 401) {
    forget();
    return { status: "signed-out" };
  }
  if (!response.ok) return { status: "unreachable", session: getSession() };
  return { status: "signed-in", session: mirror((await response.json()) as SessionUser) };
}
