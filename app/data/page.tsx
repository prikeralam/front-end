import Link from "next/link";
import type { ReactNode } from "react";
import { NotPublishedYet, LoadError } from "../_ui/ApiMessage";
import { listDashboards, listDatasets } from "../_lib/api/datasets";
import { load } from "../_lib/api/load";
import { PageHeader, SectionHeading } from "../_ui/kit";
import DashboardEmbed from "./_ui/DashboardEmbed";

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

export default async function DataPage() {
  const [datasetsResult, dashboardsResult] = await Promise.all([load("datasets", listDatasets), load("dashboards", listDashboards)]);
  const datasets = datasetsResult.ok ? datasetsResult.data : [];
  const themes = Array.from(new Set(datasets.map((d) => d.theme).filter((t): t is string => !!t)));
  const themeCounts = themes.map((theme) => ({ theme, count: datasets.filter((d) => d.theme === theme).length }));

  return (
    <>
      <PageHeader
        kicker="Data Repository & Library"
        title="Datasets and dashboards"
        intro="A centralized data repository with controlled access, designed to store, manage, and analyze research datasets securely."
      />

      <section className="mx-auto max-w-6xl px-6 py-16">
        <SectionHeading>Discover by theme</SectionHeading>
        {!datasetsResult.ok && <LoadError what="our datasets" />}
        {datasetsResult.ok && themeCounts.length === 0 && <NotPublishedYet>Datasets will be published here soon.</NotPublishedYet>}
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {themeCounts.map((t) => (
            <Link
              key={t.theme}
              href={`/data/theme/${encodeURIComponent(t.theme)}`}
              className="group rounded-xl border border-[#e6e8f0] bg-white p-7 transition-shadow hover:shadow-[0_2px_16px_rgba(15,107,92,0.10)]"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#253D9A]/8 text-[#253D9A]">
                  {themeIcons[t.theme] ?? fallbackIcon}
                </div>
                <p className="text-4xl font-bold text-[#253D9A]">{t.count}</p>
              </div>
              <p className="mt-4 text-lg font-bold text-[#171a2b] group-hover:text-[#253D9A]">{t.theme}</p>
              <p className="mt-1 text-[13px] text-[#8b8fa3]">{t.count === 1 ? "dataset" : "datasets"}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-t border-[#e6e8f0] bg-[#fafbfc]">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <SectionHeading>Visualization Dashboards</SectionHeading>
          {!dashboardsResult.ok && <LoadError what="our dashboards" />}
          {dashboardsResult.ok && dashboardsResult.data.length === 0 && <NotPublishedYet>Dashboards will be published here soon.</NotPublishedYet>}
          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            {(dashboardsResult.ok ? dashboardsResult.data : []).map((d) => (
              <div key={d.slug} className="rounded-xl border border-[#e6e8f0] bg-white p-5">
                <DashboardEmbed url={d.embedUrl} title={d.title} type={d.embedType} />
                <h3 className="mt-4 text-lg font-bold text-[#171a2b]">{d.title}</h3>
                <p className="mt-2 text-sm text-[#5b5f74]">{d.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
