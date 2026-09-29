import type { ReactNode } from "react";
import type { DatasetPreviews } from "../../_lib/api/datasets";
import type { DatasetDetail } from "../../_lib/datasetTypes";
import DatasetTabs from "./DatasetTabs";
import GeoPreview from "./GeoPreview";

/** The dataset's description, metadata and preview tabs, shared by the public page and the signed-in dashboard page. */
export default function DatasetView({ ds, previews, access }: { ds: DatasetDetail; previews: DatasetPreviews; access: ReactNode }) {
  const descriptionTab = <p className="max-w-2xl text-lg leading-relaxed text-[#4b4f66]">{ds.description}</p>;

  const metadataTab = (
    <div>
      <dl className="grid gap-3 sm:grid-cols-2">
        {[
          ["Geography", ds.geography], ["Year", ds.year], ["Source", ds.source],
          ["Coverage", ds.coverage], ["Update frequency", ds.frequency], ["Last updated", ds.lastUpdated],
          ["Visibility", ds.visibility],
        ].map(([label, value]) => (
          <div key={label} className="rounded-lg border border-[#e6e8f0] px-4 py-3">
            <dt className="text-[11px] font-[family-name:var(--font-mono)] font-semibold uppercase tracking-[0.12em] text-[#8b8fa3]">{label}</dt>
            <dd className="mt-1 text-[15px] text-[#171a2b]">{value ?? "To be confirmed"}</dd>
          </div>
        ))}
      </dl>
      {ds.tags.length > 0 && (
        <div className="mt-6">
          <p className="mb-2 text-[11px] font-[family-name:var(--font-mono)] font-semibold uppercase tracking-[0.12em] text-[#8b8fa3]">Tags</p>
          <div className="flex flex-wrap gap-2">
            {ds.tags.map((tag) => (
              <span key={tag} className="rounded bg-[#253D9A]/8 px-3 py-1 text-[12px] font-semibold text-[#253D9A]">{tag}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const previewTab = (
    <div className="space-y-8">
      {previews.map && <GeoPreview collection={previews.map} title={ds.title} />}
      {previews.table && (
        <div className="overflow-hidden rounded-lg border border-[#e6e8f0]">
          <p className="border-b border-[#e6e8f0] bg-white px-4 py-2 text-[13px] font-bold text-[#171a2b]">{previews.table.label}</p>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr>
                  {previews.table.columns.map((c) => (
                    <th key={c} className="whitespace-nowrap border-b border-[#e6e8f0] px-3 py-2 font-mono text-[11px] font-semibold text-[#5b5f74]">{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previews.table.rows.map((row, i) => (
                  <tr key={i}>
                    {row.map((cell, j) => (
                      <td key={j} className="whitespace-nowrap border-b border-[#e6e8f0] px-3 py-2 text-[12px] text-[#171a2b]">{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {!previews.map && !previews.table && <p className="text-[13px] text-[#8b8fa3]">Preview not available for this dataset.</p>}
    </div>
  );

  return (
    <>
      <DatasetTabs
        tabs={[
          { id: "description", label: "Description", content: descriptionTab },
          { id: "metadata", label: "Metadata", content: metadataTab },
          { id: "preview", label: "Preview", content: previewTab },
        ]}
      />
      {access}
    </>
  );
}
