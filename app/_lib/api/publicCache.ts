import "server-only";
import { updateTag } from "next/cache";

/**
 * Public pages cache what they read from the API, so the backend isn't asked again for every visitor. Edits made in
 * the dashboard expire that cache at once (`refreshPublicPages`, called by the Server Actions that change public
 * content), so editors see their changes on the next page load. The timer only matters for changes made elsewhere,
 * such as the Django admin.
 */
export const PUBLIC_REVALIDATE_SECONDS = 60;
export const PUBLIC_API_TAG = "public-api";

export const publicFetchCache = { next: { revalidate: PUBLIC_REVALIDATE_SECONDS, tags: [PUBLIC_API_TAG] } };

/** Expires every cached public API read. Only callable from a Server Action. */
export function refreshPublicPages() {
  updateTag(PUBLIC_API_TAG);
}
