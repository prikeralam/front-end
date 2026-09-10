import Link from "next/link";
import { heroProjects } from "../_content/projects";
import { heroProjectPhotos } from "../_lib/stockPhotos";
import { publications } from "../_content/publications";
import { upcomingEvents, pastEvents } from "../_content/events";
import { SectionHeading, StatusTag } from "./_ui/kit";
import HeroCarousel from "./_ui/HeroCarousel";
import MediaSlot from "./_ui/MediaSlot";

const featuredResearch = publications.slice(0, 3);
const featuredEvents = [...upcomingEvents, ...pastEvents].slice(0, 3);

export default function HomeV3() {
  return (
    <>
      {/* Hero banners */}
      <div className="mx-auto max-w-6xl px-6 pt-8">
        <HeroCarousel projects={heroProjects} photos={heroProjectPhotos} />
      </div>

      {/* Featured Research */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="flex items-end justify-between gap-4 border-b-2 border-[#253D9A] pb-3">
          <SectionHeading>Featured Research</SectionHeading>
          <Link href="/v3/research" className="text-sm font-semibold text-[#253D9A] hover:underline">View all research &rarr;</Link>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {featuredResearch.map((p) => (
            <Link key={p.slug} href={`/v3/research/${p.slug}`} className="block border border-[#e6dbc7] bg-white transition-colors hover:border-[#253D9A]">
              {p.cover && <MediaSlot need={p.cover} />}
              <div className="p-6">
                <span className="inline-block bg-[#253D9A]/8 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#253D9A]">{p.format}</span>
                <h3 className="mt-3 flex items-start gap-2 font-[family-name:var(--font-heading)] text-lg font-semibold leading-snug text-[#171a2b]">
                  {p.title}
                  <StatusTag status={p.status} />
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Events */}
      <section className="border-y border-[#e6dbc7] bg-[#F1E9D8]">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="flex items-end justify-between gap-4">
            <SectionHeading>Featured Events &amp; Campaigns</SectionHeading>
            <Link href="/v3/events" className="text-sm font-semibold text-[#253D9A] hover:underline">View all events &rarr;</Link>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {featuredEvents.map((e) => (
              <Link key={e.slug} href={`/v3/events/${e.slug}`} className="block border border-[#e6dbc7] bg-white transition-colors hover:border-[#253D9A]">
                {e.image && <MediaSlot need={e.image} />}
                <div className="p-6">
                  <span className="inline-block bg-[#253D9A]/8 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#253D9A]">{e.type}</span>
                  <h3 className="mt-3 flex items-start gap-2 font-[family-name:var(--font-heading)] text-lg font-semibold leading-snug text-[#171a2b]">
                    {e.title}
                    <StatusTag status={e.status} />
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
