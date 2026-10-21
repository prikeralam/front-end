/**
 * The theme taxonomy as the Themes screen shows it: top-level themes, each with its sub-themes. Pure and
 * dependency-free so it can be unit tested; `themeActions.ts` does the I/O.
 */

/** A theme as `GET /api/v1/themes/` lists it (sub-themes are listed too, with their `parent`). */
export type ApiTheme = { id: number; slug: string; name: string; description?: string; parent?: number | null };

export type SubThemeNode = { id: number; slug: string; name: string; description: string };
export type ThemeNode = SubThemeNode & { subthemes: SubThemeNode[] };

const byName = (a: { name: string }, b: { name: string }) => a.name.localeCompare(b.name);

/** Top-level themes in name order, each with its sub-themes in name order. */
export function buildThemeTree(themes: ApiTheme[]): ThemeNode[] {
  const node = (t: ApiTheme): SubThemeNode => ({ id: t.id, slug: t.slug, name: t.name, description: t.description ?? "" });
  const children = new Map<number, SubThemeNode[]>();
  for (const t of themes) {
    if (t.parent == null) continue;
    children.set(t.parent, [...(children.get(t.parent) ?? []), node(t)]);
  }
  return themes
    .filter((t) => t.parent == null)
    .map((t) => ({ ...node(t), subthemes: (children.get(t.id) ?? []).sort(byName) }))
    .sort(byName);
}

/** A URL slug from a name: "Higher Secondary" -> "higher-secondary". */
export function slugify(name: string): string {
  return name
    .normalize("NFKD")
    .replace(/\p{M}+/gu, "") // accents split off by NFKD: "É" -> "E"
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50)
    .replace(/-+$/, "");
}

export const THEME_LIMITS = { name: 50, slug: 50, description: 2000 } as const;
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
