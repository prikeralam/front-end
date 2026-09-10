import Link from "next/link";
import { datasets, dashboards, datasetThemes, datasetGeographies, datasetYears } from "../../_content/datasets";
import { PageHeader, SectionHeading, FilterBar, StatusTag, EmptyState } from "../_ui/kit";
import MediaSlot from "../_ui/MediaSlot";

const visibilityLabel: Record<string, string> = { public: "Public", "on-request": "On request", internal: "Internal only" };

export default function DataV1() {
  return (
    <>
      <PageHeader
        kicker="Data Repository & Library"
        title="Datasets and dashboards"
        intro="A centralized data repository with controlled access, designed to store, manage, and analyze research datasets securely."
      />

      <section className="mx-auto max-w-5xl px-6 pb-16">
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
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {datasets.map((d) => (
            <Link key={d.slug} href={`/v1/data/${d.slug}`} className="block border border-[#253D9A]/12 bg-white transition-colors hover:border-[#253D9A]/40">
              {d.preview && <MediaSlot need={d.preview} />}
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] uppercase tracking-wide text-[#C9972C]">{d.type}</span>
                  <span
                    className={`flex items-center gap-1 border px-2 py-0.5 text-[10px] uppercase tracking-wide ${
                      d.visibility === "internal"
                        ? "border-[#8b8fa3]/40 bg-[#8b8fa3]/10 text-[#5b5f74]"
                        : "border-[#253D9A]/20 text-[#253D9A]"
                    }`}
                  >
                    {d.visibility === "internal" && (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M12 1a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V11a2 2 0 0 0-2-2h-1V6a5 5 0 0 0-5-5Zm-3 8V6a3 3 0 1 1 6 0v3H9Z" />
                      </svg>
                    )}
                    {visibilityLabel[d.visibility]}
                  </span>
                </div>
                <h3 className="mt-3 flex items-start gap-2 font-[family-name:var(--font-heading)] text-lg leading-snug text-[#171a2b]">
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

      <section className="border-t border-[#253D9A]/10 bg-[#f7f7f3]">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <SectionHeading>Visualization Dashboards</SectionHeading>
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {dashboards.map((d) => (
              <div key={d.slug} className="border border-[#253D9A]/12 bg-white p-5">
                {d.embed && <MediaSlot need={d.embed} />}
                <h3 className="mt-4 flex items-center gap-2 font-[family-name:var(--font-heading)] text-lg text-[#171a2b]">
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
