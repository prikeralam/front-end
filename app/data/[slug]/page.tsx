import { notFound } from "next/navigation";
import { LoadError } from "../../_ui/ApiMessage";
import { PageHeader } from "../../_ui/kit";
import { getDatasetDetail, getDatasetPreviews } from "../../_lib/api/datasets";
import { load } from "../../_lib/api/load";
import DatasetAccessPanel from "../_ui/DatasetAccessPanel";
import DatasetTabs from "../_ui/DatasetTabs";
import GeoPreview from "../_ui/GeoPreview";

export default async function DatasetDetailV2({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const result = await load("this dataset", () => getDatasetDetail(slug));
  if (!result.ok) {
    return (
      <>
        <PageHeader kicker="Data Repository & Library" title="Dataset" />
        <section className="mx-auto max-w-3xl px-6 py-16"><LoadError what="this dataset" /></section>
      </>
    );
  }
  const ds = result.data;
  if (!ds) notFound();

  const previews = await getDatasetPreviews(ds);

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
            <dt className="text-[11px] font-bold uppercase tracking-wider text-[#8b8fa3]">{label}</dt>
            <dd className="mt-1 text-[15px] text-[#171a2b]">{value ?? "To be confirmed"}</dd>
          </div>
        ))}
      </dl>
      {ds.tags.length > 0 && (
        <div className="mt-6">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-[#8b8fa3]">Tags</p>
          <div className="flex flex-wrap gap-2">
            {ds.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-[#253D9A]/8 px-3 py-1 text-[12px] font-semibold text-[#253D9A]">{tag}</span>
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
          <p className="border-b border-[#e6e8f0] bg-[#fafbfc] px-4 py-2 text-[13px] font-bold text-[#171a2b]">{previews.table.label}</p>
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
      <PageHeader kicker={`${ds.type ?? "Dataset"} · ${ds.theme ?? "Uncategorised"}`} title={ds.title} />
      <section className="mx-auto max-w-3xl px-6 py-16">
        <DatasetTabs
          tabs={[
            { id: "description", label: "Description", content: descriptionTab },
            { id: "metadata", label: "Metadata", content: metadataTab },
            { id: "preview", label: "Preview", content: previewTab },
          ]}
        />

        <DatasetAccessPanel accessState={ds.accessState} downloadUrl={ds.files[0]?.path ?? null} />
      </section>
    </>
  );
}
