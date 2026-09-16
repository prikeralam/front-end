import { notFound } from "next/navigation";
import { getDatasetDetail, getDatasetPreview } from "../../../../../_lib/datasetsService";
import { PageHeader } from "../../../../../_ui/kit";
import DatasetTabs from "../../../../../data/_ui/DatasetTabs";
import PortalDownloadPanel from "../../../../_ui/PortalDownloadPanel";

export default async function DashboardDatasetDetailV2({ params }: { params: Promise<{ theme: string; slug: string }> }) {
  const { theme: rawTheme, slug } = await params;
  const theme = decodeURIComponent(rawTheme);
  const ds = await getDatasetDetail(slug, null);
  if (!ds || ds.theme !== theme) notFound();

  const previews = (await getDatasetPreview(slug, null)) ?? [];

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
      {previews.map((p) => (
        <div key={p.label} className="overflow-hidden rounded-lg border border-[#e6e8f0]">
          <p className="border-b border-[#e6e8f0] bg-[#fafbfc] px-4 py-2 text-[13px] font-bold text-[#171a2b]">{p.label}</p>
          {p.columns.length === 0 ? (
            <p className="px-4 py-4 text-[13px] text-[#8b8fa3]">Preview not available for this file format.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr>
                    {p.columns.map((c) => (
                      <th key={c} className="whitespace-nowrap border-b border-[#e6e8f0] px-3 py-2 font-mono text-[11px] font-semibold text-[#5b5f74]">{c}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {p.rows.map((row, i) => (
                    <tr key={i}>
                      {row.map((cell, j) => (
                        <td key={j} className="whitespace-nowrap border-b border-[#e6e8f0] px-3 py-2 text-[12px] text-[#171a2b]">{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ))}
      {previews.length === 0 && <p className="text-[13px] text-[#8b8fa3]">No files uploaded yet.</p>}
    </div>
  );

  return (
    <>
      <PageHeader kicker="Your dashboard" title={ds.title} />
      <section className="mx-auto max-w-3xl px-6 py-16">
        <DatasetTabs
          tabs={[
            { id: "description", label: "Description", content: descriptionTab },
            { id: "metadata", label: "Metadata", content: metadataTab },
            { id: "preview", label: "Preview", content: previewTab },
          ]}
        />

        <PortalDownloadPanel slug={ds.slug} />
      </section>
    </>
  );
}
