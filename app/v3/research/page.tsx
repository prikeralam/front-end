import Link from "next/link";
import { publications, publicationThemes, publicationFormats } from "../../_content/publications";
import { PageHeader, FilterBar, StatusTag } from "../_ui/kit";
import MediaSlot from "../_ui/MediaSlot";

export default function ResearchV3() {
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
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {publications.map((p) => (
            <Link key={p.slug} href={`/v3/research/${p.slug}`} className="block border border-[#e6dbc7] bg-white transition-colors hover:border-[#6B2737]">
              {p.cover && <MediaSlot need={p.cover} />}
              <div className="p-5">
                <div className="flex items-center gap-2">
                  <span className="bg-[#6B2737]/8 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-[#6B2737]">{p.format}</span>
                  <span className="text-[11px] text-[#8b8fa3]">{p.theme}</span>
                </div>
                <h3 className="mt-3 flex items-start gap-2 font-[family-name:var(--font-heading)] text-lg font-semibold leading-snug text-[#171a2b]">
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
