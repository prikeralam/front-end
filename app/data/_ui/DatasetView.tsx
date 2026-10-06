import type { ReactNode } from "react";
import type { DatasetPreviews } from "../../_lib/api/datasets";
import type { DatasetDetail } from "../../_lib/datasetTypes";
import CitationBlock from "./CitationBlock";
import DatasetTabs from "./DatasetTabs";
import GeoPreview from "./GeoPreview";

const numberFormat = new Intl.NumberFormat("en-IN");

const label = "font-[family-name:var(--font-mono)] text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6f7899]";

/**
 * The dataset's description, key facts, and Preview / Metadata / Columns / Citation tabs, shared by the public page
 * and the signed-in dashboard page.
 */
export default function DatasetView({ ds, previews, access }: { ds: DatasetDetail; previews: DatasetPreviews; access: ReactNode }) {
  const facts = [
    ["Rows", ds.rowCount !== undefined ? numberFormat.format(ds.rowCount) : undefined],
    ["Columns", ds.columnCount !== undefined ? String(ds.columnCount) : undefined],
    ["Time period", ds.timePeriod ?? ds.year],
    ["Last updated", ds.lastUpdated],
  ].filter((f): f is [string, string] => Boolean(f[1]));

  const previewTab = (
    <div className="space-y-8">
      {previews.map && <GeoPreview collection={previews.map} title={ds.title} />}
      {previews.table && (
        <div className="overflow-hidden rounded-lg border border-[#e3e6f0] bg-white">
          <p className="border-b border-[#e3e6f0] px-4 py-2.5 text-[12.5px] text-[#5b6280]">
            {ds.rowCount === undefined
              ? `The first ${previews.table.rows.length} rows`
              : ds.rowCount > previews.table.rows.length
                ? `The first ${previews.table.rows.length} of ${numberFormat.format(ds.rowCount)} rows`
                : `All ${numberFormat.format(ds.rowCount)} rows`}
          </p>
          <div className="max-h-[520px] overflow-auto">
            <table className="w-full border-collapse text-left">
              <thead className="sticky top-0 bg-[#fafbfd]">
                <tr>
                  {previews.table.columns.map((c) => (
                    <th key={c} scope="col" className="whitespace-nowrap border-b border-[#e3e6f0] px-3 py-2 font-[family-name:var(--font-mono)] text-[11px] font-semibold text-[#4f5878]">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previews.table.rows.map((row, i) => (
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
        </div>
      )}
      {!previews.map && !previews.table && <p className="text-[13.5px] text-[#6f7899]">A preview isn&apos;t available for this dataset.</p>}
    </div>
  );

  const metadataTab = (
    <dl className="grid gap-3 sm:grid-cols-2">
      {[
        ["Theme", ds.theme],
        ["Source", ds.source],
        ["Geography", ds.geography],
        ["Granularity", ds.granularity],
        ["Time period", ds.timePeriod ?? ds.year],
        ["Update frequency", ds.frequency],
        ["File format", ds.fileFormat],
        ["Last updated", ds.lastUpdated],
      ].map(([name, value]) => (
        <div key={name} className="rounded-lg border border-[#e3e6f0] bg-white px-4 py-3">
          <dt className={label}>{name}</dt>
          <dd className="mt-1 text-[15px] text-[#171a2b]">{value ?? "To be confirmed"}</dd>
        </div>
      ))}
    </dl>
  );

  const columnsTab =
    ds.columns.length > 0 ? (
      <div>
        <p className="mb-3 text-[13.5px] text-[#5b6280]">
          {ds.columns.length} {ds.columns.length === 1 ? "column" : "columns"}, in file order.
        </p>
        <ol className="grid gap-px overflow-hidden rounded-lg border border-[#e3e6f0] bg-[#e3e6f0] sm:grid-cols-2">
          {ds.columns.map((column, i) => (
            <li key={`${column}-${i}`} className="flex items-center gap-3 bg-white px-4 py-2.5">
              <span className="w-6 shrink-0 text-right font-[family-name:var(--font-mono)] text-[11px] text-[#8b93b3]">{i + 1}</span>
              <code className="break-all font-[family-name:var(--font-mono)] text-[13px] text-[#171a2b]">{column}</code>
            </li>
          ))}
        </ol>
      </div>
    ) : (
      <p className="text-[13.5px] text-[#6f7899]">The column list isn&apos;t available for this dataset.</p>
    );

  return (
    <>
      {ds.description && <p className="max-w-2xl text-pretty text-[17px] leading-relaxed text-[#4b4f66]">{ds.description}</p>}
      {facts.length > 0 && (
        <dl className="mt-6 grid grid-cols-2 overflow-hidden rounded-lg border border-[#e3e6f0] bg-white sm:grid-cols-4">
          {facts.map(([name, value]) => (
            <div key={name} className="border-b border-r border-[#e3e6f0] px-4 py-3 last:border-r-0 sm:border-b-0">
              <dt className={label}>{name}</dt>
              <dd className="mt-1 font-[family-name:var(--font-mono)] text-[18px] font-semibold tabular-nums text-[#253D9A]">{value}</dd>
            </div>
          ))}
        </dl>
      )}
      <DatasetTabs
        tabs={[
          { id: "preview", label: "Preview", content: previewTab },
          { id: "metadata", label: "Metadata", content: metadataTab },
          { id: "columns", label: "Columns", content: columnsTab },
          { id: "citation", label: "Citation", content: <CitationBlock dataset={ds} /> },
        ]}
      />
      {access}
    </>
  );
}
