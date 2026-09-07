import Link from "next/link";
import { mediaCases, classifications, explainers, toolkits } from "../../_content/mediaCases";
import { PageHeader, SectionHeading, FilterBar, StatusTag } from "../_ui/kit";
import MediaSlot from "../_ui/MediaSlot";

export default function MediaWatchV2() {
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
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {mediaCases.map((c) => (
            <Link key={c.slug} href={`/v2/media-watch/${c.slug}`} className="group overflow-hidden rounded-xl border border-[#e6e8f0] bg-white transition-shadow hover:shadow-[0_2px_16px_rgba(15,107,92,0.10)]">
              {c.screenshot && <MediaSlot need={c.screenshot} />}
              <div className="p-5">
                <span className="rounded bg-[#0F6B5C]/8 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-[#0F6B5C]">{c.classification}</span>
                <h3 className="mt-2 flex items-start gap-2 text-lg font-bold leading-snug text-[#171a2b] group-hover:text-[#0F6B5C]">
                  {c.headline} <StatusTag status={c.status} />
                </h3>
                <p className="mt-1 text-[13px] text-[#8b8fa3]">{c.source} &middot; {c.date}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-y border-[#e6e8f0] bg-[#fafbfc]">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <SectionHeading>Video Explainers</SectionHeading>
          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            {explainers.map((e, i) => (
              <div key={i} className="rounded-xl border border-[#e6e8f0] bg-white p-5">
                <MediaSlot need={e.media} />
                <p className="mt-3 flex items-center gap-2 text-sm text-[#5b5f74]">{e.desc} <StatusTag status={e.status} /></p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <SectionHeading>Downloads</SectionHeading>
        <ul className="mt-8 grid gap-3">
          {toolkits.map((t) => (
            <li key={t.title} className="flex items-center justify-between rounded-lg border border-[#e6e8f0] bg-white px-5 py-4">
              <span className="flex items-center gap-2 text-[15px] font-semibold text-[#171a2b]">{t.title} <StatusTag status={t.status} /></span>
              <span className="rounded-full bg-[#E4633F]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-[#E4633F]">{t.kind}</span>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
