import type { ReactNode } from "react";
import type { GeoJsonFeatureCollection } from "../../../_lib/api/datasetAdapter";
import PlotlyChart from "../../../research/_ui/PlotlyChart";
import GeoPreview from "../../_ui/GeoPreview";
import { attempt, barSeries, dumbbellSeries, groupedSeries, kpiValue, type Table } from "../_lib/compute";
import type { Block, DashboardSpec, KpiBlock } from "../_lib/spec";
import { CHART, barFigure, dumbbellFigure, groupedFigure, type ChartFigure } from "../_lib/traces";

/** What the page loaded for each dataset the dashboard reads: a table, a map, or nothing (not available to this visitor). */
export type DashboardData = { tables: Record<string, Table | null>; maps: Record<string, GeoJsonFeatureCollection | null> };

const card = "rounded-lg border border-[#e3e6f0] bg-white";
const monoLabel = "font-[family-name:var(--font-mono)] text-[11px] font-semibold uppercase tracking-[0.1em] text-[#6f7899]";

function Notice({ children }: { children: ReactNode }) {
  return <p className="rounded-md border border-dashed border-[#d3d8e8] bg-[#fafbfd] px-4 py-6 text-center text-[13px] text-[#6f7899]">{children}</p>;
}

function ChartCard({ title, caption, full, children }: { title: string; caption?: string; full: boolean; children: ReactNode }) {
  return (
    <figure className={`${card} flex min-w-0 flex-col p-5 ${full ? "lg:col-span-2" : ""}`}>
      <figcaption className="mb-3 grid gap-1">
        <span className="text-[16px] font-semibold text-[#171a2b]">{title}</span>
        {caption && <span className="text-[13px] text-[#5b6280]">{caption}</span>}
      </figcaption>
      <div className="min-w-0">{children}</div>
    </figure>
  );
}

function Kpi({ block, table }: { block: KpiBlock; table: Table | null }) {
  const result = table ? attempt(() => kpiValue(block, table)) : null;
  return (
    <div className={`${card} grid content-start gap-2 p-5`}>
      <p className={monoLabel}>{block.label}</p>
      {!result && <p className="text-[13px] text-[#6f7899]">Data not available.</p>}
      {result && !result.ok && <p className="text-[13px] text-[#9a6412]">{result.message}</p>}
      {result?.ok && <p className="font-[family-name:var(--font-mono)] text-[34px] font-semibold leading-none tabular-nums text-[#253D9A]">{result.value.display}</p>}
      {result?.ok && (block.unit || result.value.detail) && <p className="text-[13px] text-[#4b4f66]">{[block.unit, result.value.detail].filter(Boolean).join(", ")}</p>}
      {block.note && <p className="text-[12px] leading-snug text-[#7d86a8]">{block.note}</p>}
    </div>
  );
}

function DataTable({ table }: { table: Table }) {
  return (
    <div className="max-h-[360px] overflow-auto rounded-md border border-[#edf0f6]">
      <table className="w-full border-collapse text-left">
        <thead className="sticky top-0 bg-[#fafbfd]">
          <tr>
            {table.columns.map((c) => (
              <th key={c} scope="col" className="whitespace-nowrap border-b border-[#e3e6f0] px-3 py-2 font-[family-name:var(--font-mono)] text-[11px] font-semibold text-[#4f5878]">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row, i) => (
            <tr key={i} className="even:bg-[#fafbfd]">
              {row.map((cell, j) => (
                <td key={j} className="whitespace-nowrap border-b border-[#edf0f6] px-3 py-2 font-[family-name:var(--font-mono)] text-[12.5px] tabular-nums text-[#171a2b]">
                  {cell === null ? "" : String(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Figure({ id, figure }: { id: string; figure: ChartFigure }) {
  return <PlotlyChart id={id} data={figure.data} layout={figure.layout} height={figure.height} fontFamily={CHART.body} textColor={CHART.ink} />;
}

/** One chart, map or table block, or a notice saying why it can't be drawn. */
function ChartBlock({ block, index, slug, data }: { block: Exclude<Block, KpiBlock>; index: number; slug: string; data: DashboardData }) {
  const full = block.width !== "half";
  const id = `${slug}-block-${index}`;

  if (block.type === "map") {
    const collection = data.maps[block.dataset];
    return (
      <ChartCard title={block.title} caption={block.caption} full={full}>
        {collection ? <GeoPreview collection={collection} title={block.title} /> : <Notice>The map isn&apos;t available.</Notice>}
      </ChartCard>
    );
  }

  const table = data.tables[block.dataset];
  const figure =
    !table || block.type === "table"
      ? null
      : attempt(() =>
          block.type === "bar"
            ? barFigure(barSeries(block, table), block.unit)
            : block.type === "grouped-bar"
              ? groupedFigure(groupedSeries(block, table), block.unit)
              : dumbbellFigure(dumbbellSeries(block, table), block.from.label, block.to.label, block.unit),
        );
  return (
    <ChartCard title={block.title} caption={block.caption} full={full}>
      {!table && <Notice>This dataset isn&apos;t available.</Notice>}
      {table && block.type === "table" && <DataTable table={table} />}
      {figure && !figure.ok && <Notice>{figure.message}</Notice>}
      {figure?.ok && <Figure id={id} figure={figure.value} />}
    </ChartCard>
  );
}

/** Draws any dashboard from its description: key figures in a row, then charts, maps and tables in a two-column grid. */
export default function DashboardView({ spec, data }: { spec: DashboardSpec; data: DashboardData }) {
  const kpis = spec.blocks.filter((b): b is KpiBlock => b.type === "kpi");
  const others = spec.blocks.filter((b): b is Exclude<Block, KpiBlock> => b.type !== "kpi");

  return (
    <div className="grid gap-6">
      {kpis.length > 0 && (
        <div className={`grid gap-4 sm:grid-cols-2 ${kpis.length >= 3 ? "lg:grid-cols-3" : ""}`}>
          {kpis.map((k, i) => (
            <Kpi key={i} block={k} table={data.tables[k.dataset] ?? null} />
          ))}
        </div>
      )}
      <div className="grid gap-6 lg:grid-cols-2">
        {others.map((b, i) => (
          <ChartBlock key={i} block={b} index={i} slug={spec.slug} data={data} />
        ))}
      </div>
    </div>
  );
}
