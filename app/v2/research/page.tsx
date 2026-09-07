import Link from "next/link";
import { publications, publicationThemes, publicationFormats } from "../../_content/publications";
import { PageHeader, FilterBar, StatusTag } from "../_ui/kit";
import MediaSlot from "../_ui/MediaSlot";

export default function ResearchV2() {
  return (
    <>
      <PageHeader
        kicker="Research & Publications Hub"
        title="Our published and ongoing research"
        intro="Reports, working papers, briefs, explainers, infographics, videos, and data stories across PRI's research themes."
      />
      <section className="mx-auto max-w-6xl px-6 py-16">
        <FilterBar
          facets={[
            { label: "Theme", options: publicationThemes },
            { label: "Format", options: publicationFormats },
          ]}
        />
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {publications.map((p) => (
            <Link key={p.slug} href={`/v2/research/${p.slug}`} className="group overflow-hidden rounded-xl border border-[#e6e8f0] bg-white transition-shadow hover:shadow-[0_2px_16px_rgba(15,107,92,0.10)]">
              {p.cover && <MediaSlot need={p.cover} />}
              <div className="p-5">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-[#0F6B5C]/8 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-[#0F6B5C]">{p.format}</span>
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-[#8b8fa3]">{p.theme}</span>
                </div>
                <h3 className="mt-3 flex items-start gap-2 text-lg font-bold leading-snug text-[#171a2b] group-hover:text-[#0F6B5C]">
                  {p.title}
                  <StatusTag status={p.status} />
                </h3>
                <p className="mt-2 text-[13px] text-[#8b8fa3]">{p.authors.join(", ")} &middot; {p.date}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
