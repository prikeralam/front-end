import Link from "next/link";
import { mediaCases, classifications, explainers, toolkits } from "../../_content/mediaCases";
import { PageHeader, SectionHeading, FilterBar, StatusTag } from "../_ui/kit";
import MediaSlot from "../_ui/MediaSlot";

export default function MediaWatchV3() {
  return (
    <>
      <PageHeader
        kicker="Media Watch & Rapid Response"
        title="Tracking misinformation, hate speech, and biased coverage"
        intro="Real-time issue tracking, news analysis, and proactive engagement — with PRI's responses linked to each flagged case."
      />

      <section className="mx-auto max-w-6xl px-6 py-16">
        <SectionHeading>Digest</SectionHeading>
        <div className="mt-6">
          <FilterBar facets={[{ label: "Classification", options: classifications }]} />
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {mediaCases.map((c) => (
            <Link key={c.slug} href={`/v3/media-watch/${c.slug}`} className="block border border-[#e6dbc7] bg-white transition-colors hover:border-[#243D9A]">
              {c.screenshot && <MediaSlot need={c.screenshot} />}
              <div className="p-5">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-[#B8862F]">{c.classification}</span>
                <h3 className="mt-2 flex items-start gap-2 font-[family-name:var(--font-heading)] text-lg font-semibold leading-snug text-[#171a2b]">
                  {c.headline} <StatusTag status={c.status} />
                </h3>
                <p className="mt-1 text-[13px] text-[#8b8fa3]">{c.source} &middot; {c.date}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-y border-[#e6dbc7] bg-[#F1E9D8]">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <SectionHeading>Video Explainers</SectionHeading>
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {explainers.map((e, i) => (
              <div key={i}>
                <MediaSlot need={e.media} />
                <p className="mt-2 flex items-center gap-2 text-sm text-[#5b5f74]">{e.desc} <StatusTag status={e.status} /></p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <SectionHeading>Downloads</SectionHeading>
        <ul className="mt-8 divide-y divide-[#e6dbc7] border-y border-[#e6dbc7]">
          {toolkits.map((t) => (
            <li key={t.title} className="flex items-center justify-between py-4">
              <span className="flex items-center gap-2 text-[15px] text-[#22263a]">{t.title} <StatusTag status={t.status} /></span>
              <span className="border border-[#B8862F]/40 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#B8862F]">{t.kind}</span>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
