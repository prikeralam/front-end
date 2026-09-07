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

export default async function DatasetDetailV1({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const ds = datasets.find((d) => d.slug === slug);
  if (!ds) notFound();

  return (
    <>
      <PageHeader kicker={`${ds.type} · ${ds.theme}`} title={ds.title} />
      <section className="mx-auto max-w-3xl px-6 pb-16">
        <div className="mb-6 flex items-center gap-2 text-sm text-[#5b5f74]">
          <StatusTag status={ds.status} />
        </div>
        {ds.preview && <MediaSlot need={ds.preview} className="max-w-lg" />}
        <p className="mt-8 text-lg leading-relaxed text-[#4b4f66]">{ds.description}</p>
        <dl className="mt-8 grid gap-6 border-t border-[#2e3891]/10 pt-6 sm:grid-cols-2">
          {[
            ["Geography", ds.geography], ["Year", ds.year], ["Source", ds.source],
            ["Coverage", ds.coverage], ["Update frequency", ds.frequency], ["Visibility", ds.visibility],
          ].map(([label, value]) => (
            <div key={label}>
              <dt className="text-[12px] uppercase tracking-[0.12em] text-[#8b8fa3]">{label}</dt>
              <dd className="mt-1 text-[15px] text-[#171a2b]">{value}</dd>
            </div>
          ))}
        </dl>
        <button disabled className="mt-8 cursor-not-allowed bg-[#2e3891]/40 px-5 py-2.5 text-sm font-medium text-white">
          {actionLabel[ds.visibility]}
        </button>
      </section>
    </>
  );
}
