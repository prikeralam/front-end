import Link from "next/link";
import type { ReactNode } from "react";
import { NotPublishedYet, LoadError } from "../_ui/ApiMessage";
import { getDatasetPreviews, listDashboards, listDatasets } from "../_lib/api/datasets";
import type { DatasetSummary } from "../_lib/datasetTypes";
import { load } from "../_lib/api/load";
import { SectionHeading } from "../_ui/kit";
import DashboardEmbed from "./_ui/DashboardEmbed";
import DataSearch from "./_ui/DataSearch";
import FeaturedDataset from "./_ui/FeaturedDataset";

const themeIcons: Record<string, ReactNode> = {
  Education: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3 2 8l10 5 10-5-10-5Z" />
      <path d="M6 10v5c0 1.1 2.7 2 6 2s6-.9 6-2v-5" />
    </svg>
  ),
  Health: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 20.5s-7-4.35-9.5-8.5C1 8.8 2.5 5.5 6 5.5c2 0 3.5 1.2 4 2.7.5-1.5 2-2.7 4-2.7 3.5 0 5 3.3 3.5 6.5-2.5 4.15-9.5 8.5-9.5 8.5Z" />
    </svg>
  ),
  "Public Finance": (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="8" />
      <path d="M9.5 9c.3-1 1.2-1.5 2.3-1.5 1.5 0 2.5.8 2.5 2 0 1.3-1.1 1.8-2.3 2.1-1.3.3-2.5.8-2.5 2.1 0 1.2 1.1 2 2.6 2 1.1 0 2-.5 2.3-1.5" />
      <path d="M12 6v1.3M12 16.7V18" />
    </svg>
  ),
  Employment: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="7.5" width="18" height="12" rx="2" />
      <path d="M8 7.5V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1.5" />
      <path d="M3 12.5h18" />
    </svg>
  ),
  Demography: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="9" cy="8" r="3" />
      <path d="M3.5 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5" />
      <circle cx="17.5" cy="9" r="2.3" />
      <path d="M15.8 13.2c2.4.2 4.2 2 4.2 4.8" />
    </svg>
  ),
};

const fallbackIcon = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <ellipse cx="12" cy="5" rx="8" ry="3" />
    <path d="M4 5v6c0 1.66 3.58 3 8 3s8-1.34 8-3V5" />
    <path d="M4 11v6c0 1.66 3.58 3 8 3s8-1.34 8-3v-6" />
  </svg>
);

/** The newest dataset anyone can open that has a table to show, for the featured frame. */
function pickFeatured(datasets: DatasetSummary[]): DatasetSummary | undefined {
  return [...datasets].reverse().find((d) => d.accessState === "full" && d.fileFormat !== null && d.fileFormat !== "GeoJSON");
}

export default async function DataPage() {
  const [datasetsResult, dashboardsResult] = await Promise.all([load("datasets", listDatasets), load("dashboards", listDashboards)]);
  const datasets = datasetsResult.ok ? datasetsResult.data : [];
  const themes = Array.from(new Set(datasets.map((d) => d.theme).filter((t): t is string => !!t)));
  const themeCounts = themes.map((theme) => ({ theme, count: datasets.filter((d) => d.theme === theme).length }));
  const featured = pickFeatured(datasets);
  const featuredTable = featured ? (await getDatasetPreviews(featured)).table : null;
  const dashboardCount = dashboardsResult.ok ? dashboardsResult.data.length : 0;
  const statLine = [
    `${datasets.length} ${datasets.length === 1 ? "dataset" : "datasets"}`,
    `${themes.length} ${themes.length === 1 ? "theme" : "themes"}`,
    dashboardCount > 0 && `${dashboardCount} ${dashboardCount === 1 ? "dashboard" : "dashboards"}`,
  ].filter(Boolean);

  return (
    <>
      <section className="relative overflow-hidden border-b border-[#e3e6f0] bg-[radial-gradient(1100px_420px_at_85%_-10%,rgba(37,61,154,0.11),transparent_62%)] after:pointer-events-none after:absolute after:inset-0 after:bg-[radial-gradient(circle,rgba(37,61,154,0.14)_1px,transparent_1.4px)] after:bg-[length:26px_26px] after:[mask-image:linear-gradient(100deg,transparent_55%,#000_92%)]">
        <div className={`relative z-10 mx-auto grid max-w-6xl items-start gap-10 px-6 pb-14 pt-14 ${featured && featuredTable ? "lg:grid-cols-[1.1fr_0.9fr]" : ""}`}>
          <div className="grid gap-5">
            <p className="flex items-center gap-2.5 font-[family-name:var(--font-mono)] text-[11.5px] font-semibold uppercase tracking-[0.14em] text-[#253D9A]">
              <span aria-hidden="true" className="h-2 w-2 bg-[#253D9A]" />
              Data Repository & Library
            </p>
            <h1 className="max-w-[18ch] text-balance text-[36px] leading-[1.08] tracking-tight text-[#171a2b] sm:text-[48px]">Open data for Kerala&rsquo;s policy questions</h1>
            {datasetsResult.ok && datasets.length > 0 && (
              <p className="font-[family-name:var(--font-mono)] text-[13px] font-semibold text-[#253D9A]">{statLine.join(" · ")}</p>
            )}
            <p className="max-w-[56ch] text-pretty text-[16.5px] leading-relaxed text-[#4b4f66]">
              Datasets behind PRI&rsquo;s research, with previews, sources and citations. Some are open to everyone; others are available on request.
            </p>
            {datasetsResult.ok && datasets.length > 0 && <DataSearch datasets={datasets} suggestions={themes} />}
          </div>
          {featured && featuredTable && <FeaturedDataset dataset={featured} table={featuredTable} />}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <SectionHeading>Browse by theme</SectionHeading>
        {!datasetsResult.ok && <LoadError what="our datasets" />}
        {datasetsResult.ok && themeCounts.length === 0 && <NotPublishedYet>Datasets will be published here soon.</NotPublishedYet>}
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {themeCounts.map((t) => (
            <Link
              key={t.theme}
              href={`/data/theme/${encodeURIComponent(t.theme)}`}
              className="group rounded-lg border border-[#e3e6f0] bg-white p-6 transition-[border-color,box-shadow] hover:border-[#cdd6f3] hover:shadow-[0_12px_28px_-16px_rgba(23,26,43,0.35)]"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#253D9A]/8 text-[#253D9A]">
                  {themeIcons[t.theme] ?? fallbackIcon}
                </div>
                <p className="font-[family-name:var(--font-mono)] text-[30px] font-semibold leading-none text-[#253D9A]">{t.count}</p>
              </div>
              <p className="mt-4 text-[18px] text-[#171a2b] group-hover:text-[#253D9A]">{t.theme}</p>
              <p className="mt-1 text-[13px] text-[#6f7899]">{t.count === 1 ? "dataset" : "datasets"}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-t border-[#e3e6f0] bg-white">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <SectionHeading>Visualization Dashboards</SectionHeading>
          {!dashboardsResult.ok && <LoadError what="our dashboards" />}
          {dashboardsResult.ok && dashboardsResult.data.length === 0 && <NotPublishedYet>Dashboards will be published here soon.</NotPublishedYet>}
          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            {(dashboardsResult.ok ? dashboardsResult.data : []).map((d) => (
              <div key={d.slug} className="rounded-lg border border-[#e3e6f0] bg-white p-5">
                <DashboardEmbed url={d.embedUrl} title={d.title} type={d.embedType} />
                <h3 className="mt-4 text-lg text-[#171a2b]">{d.title}</h3>
                <p className="mt-2 text-sm text-[#5b5f74]">{d.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
