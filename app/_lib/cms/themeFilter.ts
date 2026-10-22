import type { CmsRecord, FieldOption } from "./types";

/**
 * The top-level theme of a record with a sub-theme field, read from the sub-theme options ("Education › School
 * Education" -> "Education"). Empty when the record has no sub-theme or the options haven't loaded.
 */
export function themeOf(record: CmsRecord, fieldKey: string, subThemes: FieldOption[] | undefined): string {
  const id = record.values[fieldKey];
  const label = id ? subThemes?.find((o) => o.value === id)?.label : undefined;
  return label ? label.split(" › ")[0].trim() : "";
}

/** The themes present among the records, sorted, for filter chips. */
export function themesOf(records: CmsRecord[], fieldKey: string, subThemes: FieldOption[] | undefined): string[] {
  return [...new Set(records.map((r) => themeOf(r, fieldKey, subThemes)).filter(Boolean))].sort();
}
