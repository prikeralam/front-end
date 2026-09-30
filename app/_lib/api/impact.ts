import "server-only";
import { api } from "./client";
import { toCollection, toMention, toRecognition, type Collection, type Mention, type Recognition } from "./impactAdapter";
import { collectAllPages } from "./pagination";
import { unwrap } from "./request";

const MENTIONS_PATH = "/api/v1/mentions/";
const RECOGNITION_PATH = "/api/v1/recognition/";
const COLLECTIONS_PATH = "/api/v1/collections/";
const COLLECTION_PATH = "/api/v1/collections/{slug}/";

/** Published mentions, newest first (the API's order). */
export async function listMentions(): Promise<Mention[]> {
  const items = await collectAllPages(async (page) => unwrap(await api.GET(MENTIONS_PATH, { params: { query: { page } } }), MENTIONS_PATH));
  return items.map(toMention);
}

/** Published recognition, newest year first (the API's order). */
export async function listRecognition(): Promise<Recognition[]> {
  const items = await collectAllPages(async (page) => unwrap(await api.GET(RECOGNITION_PATH, { params: { query: { page } } }), RECOGNITION_PATH));
  return items.map(toRecognition);
}

/** Published collections, oldest first. */
export async function listCollections(): Promise<Collection[]> {
  const items = await collectAllPages(async (page) => unwrap(await api.GET(COLLECTIONS_PATH, { params: { query: { page } } }), COLLECTIONS_PATH));
  return items.sort((a, b) => a.id - b.id).map(toCollection);
}

/** One published collection, or null when it doesn't exist or isn't published. */
export async function getCollection(slug: string): Promise<Collection | null> {
  const result = await api.GET(COLLECTION_PATH, { params: { path: { slug } } });
  if (result.response.status === 404) return null;
  return toCollection(unwrap(result, COLLECTION_PATH));
}
