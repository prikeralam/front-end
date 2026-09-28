import "server-only";
import { cookies } from "next/headers";
import { InvalidCredentialsError, TooManyAttemptsError, login, resolveSession, revokeRefresh } from "./authService";
import { ACCESS_COOKIE, REFRESH_COOKIE, clearSessionCookies, setSessionCookies } from "./cookies";

const MAX_USERNAME_LENGTH = 150;
const MAX_PASSWORD_LENGTH = 128;

function json(body: unknown, status: number): Response {
  // Per-user responses must never be cached by the browser or a CDN.
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

/**
 * The host the browser addressed. Behind nginx the standalone server sees `request.url` as its own bind address
 * (`0.0.0.0:3000`), so the proxy's forwarded host, or `Host`, is what identifies this site; Server Actions check the same.
 */
function requestHost(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-host")?.split(",")[0].trim();
  return forwarded || request.headers.get("host") || new URL(request.url).host;
}

/** Browsers always send `Origin` on cross-site POSTs; reject any that does not match this site. Non-browser callers omit it. */
function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  return !origin || new URL(origin).host === requestHost(request);
}

function unavailable(error: unknown): Response {
  console.error("Sign-in service failure", error);
  return json({ detail: "The sign-in service is unavailable right now." }, 503);
}

/** `POST /api/auth/login`: exchanges credentials for tokens, stores them in httpOnly cookies, returns the user. */
export async function handleLogin(request: Request): Promise<Response> {
  if (!isSameOrigin(request)) return json({ detail: "Cross-site sign-in is not allowed." }, 403);

  const body: unknown = await request.json().catch(() => null);
  const { username, password } = (body && typeof body === "object" ? body : {}) as { username?: unknown; password?: unknown };
  if (typeof username !== "string" || typeof password !== "string" || !username.trim() || !password) {
    return json({ detail: "Enter both your username and password." }, 400);
  }
  if (username.length > MAX_USERNAME_LENGTH || password.length > MAX_PASSWORD_LENGTH) {
    return json({ detail: "Enter both your username and password." }, 400);
  }

  try {
    const tokens = await login(username.trim(), password);
    const session = await resolveSession({ access: tokens.access });
    if (!session) return unavailable(new Error("A freshly issued token was rejected"));
    setSessionCookies(await cookies(), tokens);
    return json(session.user, 200);
  } catch (error) {
    if (error instanceof InvalidCredentialsError) return json({ detail: "Invalid credentials" }, 401);
    if (error instanceof TooManyAttemptsError) return json({ detail: "Too many sign-in attempts. Wait a minute and try again." }, 429);
    return unavailable(error);
  }
}

/**
 * `POST /api/auth/logout`: revokes the refresh token on the backend, then forgets both tokens. Revocation is best
 * effort: the cookies are cleared even when the backend cannot be reached, so signing out always works locally.
 */
export async function handleLogout(request: Request): Promise<Response> {
  if (!isSameOrigin(request)) return json({ detail: "Cross-site sign-out is not allowed." }, 403);
  const store = await cookies();
  const refresh = store.get(REFRESH_COOKIE)?.value;
  if (refresh) {
    try {
      await revokeRefresh(refresh);
    } catch (error) {
      console.error("Could not revoke the refresh token on sign-out", error);
    }
  }
  clearSessionCookies(store);
  return json({ ok: true }, 200);
}

/** `GET /api/auth/session`: who the cookies belong to, renewing the access token from the refresh token when needed. */
export async function handleSession(): Promise<Response> {
  const store = await cookies();
  try {
    const session = await resolveSession({ access: store.get(ACCESS_COOKIE)?.value, refresh: store.get(REFRESH_COOKIE)?.value });
    if (!session) {
      clearSessionCookies(store);
      return json({ detail: "Not signed in." }, 401);
    }
    if (session.accessWasRefreshed) setSessionCookies(store, { access: session.access });
    return json(session.user, 200);
  } catch (error) {
    // An outage is not a sign-out: keep the cookies so the user is still signed in once the backend is back.
    return unavailable(error);
  }
}
