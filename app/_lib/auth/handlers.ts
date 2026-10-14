import "server-only";
import { cookies } from "next/headers";
import { createRateLimiter } from "../rateLimit";
import { safeNext, splitName, validateSignup, type Purpose } from "../signup";
import {
  InvalidCredentialsError,
  RegistrationError,
  TooManyAttemptsError,
  login,
  register,
  resolveSession,
  revokeRefresh,
} from "./authService";
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

// Every sign-up reaches the backend from this server, so the per-visitor limit is kept here, by the IP nginx forwards.
const signupsPerVisitor = createRateLimiter({ limit: 5, windowMs: 60 * 60 * 1000 });

function visitorIp(request: Request): string {
  return request.headers.get("x-real-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

// The backend's field names, as the sign-up form calls them.
const FORM_FIELD: Record<string, string> = { first_name: "name", last_name: "name", email: "email", password: "password", organisation: "organisation", purpose: "purpose" };

/**
 * `POST /api/auth/signup`: creates a visitor account and signs the visitor in, so they come back to the page signed in
 * (downloads still wait for the emailed confirmation link). If the address already had an account, the backend emails
 * its owner instead and signing in fails; that answers 202 with the same "check your inbox" message as a new account,
 * so the form never reveals who is registered.
 */
export async function handleSignup(request: Request): Promise<Response> {
  if (!isSameOrigin(request)) return json({ detail: "Cross-site sign-up is not allowed." }, 403);
  if (!signupsPerVisitor(visitorIp(request))) return json({ detail: "Too many sign-ups from here. Try again in an hour." }, 429);

  const body: unknown = await request.json().catch(() => null);
  const input = (body && typeof body === "object" ? body : {}) as Record<string, unknown>;
  const errors = validateSignup({ ...input, terms: input.terms });
  if (Object.keys(errors).length > 0) return json({ fields: errors }, 400);

  const email = String(input.email).trim().toLowerCase();
  const password = String(input.password);
  try {
    await register({
      email,
      password,
      ...splitName(String(input.name)),
      organisation: typeof input.organisation === "string" ? input.organisation.trim() : "",
      purpose: input.purpose as Purpose,
      newsletter_opt_in: input.newsletter === true,
      next: safeNext(input.next),
    });
  } catch (error) {
    if (error instanceof RegistrationError) {
      const fields: Record<string, string> = {};
      for (const [key, message] of Object.entries(error.fields)) fields[FORM_FIELD[key] ?? "form"] ??= message;
      return json({ fields }, 400);
    }
    if (error instanceof TooManyAttemptsError) return json({ detail: "Too many sign-ups for this address. Try again in an hour." }, 429);
    return unavailable(error);
  }

  try {
    const tokens = await login(email, password);
    const session = await resolveSession({ access: tokens.access });
    if (!session) return unavailable(new Error("A freshly issued token was rejected"));
    setSessionCookies(await cookies(), tokens);
    return json({ user: session.user }, 201);
  } catch (error) {
    // An address that already had an account (with another password): its owner has been emailed.
    if (error instanceof InvalidCredentialsError || error instanceof TooManyAttemptsError) return json({ pending: true }, 202);
    return unavailable(error);
  }
}
