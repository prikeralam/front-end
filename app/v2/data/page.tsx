import Link from "next/link";
import { datasets, dashboards, datasetThemes, datasetGeographies, datasetYears } from "../../_content/datasets";
import { PageHeader, SectionHeading, FilterBar, StatusTag, EmptyState } from "../_ui/kit";
import MediaSlot from "../_ui/MediaSlot";

const visibilityLabel: Record<string, string> = { public: "Public", "on-request": "On request", internal: "Internal only" };

export default function DataV2() {
  return (
    <>
      <PageHeader
        kicker="Data Repository & Library"
        title="Datasets and dashboards"
        intro="A centralized data repository with controlled access, designed to store, manage, and analyze research datasets securely."
      />

      <section className="mx-auto max-w-6xl px-6 py-16">
        <SectionHeading>Datasets</SectionHeading>
        <div className="mt-6">
          <FilterBar
            facets={[
              { label: "Theme", options: datasetThemes },
              { label: "Geography", options: datasetGeographies },
              { label: "Year", options: datasetYears },
            ]}
          />
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {datasets.map((d) => (
            <Link key={d.slug} href={`/v2/data/${d.slug}`} className="group overflow-hidden rounded-xl border border-[#e6e8f0] bg-white transition-shadow hover:shadow-[0_2px_16px_rgba(15,107,92,0.10)]">
              {d.preview && <MediaSlot need={d.preview} />}
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <span className="rounded bg-[#253D9A]/8 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-[#253D9A]">{d.type}</span>
                  <span className="rounded-full bg-[#E4633F]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#E4633F]">
                    {visibilityLabel[d.visibility]}
                  </span>
                </div>
                <h3 className="mt-3 flex items-start gap-2 text-lg font-bold leading-snug text-[#171a2b] group-hover:text-[#253D9A]">
                  {d.title}
                  <StatusTag status={d.status} />
                </h3>
                <p className="mt-2 text-[13px] text-[#8b8fa3]">{d.geography} &middot; {d.year}</p>
              </div>
            </Link>
          ))}
        </div>
        {datasets.length === 0 && <EmptyState message="No datasets match your filters." />}
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
