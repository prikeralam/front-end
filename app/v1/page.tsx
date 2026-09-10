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

export default function HomeV1() {
  return (
    <>
      {/* Hero banners */}
      <div className="mx-auto max-w-5xl px-6 pt-8">
        <HeroCarousel projects={heroProjects} photos={heroProjectPhotos} />
      </div>

      {/* Featured Research */}
      <section className="mx-auto max-w-5xl px-6 py-16">
        <div className="flex items-end justify-between gap-4">
          <SectionHeading>Featured research</SectionHeading>
          <Link href="/v1/research" className="shrink-0 border-b-2 border-[#C9972C] pb-1 text-sm font-medium tracking-wide text-[#171a2b] transition-colors hover:border-[#253D9A]">
            View all research &rarr;
          </Link>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {featuredResearch.map((p) => (
            <Link key={p.slug} href={`/v1/research/${p.slug}`} className="block border border-[#253D9A]/12 bg-white transition-colors hover:border-[#253D9A]/40">
              {p.cover && <MediaSlot need={p.cover} />}
              <div className="p-5">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] uppercase tracking-wide text-[#C9972C]">{p.format}</span>
                  <span className="text-[11px] text-[#8b8fa3]">{p.theme}</span>
                </div>
                <h3 className="mt-3 flex items-start gap-2 font-[family-name:var(--font-heading)] text-lg leading-snug text-[#171a2b]">
                  {p.title}
                  <StatusTag status={p.status} />
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Events */}
      <section className="border-t border-[#253D9A]/10 bg-[#f7f7f3]">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <div className="flex items-end justify-between gap-4">
            <SectionHeading>Featured events &amp; campaigns</SectionHeading>
            <Link href="/v1/events" className="shrink-0 border-b-2 border-[#C9972C] pb-1 text-sm font-medium tracking-wide text-[#171a2b] transition-colors hover:border-[#253D9A]">
              View all events &rarr;
            </Link>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {featuredEvents.map((e) => (
              <Link key={e.slug} href={`/v1/events/${e.slug}`} className="block border border-[#253D9A]/12 bg-white transition-colors hover:border-[#253D9A]/40">
                {e.image && <MediaSlot need={e.image} />}
                <div className="p-5">
                  <span className="text-[11px] uppercase tracking-wide text-[#C9972C]">{e.type}</span>
                  <h3 className="mt-3 flex items-start gap-2 font-[family-name:var(--font-heading)] text-lg leading-snug text-[#171a2b]">
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
