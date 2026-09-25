import "server-only";
import createClient from "openapi-fetch";
import type { paths } from "./schema";

const DEFAULT_API_URL = "http://localhost:8000";
const REVALIDATE_SECONDS = 300;

/** Base URL of the Django backend, without the `/api/v1` prefix (the schema's paths already include it). */
export function apiBaseUrl(): string {
  return (process.env.API_URL ?? DEFAULT_API_URL).replace(/\/+$/, "");
}

/** Server-side, unauthenticated client. Public pages read published content only, so no token is sent. */
export const api = createClient<paths>({
  baseUrl: apiBaseUrl(),
  // Public content changes rarely; let Next cache responses and refresh them in the background.
  fetch: (request) => fetch(request, { next: { revalidate: REVALIDATE_SECONDS } }),
});
