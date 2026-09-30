/**
 * What a dashboard is: a description the renderer draws, not code. Every block names the dataset (by slug) and the
 * columns it reads, so new dashboards need no new code. Today the descriptions live in `specs.ts`; later they move
 * into the backend as dashboard records, with access levels, in this same shape.
 */

/** How a key figure is worked out from its row: the value itself, or compared with another row or column. */
export type Comparison = {
  /** Another row of the same column (e.g. the state average), or another column of the same row. */
  row?: string;
  column?: string;
  /** `difference`: value − other; `percent`: how far above or below other, in %; `ratio`: value ÷ other. */
  as: "difference" | "percent" | "ratio";
  /** How the other value reads to a visitor, e.g. "the Kerala average". Defaults to the row's name; a column compare
   * without a label shows no detail, since column names aren't written for people. */
  label?: string;
};

export type KpiBlock = {
  type: "kpi";
  label: string;
  dataset: string;
  /** The column that names each row (e.g. `district`) and the row to read (e.g. `Malappuram`). */
  labelColumn: string;
  row: string;
  column: string;
  compare?: Comparison;
  /** Shown after the number, e.g. "students", "percentage points". */
  unit?: string;
  note?: string;
};

type ChartBase = { dataset: string; title: string; caption?: string; width?: "full" | "half" };

/** One bar per row. A `reference` row becomes a dashed line instead of a bar; `highlight` rows get the accent colour. */
export type BarBlock = ChartBase & {
  type: "bar";
  category: string;
  value: string;
  reference?: string;
  highlight?: string[];
  unit?: string;
  sort?: "asc" | "desc";
};

/** Several columns side by side for each row (e.g. share of population vs share of emigrants). */
export type GroupedBarBlock = ChartBase & {
  type: "grouped-bar";
  category: string;
  series: { column: string; label: string }[];
  unit?: string;
};

/** Before and after for each row, joined by a line (e.g. 2011 → 2024). */
export type DumbbellBlock = ChartBase & {
  type: "dumbbell";
  category: string;
  from: { column: string; label: string };
  to: { column: string; label: string };
  unit?: string;
};

/** A GeoJSON dataset drawn as a map. */
export type MapBlock = ChartBase & { type: "map" };

/** The dataset's rows as a table. */
export type TableBlock = ChartBase & { type: "table" };

export type Block = KpiBlock | BarBlock | GroupedBarBlock | DumbbellBlock | MapBlock | TableBlock;

export type DashboardSpec = {
  slug: string;
  title: string;
  theme: string;
  /** The one-line finding, in plain words. */
  headline: string;
  summary: string;
  /** The data story this dashboard belongs to, if any (publication slug). */
  story?: string;
  status: "prototype" | "published";
  /** Who may see it. Public only for now; researcher-only and other levels come with the backend records. */
  audience: "public";
  blocks: Block[];
};

/** Every dataset a dashboard reads, once each. */
export function datasetsOf(spec: DashboardSpec): string[] {
  return [...new Set(spec.blocks.map((b) => b.dataset))];
}
