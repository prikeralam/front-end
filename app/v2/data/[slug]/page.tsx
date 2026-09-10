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

export default async function DatasetDetailV2({ params }: { params: Promise<{ slug: string }> }) {
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
        <p className="mt-8 text-lg leading-relaxed text-[#4b4f66]">{ds.description}</p>
        <dl className="mt-8 grid gap-3 sm:grid-cols-2">
          {[
            ["Geography", ds.geography], ["Year", ds.year], ["Source", ds.source],
            ["Coverage", ds.coverage], ["Update frequency", ds.frequency], ["Visibility", ds.visibility],
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg border border-[#e6e8f0] px-4 py-3">
              <dt className="text-[11px] font-bold uppercase tracking-wider text-[#8b8fa3]">{label}</dt>
              <dd className="mt-1 text-[15px] text-[#171a2b]">{value}</dd>
            </div>
          ))}
        </dl>
        <button disabled className="mt-8 cursor-not-allowed rounded-full bg-[#253D9A]/40 px-5 py-2.5 text-sm font-semibold text-white">
          {actionLabel[ds.visibility]}
        </button>
      </section>
    </>
  );
}
