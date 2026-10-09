import "server-only";
import { connection } from "next/server";
import createClient from "openapi-fetch";
import { publicFetchCache } from "./publicCache";
import type { paths } from "./schema";

const DEFAULT_API_URL = "http://localhost:8000";

/** Base URL of the Django backend, without the `/api/v1` prefix (the schema's paths already include it). */
export function apiBaseUrl(): string {
  return (process.env.API_URL ?? DEFAULT_API_URL).replace(/\/+$/, "");
}

/** Server-side, unauthenticated client. Public pages read published content only, so no token is sent. */
export const api = createClient<paths>({
  baseUrl: apiBaseUrl(),
  // Render pages that read the API per request, never at build time: the image is built with no backend reachable
  // and promoted from staging to production, so a build-time render would bake in an error state or staging data.
  // Responses are still cached (see publicCache.ts): dashboard edits expire them at once, otherwise after a minute.
  fetch: async (request) => {
    await connection();
    return fetch(request, publicFetchCache);
  },
});

/**
 * Client for calls made on behalf of a signed-in user (or the login endpoints themselves). Never cached: responses
 * depend on who is asking, and the Next data cache must not serve one user's response to another.
 */
export function uncachedApi(accessToken?: string) {
  return createClient<paths>({
    baseUrl: apiBaseUrl(),
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
    // Next's patched `fetch` drops a Request's body when it is also given an init object, so the request is rebuilt
    // explicitly. Without this, every POST reaches the backend empty.
    fetch: async (request) => {
      const hasBody = request.method !== "GET" && request.method !== "HEAD";
      return fetch(request.url, {
        method: request.method,
        headers: request.headers,
        body: hasBody ? await request.text() : undefined,
        cache: "no-store",
      });
    },
  });
}
