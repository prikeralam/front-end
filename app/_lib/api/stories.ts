import "server-only";
import { publicFetchCache } from "./publicCache";

/** Matches the backend's upload cap; anything larger was not uploaded through it. */
export const MAX_STORY_CHARS = 5 * 1024 * 1024;

/**
 * The text of an uploaded data story. The URL comes from the backend (presigned on S3, so it changes with each API
 * response), which is why the public read is cached per URL like other API reads (`publicCache.ts`). Throws on anything unexpected, so
 * pages can show an error in the story's place.
 */
export async function fetchStoryHtml(url: string, { fresh = false }: { fresh?: boolean } = {}): Promise<string> {
  let target: URL;
  try {
    target = new URL(url);
  } catch {
    throw new Error("The story's address is not a valid URL");
  }
  if (target.protocol !== "https:" && target.protocol !== "http:") throw new Error(`Refusing to read a story over ${target.protocol}`);

  const response = await fetch(target, fresh ? { cache: "no-store" } : publicFetchCache);
  if (!response.ok) throw new Error(`Story file request failed with ${response.status}`);
  const text = await response.text();
  if (text.length > MAX_STORY_CHARS) throw new Error("The story file is larger than the upload limit");
  return text;
}
