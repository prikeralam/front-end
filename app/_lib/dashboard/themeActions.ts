"use server";

import { backendListAll, backendRequest, type BackendResult } from "../api/backendRequest";
import { refreshPublicPages } from "../api/publicCache";
import { getAccessToken } from "../auth/serverAuth";
import { SLUG_PATTERN, THEME_LIMITS, buildThemeTree, type ApiTheme, type ThemeNode } from "./themeTree";

// Themes and sub-themes (backend taxonomy). Everyone may read them; editors and admins create and edit them, and the
// backend answers 403 to anyone else. Arguments are validated because Server Actions are public POST endpoints.

const PATH = "/api/v1/themes/";
const MAX_ID = 2 ** 31;

export type ThemeList = { status: "ok"; themes: ThemeNode[] } | { status: "signed-out" | "forbidden" | "error" };
export type ThemeMutation = { ok: true } | { ok: false; error: string };
export type ThemeInput = { name: string; slug: string; description: string; parentId?: number | null };

const signedOut = "Your session has ended. Please sign in again.";
const isId = (value: unknown): value is number => Number.isInteger(value) && (value as number) > 0 && (value as number) < MAX_ID;

function failure(result: BackendResult): ThemeMutation {
  if (result.status === 401) return { ok: false, error: signedOut };
  if (result.status === 403) return { ok: false, error: "Only editors and admins can manage themes." };
  if (result.status === 404) return { ok: false, error: "That theme no longer exists." };
  if (result.status === 400) return { ok: false, error: result.message || "The server rejected that." };
  return { ok: false, error: "Something went wrong on the server. Please try again." };
}

/** Checks the text fields; returns the cleaned values or the first problem in plain words. */
function clean(input: { name?: unknown; slug?: unknown; description?: unknown }, withSlug: boolean) {
  const name = typeof input.name === "string" ? input.name.trim() : "";
  const description = typeof input.description === "string" ? input.description.trim() : "";
  const slug = typeof input.slug === "string" ? input.slug.trim() : "";
  if (!name) return { error: "Give it a name." };
  if (name.length > THEME_LIMITS.name) return { error: `Keep the name to ${THEME_LIMITS.name} characters.` };
  if (description.length > THEME_LIMITS.description) return { error: `Keep the description to ${THEME_LIMITS.description} characters.` };
  if (withSlug && (!SLUG_PATTERN.test(slug) || slug.length > THEME_LIMITS.slug)) {
    return { error: "The slug may use lowercase letters, numbers and single dashes (e.g. school-education)." };
  }
  return { name, slug, description };
}

/** Every theme with its sub-themes, read fresh (not from the public page cache). */
export async function listThemesAction(): Promise<ThemeList> {
  const accessToken = await getAccessToken();
  if (!accessToken) return { status: "signed-out" };
  const result = await backendListAll(PATH, accessToken);
  if (!result.ok) return result.status === 401 ? { status: "signed-out" } : result.status === 403 ? { status: "forbidden" } : { status: "error" };
  return { status: "ok", themes: buildThemeTree(result.items as unknown as ApiTheme[]) };
}

/** A top-level theme, or a sub-theme when `parentId` names a top-level theme. */
export async function createThemeAction(input: ThemeInput): Promise<ThemeMutation> {
  if (!input || typeof input !== "object") return { ok: false, error: "That request isn't valid." };
  const parentId = input.parentId ?? null;
  if (parentId !== null && !isId(parentId)) return { ok: false, error: "That theme no longer exists." };
  const values = clean(input, true);
  if ("error" in values) return { ok: false, error: values.error as string };

  const accessToken = await getAccessToken();
  if (!accessToken) return { ok: false, error: signedOut };
  const path = parentId === null ? PATH : `${PATH}${parentId}/subthemes/`;
  const result = await backendRequest("POST", path, { accessToken, json: values });
  if (!result.ok) return failure(result);
  refreshPublicPages();
  return { ok: true };
}

/** Renames a theme or sub-theme, or changes its description. Slugs stay as created: public URLs use them. */
export async function updateThemeAction(id: number, input: { name: string; description: string }): Promise<ThemeMutation> {
  if (!isId(id) || !input || typeof input !== "object") return { ok: false, error: "That request isn't valid." };
  const values = clean(input, false);
  if ("error" in values) return { ok: false, error: values.error as string };

  const accessToken = await getAccessToken();
  if (!accessToken) return { ok: false, error: signedOut };
  const result = await backendRequest("PATCH", `${PATH}${id}/`, { accessToken, json: { name: values.name, description: values.description } });
  if (!result.ok) return failure(result);
  refreshPublicPages();
  return { ok: true };
}
