import "server-only";
import { uncachedApi } from "../api/client";
import { ApiError, describeErrorBody } from "../api/errors";
import type { components } from "../api/schema";
import { displayName } from "../api/userAdapter";
import type { Role } from "../session";

/**
 * `mustChangePassword`: signed in with a temporary password an admin set; the dashboard asks for a new one first.
 * `emailVerified`: a self-registered visitor has confirmed their address; downloads need it.
 */
export type SessionUser = { id: number; email: string; role: Role; name: string; mustChangePassword: boolean; emailVerified: boolean };
export type Tokens = { access?: string; refresh?: string };
export type ResolvedSession = { user: SessionUser; access: string; accessWasRefreshed: boolean };

const TOKEN_PATH = "/api/v1/token/";
const GOOGLE_TOKEN_PATH = "/api/v1/token/google/";
const REFRESH_PATH = "/api/v1/token/refresh/";
const LOGOUT_PATH = "/api/v1/token/logout/";
const ME_PATH = "/api/v1/users/me/";
const REGISTER_PATH = "/api/v1/register/";

/** Wrong username or password (the backend answers 401 without saying which). */
export class InvalidCredentialsError extends Error {
  constructor() {
    super("Invalid credentials");
    this.name = "InvalidCredentialsError";
  }
}

/** The backend throttles sign-in attempts per username and answered 429. */
export class TooManyAttemptsError extends Error {
  constructor() {
    super("Too many sign-in attempts");
    this.name = "TooManyAttemptsError";
  }
}

// The generated request-body types wrongly include the read-only `access`/`refresh` response fields, hence the casts.
type LoginBody = components["schemas"]["TokenObtainPair"];
type RefreshBody = components["schemas"]["TokenRefresh"];
type LogoutBody = components["schemas"]["TokenBlacklist"];

export async function login(username: string, password: string): Promise<{ access: string; refresh: string }> {
  const result = await uncachedApi().POST(TOKEN_PATH, { body: { username, password } as LoginBody });
  if (result.response.status === 401) throw new InvalidCredentialsError();
  if (result.response.status === 429) throw new TooManyAttemptsError();
  if (!result.data) throw new ApiError(result.response.status, describeErrorBody(result.error), TOKEN_PATH);
  return { access: result.data.access, refresh: result.data.refresh };
}

/** Google's ID token was refused (bad, expired, another site's), or the account it matches is deactivated (401). */
export class GoogleSignInRefusedError extends Error {
  constructor() {
    super("Google sign-in refused");
    this.name = "GoogleSignInRefusedError";
  }
}

/**
 * Exchanges the ID token from "Sign in with Google" for the same token pair as a password sign-in. The backend checks
 * the token with Google and signs in the matching account, or creates a confirmed visitor account.
 */
export async function loginWithGoogle(credential: string): Promise<{ access: string; refresh: string }> {
  const result = await uncachedApi().POST(GOOGLE_TOKEN_PATH, { body: { credential } });
  if (result.response.status === 401) throw new GoogleSignInRefusedError();
  if (result.response.status === 429) throw new TooManyAttemptsError();
  if (!result.data) throw new ApiError(result.response.status, describeErrorBody(result.error), GOOGLE_TOKEN_PATH);
  return { access: result.data.access, refresh: result.data.refresh };
}

/** A new access token, or `null` when the refresh token is expired or invalid. */
export async function refreshAccess(refresh: string): Promise<string | null> {
  const result = await uncachedApi().POST(REFRESH_PATH, { body: { refresh } as RefreshBody });
  if (result.response.status === 401) return null;
  if (!result.data) throw new ApiError(result.response.status, describeErrorBody(result.error), REFRESH_PATH);
  return result.data.access;
}

/** Blacklists a refresh token on the backend. `false` when it was already invalid (401); other failures throw. */
export async function revokeRefresh(refresh: string): Promise<boolean> {
  const result = await uncachedApi().POST(LOGOUT_PATH, { body: { refresh } as LogoutBody });
  if (result.response.status === 401) return false;
  if (result.response.status !== 200) throw new ApiError(result.response.status, describeErrorBody(result.error), LOGOUT_PATH);
  return true;
}

/** The user an access token belongs to, or `null` when the token is expired or invalid. */
export async function fetchMe(access: string): Promise<SessionUser | null> {
  const result = await uncachedApi(access).GET(ME_PATH);
  if (result.response.status === 401) return null;
  if (!result.data) throw new ApiError(result.response.status, describeErrorBody(result.error), ME_PATH);
  const { id, email, role, first_name: firstName, last_name: lastName, must_change_password: mustChangePassword } = result.data;
  if (id === undefined || !email || !role) throw new ApiError(result.response.status, "Malformed profile response", ME_PATH);
  // An older backend without the field: every account then was made by an admin, so it counts as confirmed.
  const emailVerified = result.data.email_verified ?? true;
  return { id, email, role, name: displayName({ firstName, lastName, email }), mustChangePassword: !!mustChangePassword, emailVerified };
}

/** The backend refused the sign-up's fields; `fields` maps a field to its message. */
export class RegistrationError extends Error {
  constructor(readonly fields: Record<string, string>) {
    super("Registration refused");
    this.name = "RegistrationError";
  }
}

type RegisterBody = components["schemas"]["Register"];

/**
 * Creates a visitor account. Resolves the same way whether or not the address was new: the backend emails the owner
 * of an existing account instead, so this can't tell anyone who is registered.
 */
export async function register(body: RegisterBody): Promise<void> {
  const result = await uncachedApi().POST(REGISTER_PATH, { body });
  if (result.response.status === 429) throw new TooManyAttemptsError();
  if (result.response.status === 400) {
    const raw = (result.error ?? {}) as Record<string, unknown>;
    const fields = Object.fromEntries(
      Object.entries(raw).map(([key, value]) => [key, Array.isArray(value) ? String(value[0]) : String(value)]),
    );
    throw new RegistrationError(fields);
  }
  if (result.response.status !== 202) throw new ApiError(result.response.status, describeErrorBody(result.error), REGISTER_PATH);
}

/**
 * Works out who the cookies belong to: the access token if it still verifies, otherwise a fresh one minted from the
 * refresh token. `null` means signed out. Network failures propagate, so an outage is not mistaken for a sign-out.
 */
export async function resolveSession({ access, refresh }: Tokens): Promise<ResolvedSession | null> {
  if (access) {
    const user = await fetchMe(access);
    if (user) return { user, access, accessWasRefreshed: false };
  }
  if (!refresh) return null;

  const renewed = await refreshAccess(refresh);
  if (!renewed) return null;
  const user = await fetchMe(renewed);
  return user ? { user, access: renewed, accessWasRefreshed: true } : null;
}
