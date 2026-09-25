import "server-only";
import { api } from "./client";
import { collectAllPages } from "./pagination";
import { unwrap } from "./request";

const THEMES_PATH = "/api/v1/themes/";

/** All themes (top-level ones nest their sub-themes). Reference data, readable without a token. */
export async function listThemes() {
  return collectAllPages(async (page) => unwrap(await api.GET(THEMES_PATH, { params: { query: { page } } }), THEMES_PATH));
}
