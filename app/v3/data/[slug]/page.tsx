import { notFound } from "next/navigation";
import { datasets } from "../../../_content/datasets";
import { PageHeader, StatusTag } from "../../_ui/kit";
import MediaSlot from "../../_ui/MediaSlot";

export function generateStaticParams() {
  return datasets.map((d) => ({ slug: d.slug }));
}

const actionLabel: Record<string, string> = {
  public: "Download (not wired)",
  "on-request": "Request access (not wired)",
  internal: "Access restricted",
};

export default async function DatasetDetailV3({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const ds = datasets.find((d) => d.slug === slug);
  if (!ds) notFound();

  return (
    <>
      <PageHeader kicker={`${ds.type} · ${ds.theme}`} title={ds.title} />
      <section className="mx-auto max-w-3xl px-6 py-16">
        <div className="mb-6 flex items-center gap-2 text-sm text-[#5b5f74]">
          <StatusTag status={ds.status} />
        </div>
        {ds.preview && <MediaSlot need={ds.preview} className="max-w-lg" />}
        <p className="mt-8 text-[17px] leading-relaxed text-[#4b4f66]">{ds.description}</p>
        <table className="mt-8 w-full text-left">
          <tbody className="divide-y divide-[#e6dbc7] border-y border-[#e6dbc7]">
            {[
              ["Geography", ds.geography], ["Year", ds.year], ["Source", ds.source],
              ["Coverage", ds.coverage], ["Update frequency", ds.frequency], ["Visibility", ds.visibility],
            ].map(([label, value]) => (
              <tr key={label}>
                <th scope="row" className="w-44 py-3 pr-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8b8fa3]">{label}</th>
                <td className="py-3 text-[15px] text-[#171a2b]">{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <button disabled className="mt-8 cursor-not-allowed bg-[#253D9A]/40 px-5 py-2.5 text-sm font-semibold text-white">
          {actionLabel[ds.visibility]}
        </button>
      </section>
    </>
  );
}
