import "server-only";
import { api } from "./client";
import { ApiError } from "./errors";
import { unwrap } from "./request";

export type ContentBlock = { slug: string; title: string; body: string };

const BLOCK_PATH = "/api/v1/content-blocks/{slug}/";

/** One published content block by slug, or null when it doesn't exist or isn't published yet (404). */
export async function getContentBlock(slug: string): Promise<ContentBlock | null> {
  try {
    const block = unwrap(await api.GET(BLOCK_PATH, { params: { path: { slug } } }), BLOCK_PATH);
    return { slug: block.slug, title: block.title, body: block.body };
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}
