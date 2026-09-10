import Link from "next/link";
import { datasets, dashboards, datasetThemes } from "../../_content/datasets";
import { PageHeader, SectionHeading, StatusTag } from "../_ui/kit";
import MediaSlot from "../_ui/MediaSlot";

export default function DataV2() {
  const themeCounts = datasetThemes
    .map((theme) => ({ theme, count: datasets.filter((d) => d.theme === theme).length }))
    .filter((t) => t.count > 0);

  return (
    <>
      <PageHeader
        kicker="Data Repository & Library"
        title="Datasets and dashboards"
        intro="A centralized data repository with controlled access, designed to store, manage, and analyze research datasets securely."
      />

      <section className="mx-auto max-w-6xl px-6 py-16">
        <SectionHeading>Discover by theme</SectionHeading>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {themeCounts.map((t) => (
            <Link
              key={t.theme}
              href={`/v2/data/theme/${encodeURIComponent(t.theme)}`}
              className="group rounded-xl border border-[#e6e8f0] bg-white p-7 transition-shadow hover:shadow-[0_2px_16px_rgba(15,107,92,0.10)]"
            >
              <p className="text-4xl font-bold text-[#253D9A]">{t.count}</p>
              <p className="mt-2 text-lg font-bold text-[#171a2b] group-hover:text-[#253D9A]">{t.theme}</p>
              <p className="mt-1 text-[13px] text-[#8b8fa3]">{t.count === 1 ? "dataset" : "datasets"}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-t border-[#e6e8f0] bg-[#fafbfc]">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <SectionHeading>Visualization Dashboards</SectionHeading>
          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            {dashboards.map((d) => (
              <div key={d.slug} className="rounded-xl border border-[#e6e8f0] bg-white p-5">
                {d.embed && <MediaSlot need={d.embed} />}
                <h3 className="mt-4 flex items-center gap-2 text-lg font-bold text-[#171a2b]">
                  {d.title} <StatusTag status={d.status} />
                </h3>
                <p className="mt-2 text-sm text-[#5b5f74]">{d.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
