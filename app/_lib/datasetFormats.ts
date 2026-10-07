/** File formats a dataset's files can be in, as the backend names them, with the extensions each accepts. */
export const DATASET_FORMATS = [
  { code: "csv", label: "CSV", extensions: [".csv"], note: "previewed as a table" },
  { code: "parquet", label: "Parquet", extensions: [".parquet"], note: "previewed as a table" },
  { code: "zip", label: "ZIP", extensions: [".zip"], note: "the first CSV inside is previewed" },
  { code: "geojson", label: "GeoJSON", extensions: [".geojson", ".json"], note: "previewed as a map" },
  { code: "json", label: "JSON", extensions: [".json"], note: "download only" },
  { code: "xlsx", label: "Excel", extensions: [".xlsx"], note: "download only" },
] as const;

export type DatasetFormatCode = (typeof DATASET_FORMATS)[number]["code"];

export const isDatasetFormat = (value: unknown): value is DatasetFormatCode => DATASET_FORMATS.some((f) => f.code === value);

/** Every extension any format accepts, for a file picker's `accept`. */
export const ALL_DATASET_EXTENSIONS = Array.from(new Set(DATASET_FORMATS.flatMap((f) => f.extensions))).join(",");

/** Whether a file name fits the chosen format, e.g. "data.json" for "json". */
export function fileFitsFormat(name: string, format: DatasetFormatCode): boolean {
  const extension = /\.[^.]+$/.exec(name.toLowerCase())?.[0] ?? "";
  return (DATASET_FORMATS.find((f) => f.code === format)?.extensions as readonly string[] | undefined)?.includes(extension) ?? false;
}
