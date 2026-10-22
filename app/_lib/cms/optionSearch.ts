import type { FieldOption } from "./types";

/** Case-insensitive match on an option's label or value (a dataset's label carries its catalog ID and title, its value the slug). */
export function optionMatches(option: FieldOption, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return option.label.toLowerCase().includes(q) || option.value.toLowerCase().includes(q);
}
