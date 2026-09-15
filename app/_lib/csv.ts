import fs from "node:fs";
import path from "node:path";

/** Server-only: reads the header row of a CSV under /public. Never import this from a "use client" file. */
export function readCsvColumns(publicPath: string): string[] {
  try {
    const filePath = path.join(process.cwd(), "public", publicPath);
    const firstLine = fs.readFileSync(filePath, "utf-8").split(/\r?\n/)[0];
    return firstLine.split(",").map((c) => c.trim()).filter(Boolean);
  } catch {
    return [];
  }
}

export type CsvPreview = { columns: string[]; rows: string[][] };

/** Server-only: reads the header row plus a few sample data rows of a CSV under /public. */
export function readCsvPreview(publicPath: string, maxRows = 5): CsvPreview {
  try {
    const filePath = path.join(process.cwd(), "public", publicPath);
    return parseCsvPreview(fs.readFileSync(filePath, "utf-8"), maxRows);
  } catch {
    return { columns: [], rows: [] };
  }
}

/** Parses the header row plus a few sample rows out of raw CSV text (e.g.
 * fetched from a CKAN resource URL) — same shape as readCsvPreview, for
 * data that isn't a local /public file. */
export function parseCsvPreview(text: string, maxRows = 5): CsvPreview {
  const lines = text.split(/\r?\n/).filter(Boolean);
  const columns = (lines[0] ?? "").split(",").map((c) => c.trim());
  const rows = lines.slice(1, 1 + maxRows).map((line) => line.split(","));
  return { columns, rows };
}
