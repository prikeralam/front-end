import { splitLabelled } from "./api/engageAdapter";

/** Titles for the "What we do" tiles, by position, when a mission line doesn't start with its own "Title: ". */
export const DEFAULT_TILE_TITLES = ["Research", "Policy", "Advocacy", "Knowledge sharing"];

/** The mission's lines as tiles. "Title: text" sets a tile's own title; otherwise it takes the default for its place. */
export function missionTiles(lines: string[]): { title: string; text: string }[] {
  return lines.map((line, i) => {
    const { label, text } = splitLabelled(line);
    return { title: label || DEFAULT_TILE_TITLES[i] || `Focus ${i + 1}`, text };
  });
}

export type AboutCounts = { publications?: number; datasets?: number; projects?: number; events?: number };

const STAT_LABELS: { key: keyof AboutCounts; one: string; many: string }[] = [
  { key: "publications", one: "Publication", many: "Publications" },
  { key: "datasets", one: "Dataset", many: "Datasets" },
  { key: "projects", one: "Research project", many: "Research projects" },
  { key: "events", one: "Event & campaign", many: "Events & campaigns" },
];

/** The figures for "By the numbers": only those that loaded and are above zero, so the row never shows a gap or a 0. */
export function aboutStats(counts: AboutCounts): { value: number; label: string }[] {
  return STAT_LABELS.flatMap(({ key, one, many }) => {
    const value = counts[key];
    return value && value > 0 ? [{ value, label: value === 1 ? one : many }] : [];
  });
}
