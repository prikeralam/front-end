import Link from "next/link";
import type { DatasetPreviews } from "../../_lib/api/datasets";
import type { DatasetSummary } from "../../_lib/datasetTypes";

const MAX_ROWS = 5;
const MAX_COLUMNS = 5;
const numberFormat = new Intl.NumberFormat("en-IN");

/** One dataset shown the way it really is: a window onto its first rows, with its shape and a way in. */
export default function FeaturedDataset({ dataset: d, table }: { dataset: DatasetSummary; table: NonNullable<DatasetPreviews["table"]> }) {
  const columns = table.columns.slice(0, MAX_COLUMNS);
  const rows = table.rows.slice(0, MAX_ROWS).map((row) => row.slice(0, MAX_COLUMNS));
  const facts = [
    d.rowCount !== undefined && ["Rows", numberFormat.format(d.rowCount)],
    d.columnCount !== undefined && ["Columns", String(d.columnCount)],
    (d.timePeriod ?? d.year) && ["Period", d.timePeriod ?? d.year],
  ].filter((f): f is [string, string] => Boolean(f));

  return (
    <figure className="overflow-hidden rounded-lg border border-[#e3e6f0] bg-white shadow-[0_24px_48px_-24px_rgba(23,26,43,0.35)]">
      <div className="flex items-center gap-2 border-b border-[#e3e6f0] bg-[#f3f5fa] px-4 py-2.5">
        <span aria-hidden="true" className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#d9ddea]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#d9ddea]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#d9ddea]" />
        </span>
        <span className="ml-2 font-[family-name:var(--font-mono)] text-[11px] font-semibold uppercase tracking-[0.1em] text-[#6f7899]">Featured dataset</span>
      </div>
      <figcaption className="grid gap-2 px-5 pb-3 pt-4">
        <p className="text-[16px] font-semibold leading-snug text-[#171a2b]">{d.title}</p>
        {facts.length > 0 && (
          <dl className="flex flex-wrap gap-x-5 gap-y-1 font-[family-name:var(--font-mono)] text-[11.5px] text-[#6f7899]">
            {facts.map(([label, value]) => (
              <div key={label} className="flex gap-1.5">
                <dt>{label}:</dt>
                <dd className="font-semibold text-[#253D9A]">{value}</dd>
              </div>
            ))}
          </dl>
        )}
      </figcaption>
      <div className="overflow-x-auto border-t border-[#e3e6f0]">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr>
              {columns.map((c) => (
                <th key={c} scope="col" className="whitespace-nowrap border-b border-[#e3e6f0] bg-[#fafbfd] px-3 py-2 font-[family-name:var(--font-mono)] text-[11px] font-semibold text-[#4f5878]">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="even:bg-[#fafbfd]">
                {row.map((cell, j) => (
                  <td key={j} className="whitespace-nowrap border-b border-[#edf0f6] px-3 py-2 font-[family-name:var(--font-mono)] text-[12px] tabular-nums text-[#171a2b]">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between gap-3 px-5 py-3">
        <span className="text-[12px] text-[#6f7899]">
          {d.rowCount !== undefined ? `First ${rows.length} of ${numberFormat.format(d.rowCount)} rows` : `First ${rows.length} rows`}
          {table.columns.length > MAX_COLUMNS && `, ${MAX_COLUMNS} of ${table.columns.length} columns`}
        </span>
        <Link href={`/data/${d.slug}`} className="inline-flex items-center gap-1 text-[13.5px] font-semibold text-[#253D9A] hover:underline">
          Explore dataset <span aria-hidden="true">&rarr;</span>
        </Link>
      </div>
    </figure>
  );
}
