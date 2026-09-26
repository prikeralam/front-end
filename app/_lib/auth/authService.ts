import "server-only";
import { uncachedApi } from "../api/client";
import { ApiError, describeErrorBody } from "../api/errors";
import type { components } from "../api/schema";
import type { Role } from "../session";

export type SessionUser = { id: number; email: string; role: Role; name: string };
export type Tokens = { access?: string; refresh?: string };
export type ResolvedSession = { user: SessionUser; access: string; accessWasRefreshed: boolean };

const TOKEN_PATH = "/api/v1/token/";
const REFRESH_PATH = "/api/v1/token/refresh/";
const LOGOUT_PATH = "/api/v1/token/logout/";
const ROLE_PATH = "/api/v1/users/me/role/";

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

/** The backend has no display name; the local part of the email stands in for one. */
function displayName(email: string): string {
  return email.split("@")[0] || email;
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
  const result = await uncachedApi(access).GET(ROLE_PATH);
  if (result.response.status === 401) return null;
  if (!result.data) throw new ApiError(result.response.status, describeErrorBody(result.error), ROLE_PATH);
  const { id, email, role } = result.data;
  if (id === undefined || !email || !role) throw new ApiError(result.response.status, "Malformed role response", ROLE_PATH);
  return { id, email, role, name: displayName(email) };
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
