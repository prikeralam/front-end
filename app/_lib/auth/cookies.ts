import { secondsUntilExpiry } from "./jwt";

export const ACCESS_COOKIE = "pri_access";
export const REFRESH_COOKIE = "pri_refresh";

/** Fallbacks match SimpleJWT's defaults, used only if a token carries no readable expiry. */
const DEFAULT_ACCESS_SECONDS = 5 * 60;
const DEFAULT_REFRESH_SECONDS = 24 * 60 * 60;

type CookieOptions = { httpOnly: boolean; sameSite: "lax"; secure: boolean; path: string; maxAge: number };

/** The slice of Next's cookie store these helpers need, so they can be tested without a request. */
export type CookieWriter = {
  set(name: string, value: string, options: CookieOptions): unknown;
  delete(name: string): unknown;
};

function options(token: string, fallbackSeconds: number): CookieOptions {
  return {
    // Tokens are never readable from page scripts: only the route handlers and the backend see them.
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: secondsUntilExpiry(token) ?? fallbackSeconds,
  };
}

export function setSessionCookies(store: CookieWriter, tokens: { access: string; refresh?: string }): void {
  store.set(ACCESS_COOKIE, tokens.access, options(tokens.access, DEFAULT_ACCESS_SECONDS));
  if (tokens.refresh) store.set(REFRESH_COOKIE, tokens.refresh, options(tokens.refresh, DEFAULT_REFRESH_SECONDS));
}

export function clearSessionCookies(store: CookieWriter): void {
  store.delete(ACCESS_COOKIE);
  store.delete(REFRESH_COOKIE);
}
