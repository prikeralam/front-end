import "server-only";
import { cookies } from "next/headers";
import { InvalidCredentialsError, login, resolveSession } from "./authService";
import { ACCESS_COOKIE, REFRESH_COOKIE, clearSessionCookies, setSessionCookies } from "./cookies";

const MAX_USERNAME_LENGTH = 150;
const MAX_PASSWORD_LENGTH = 128;

function json(body: unknown, status: number): Response {
  // Per-user responses must never be cached by the browser or a CDN.
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

/** Browsers always send `Origin` on cross-site POSTs; reject any that does not match this site. Non-browser callers omit it. */
function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  return !origin || new URL(origin).host === new URL(request.url).host;
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
    return unavailable(error);
  }
}

/** `POST /api/auth/logout`: forgets the tokens. The backend has no logout endpoint, so nothing is revoked server-side. */
export async function handleLogout(request: Request): Promise<Response> {
  if (!isSameOrigin(request)) return json({ detail: "Cross-site sign-out is not allowed." }, 403);
  clearSessionCookies(await cookies());
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
