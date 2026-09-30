import type { BarBlock, DumbbellBlock, GroupedBarBlock, KpiBlock } from "./spec";

/** A dataset as the renderer reads it: column names and rows of raw cells. */
export type Table = { columns: string[]; rows: (string | number | boolean | null)[][] };

/** A block that can't be drawn from its data says why, instead of breaking the page. */
export class BlockDataError extends Error {}

/** Runs a block's computation, turning a data problem into a message the block can show; other errors still throw. */
export function attempt<T>(compute: () => T): { ok: true; value: T } | { ok: false; message: string } {
  try {
    return { ok: true, value: compute() };
  } catch (error) {
    if (!(error instanceof BlockDataError)) throw error;
    return { ok: false, message: error.message };
  }
}

function columnIndex(table: Table, column: string): number {
  const i = table.columns.indexOf(column);
  if (i < 0) throw new BlockDataError(`The column “${column}” isn't in this dataset.`);
  return i;
}

/** "54", "1,20,500", "54.7%" -> a number; anything else -> NaN. */
export function toNumber(cell: unknown): number {
  if (typeof cell === "number") return cell;
  if (typeof cell !== "string") return NaN;
  const cleaned = cell.replace(/[,%\s]/g, "");
  return cleaned === "" ? NaN : Number(cleaned);
}

function numberAt(table: Table, labelColumn: string, row: string, column: string): number {
  const li = columnIndex(table, labelColumn);
  const ci = columnIndex(table, column);
  const found = table.rows.find((r) => String(r[li]) === row);
  if (!found) throw new BlockDataError(`No row named “${row}” in this dataset.`);
  const value = toNumber(found[ci]);
  if (Number.isNaN(value)) throw new BlockDataError(`“${row}” has no number in “${column}”.`);
  return value;
}

/** Labels and numbers for one category column and one value column, skipping rows without a number. */
export function pairs(table: Table, category: string, value: string): { label: string; value: number }[] {
  const li = columnIndex(table, category);
  const vi = columnIndex(table, value);
  return table.rows
    .map((r) => ({ label: String(r[li] ?? ""), value: toNumber(r[vi]) }))
    .filter((p) => p.label !== "" && !Number.isNaN(p.value));
}

const plain = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

export type KpiResult = { value: number; display: string; detail?: string };

/** A key figure: the cell itself, or compared with another row or column of the same dataset. */
export function kpiValue(block: KpiBlock, table: Table): KpiResult {
  const base = numberAt(table, block.labelColumn, block.row, block.column);
  if (!block.compare) return { value: base, display: plain.format(base) };

  const otherRow = block.compare.row ?? block.row;
  const otherColumn = block.compare.column ?? block.column;
  const other = numberAt(table, block.labelColumn, otherRow, otherColumn);
  const against = block.compare.row ? block.compare.row : otherColumn;
  const shownAs = block.compare.label ?? block.compare.row;

  switch (block.compare.as) {
    case "difference": {
      const diff = base - other;
      return { value: diff, display: `${diff > 0 ? "+" : diff < 0 ? "−" : ""}${plain.format(Math.abs(diff))}`, detail: shownAs && `compared with ${shownAs}` };
    }
    case "percent": {
      if (other === 0) throw new BlockDataError(`Can't compare with ${against}: it is zero.`);
      const pct = ((base - other) / other) * 100;
      return {
        value: pct,
        display: `${pct > 0 ? "+" : pct < 0 ? "−" : ""}${plain.format(Math.abs(pct))}%`,
        detail: shownAs && `${pct >= 0 ? "above" : "below"} ${shownAs}`,
      };
    }
    case "ratio": {
      if (other === 0) throw new BlockDataError(`Can't divide by ${against}: it is zero.`);
      const ratio = base / other;
      return { value: ratio, display: `${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(ratio)}×`, detail: shownAs && `relative to ${shownAs}` };
    }
  }
}

export type BarSeries = { labels: string[]; values: number[]; highlighted: boolean[]; reference?: { label: string; value: number } };

/** Bars in the chosen order; the reference row is taken out of the bars and returned separately. */
export function barSeries(block: BarBlock, table: Table): BarSeries {
  let rows = pairs(table, block.category, block.value);
  let reference: BarSeries["reference"];
  if (block.reference) {
    const ref = rows.find((r) => r.label === block.reference);
    if (!ref) throw new BlockDataError(`No reference row named “${block.reference}”.`);
    reference = ref;
    rows = rows.filter((r) => r !== ref);
  }
  if (block.sort) rows = [...rows].sort((a, b) => (block.sort === "asc" ? a.value - b.value : b.value - a.value));
  const highlight = new Set(block.highlight ?? []);
  return { labels: rows.map((r) => r.label), values: rows.map((r) => r.value), highlighted: rows.map((r) => highlight.has(r.label)), reference };
}

export type GroupedSeries = { labels: string[]; series: { label: string; values: number[] }[] };

export function groupedSeries(block: GroupedBarBlock, table: Table): GroupedSeries {
  const labels = pairs(table, block.category, block.series[0].column).map((p) => p.label);
  return {
    labels,
    series: block.series.map((s) => {
      const byLabel = new Map(pairs(table, block.category, s.column).map((p) => [p.label, p.value]));
      return { label: s.label, values: labels.map((l) => byLabel.get(l) ?? NaN) };
    }),
  };
}

export type DumbbellSeries = { labels: string[]; from: number[]; to: number[]; change: number[] };

/** Rows ordered by the size of their change, largest rise first. */
export function dumbbellSeries(block: DumbbellBlock, table: Table): DumbbellSeries {
  const to = new Map(pairs(table, block.category, block.to.column).map((p) => [p.label, p.value]));
  const rows = pairs(table, block.category, block.from.column)
    .filter((p) => to.has(p.label))
    .map((p) => ({ label: p.label, from: p.value, to: to.get(p.label)!, change: to.get(p.label)! - p.value }))
    .sort((a, b) => b.change - a.change);
  return { labels: rows.map((r) => r.label), from: rows.map((r) => r.from), to: rows.map((r) => r.to), change: rows.map((r) => r.change) };
}
