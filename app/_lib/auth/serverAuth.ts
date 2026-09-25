import "server-only";
import { cookies } from "next/headers";
import { resolveSession } from "./authService";
import { ACCESS_COOKIE, REFRESH_COOKIE, setSessionCookies } from "./cookies";

/**
 * The signed-in user's access token for server components and Server Actions, or `null` when signed out. An expired
 * access token is renewed from the refresh token; the renewed token is stored when the context allows writing cookies
 * (Server Actions and route handlers do, plain page renders do not, and then it is simply renewed again next time).
 * Network failures propagate so an outage is not mistaken for a sign-out.
 */
export async function getAccessToken(): Promise<string | null> {
  const store = await cookies();
  const session = await resolveSession({ access: store.get(ACCESS_COOKIE)?.value, refresh: store.get(REFRESH_COOKIE)?.value });
  if (!session) return null;

  if (session.accessWasRefreshed) {
    try {
      setSessionCookies(store, { access: session.access });
    } catch {
      // Cookies are read-only while rendering a page; the token still works for this request.
    }
  }
  return session.access;
}
