import Link from "next/link";
import type { ReactNode } from "react";
import { NotPublishedYet, LoadError } from "../_ui/ApiMessage";
import { listDatasets } from "../_lib/api/datasets";
import { listCollections, listMentions } from "../_lib/api/impact";
import { listPublications } from "../_lib/api/publications";
import { load } from "../_lib/api/load";
import { BandKicker, DARK_BAND, SectionHeading } from "../_ui/kit";
import DataSearch from "./_ui/DataSearch";
import MentionList from "./_ui/MentionList";
import { pageMetadata } from "../_lib/seo";

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

export const metadata = pageMetadata({
  title: "Data Repository & Library",
  description: "Open data for Kerala's policy questions: datasets behind PRI's research on education, health, demography and migration, with previews, sources and citations.",
  path: "/data",
});

export default async function DataPage() {
  const [datasetsResult, collectionsResult, mentions, publications] = await Promise.all([
    load("datasets", listDatasets),
    load("collections", listCollections),
    load("mentions", listMentions),
    load("publications", listPublications),
  ]);
  const collections = collectionsResult.ok ? collectionsResult.data.slice(0, 3) : [];
  const datasets = datasetsResult.ok ? datasetsResult.data : [];
  const themes = Array.from(new Set(datasets.map((d) => d.theme).filter((t): t is string => !!t)));
  const themeCounts = themes.map((theme) => ({ theme, count: datasets.filter((d) => d.theme === theme).length }));
  const statLine = [
    `${datasets.length} ${datasets.length === 1 ? "dataset" : "datasets"}`,
    `${themes.length} ${themes.length === 1 ? "theme" : "themes"}`,
  ];

  // The PRI work each mention cites, by prefixed slug, for "Cites …" links. Unknown slugs are simply not linked.
  const cited: Record<string, { href: string; title: string }> = {};
  for (const p of publications.ok ? publications.data.publications : []) cited[`p:${p.slug}`] = { href: `/research/${p.slug}`, title: p.title };
  for (const d of datasets) cited[`d:${d.slug}`] = { href: `/data/${d.slug}`, title: d.title };

  return (
    <>
      <section className={DARK_BAND}>
        <div className="relative z-10 mx-auto grid max-w-6xl items-start gap-10 px-6 pb-14 pt-14">
          <div className="grid gap-5">
            <BandKicker>Data Repository & Library</BandKicker>
            <h1 className="max-w-[18ch] text-balance text-[36px] leading-[1.08] tracking-tight text-white sm:text-[48px]">Curated datasets for your policy questions</h1>
            {datasetsResult.ok && datasets.length > 0 && (
              <p className="font-[family-name:var(--font-mono)] text-[13px] font-semibold text-[#aebbf0]">{statLine.join(" · ")}</p>
            )}
            {datasetsResult.ok && datasets.length > 0 && (
              <div className="max-w-3xl">
                <DataSearch datasets={datasets} themes={themes} />
              </div>
            )}
          </div>
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

      {collections.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 pb-16">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHeading>Collections</SectionHeading>
            <Link href="/data/collections" className="text-sm font-semibold text-[#253D9A] hover:underline">
              All collections &rarr;
            </Link>
          </div>
          <div className="mt-8 grid gap-5 sm:grid-cols-3">
            {collections.map((c) => (
              <Link
                key={c.slug}
                href={`/data/collections/${c.slug}`}
                className="group rounded-lg border border-[#e3e6f0] bg-white p-6 transition-[border-color,box-shadow] hover:border-[#cdd6f3] hover:shadow-[0_12px_28px_-16px_rgba(23,26,43,0.35)]"
              >
                <p className="text-[17px] leading-snug text-[#171a2b] group-hover:text-[#253D9A]">{c.title}</p>
                {c.description && <p className="mt-2 line-clamp-2 text-[13.5px] text-[#5b6280]">{c.description}</p>}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* "Cited in" lives here until it grows enough for its own page again; /cited-in redirects to this anchor. */}
      <section id="cited-in" className="scroll-mt-24 border-t border-[#e3e6f0] bg-white">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <SectionHeading>Cited in</SectionHeading>
          <div className="mt-8">
            {!mentions.ok && <LoadError what="where PRI has been cited" />}
            {mentions.ok && mentions.data.length === 0 && <NotPublishedYet>Coverage and citations will be listed here soon.</NotPublishedYet>}
            {mentions.ok && mentions.data.length > 0 && <MentionList mentions={mentions.data} cited={cited} />}
          </div>
        </div>
      </section>
    </>
  );
}
