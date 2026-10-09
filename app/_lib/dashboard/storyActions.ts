"use server";

import { backendRequest } from "../api/backendRequest";
import { refreshPublicPages } from "../api/publicCache";
import { fetchStoryHtml } from "../api/stories";
import { getAccessToken } from "../auth/serverAuth";
import { KEY_PATTERN, objectPath } from "../cms/resources";
import { storyWarnings } from "../storyFrame";

// Server Actions are public POST endpoints: the slug is validated here and the backend decides who may read a draft
// or change it, using the caller's own token.

export type StoryPreview =
  | { status: "none" }
  | { status: "ok"; html: string; warnings: string[] }
  | { status: "error"; message: string };

const signedOut = "Your session has ended. Please sign in again.";

/** A publication's uploaded story as the signed-in user may see it, so a draft can be checked before it is published. */
export async function getStoryPreviewAction(slug: string): Promise<StoryPreview> {
  if (typeof slug !== "string" || !KEY_PATTERN.test(slug)) return { status: "error", message: "That request isn't valid." };
  const accessToken = await getAccessToken();
  if (!accessToken) return { status: "error", message: signedOut };

  const result = await backendRequest("GET", objectPath("publication", slug), { accessToken });
  if (!result.ok) return { status: "error", message: result.status === 404 ? "That publication no longer exists." : "We couldn't load this publication." };
  const url = (result.data as { story_html?: string | null } | null)?.story_html;
  if (!url) return { status: "none" };

  try {
    const html = await fetchStoryHtml(url, { fresh: true });
    return { status: "ok", html, warnings: storyWarnings(html) };
  } catch {
    return { status: "error", message: "The story file is attached but couldn't be read." };
  }
}

/** Detaches the story file; the page then falls back to the abstract. */
export async function removeStoryAction(slug: string): Promise<{ ok: true } | { ok: false; message: string }> {
  if (typeof slug !== "string" || !KEY_PATTERN.test(slug)) return { ok: false, message: "That request isn't valid." };
  const accessToken = await getAccessToken();
  if (!accessToken) return { ok: false, message: signedOut };

  // Multipart, because the backend reads an empty file field as "remove".
  const form = new FormData();
  form.append("story_html", "");
  const result = await backendRequest("PATCH", objectPath("publication", slug), { accessToken, form });
  if (result.ok) {
    refreshPublicPages();
    return { ok: true };
  }
  return { ok: false, message: result.status === 403 ? "Your role isn't allowed to do that." : result.message || "We couldn't remove the story file." };
}
