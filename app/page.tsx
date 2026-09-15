import Link from "next/link";
import { heroProjects } from "./_content/projects";
import { heroProjectPhotos } from "./_lib/stockPhotos";
import { publications } from "./_content/publications";
import { upcomingEvents, pastEvents } from "./_content/events";
import { SectionHeading, StatusTag } from "./_ui/kit";
import HeroCarousel from "./_ui/HeroCarousel";
import MediaSlot from "./_ui/MediaSlot";

const featuredResearch = publications.slice(0, 3);
const featuredEvents = [...upcomingEvents, ...pastEvents].slice(0, 3);

export default function HomeV2() {
  return (
    <>
      {/* Hero banners */}
      <div className="mx-auto max-w-6xl px-6 pt-8">
        <HeroCarousel projects={heroProjects} photos={heroProjectPhotos} />
      </div>

      {/* Featured Research */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="flex items-end justify-between gap-4">
          <SectionHeading>Featured research</SectionHeading>
          <Link href="/research" className="text-sm font-semibold text-[#E4633F] hover:underline">View all research &rarr;</Link>
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-3">
          {featuredResearch.map((p) => (
            <Link key={p.slug} href={`/research/${p.slug}`} className="block overflow-hidden rounded-xl border border-[#e6e8f0] bg-white transition-shadow hover:shadow-[0_2px_16px_rgba(15,107,92,0.10)]">
              {p.cover && <MediaSlot need={p.cover} />}
              <div className="p-6">
                <span className="inline-block w-fit rounded bg-[#253D9A]/8 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-[#253D9A]">{p.format}</span>
                <h3 className="mt-4 flex items-start gap-2 text-[16px] font-semibold leading-snug text-[#22263a]">{p.title} <StatusTag status={p.status} /></h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Events */}
      <section className="border-y border-[#e6e8f0] bg-[#fafbfc]">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="flex items-end justify-between gap-4">
            <SectionHeading>Featured events &amp; campaigns</SectionHeading>
            <Link href="/events" className="text-sm font-semibold text-[#E4633F] hover:underline">View all events &rarr;</Link>
          </div>
          <div className="mt-8 grid gap-5 sm:grid-cols-3">
            {featuredEvents.map((e) => (
              <Link key={e.slug} href={`/events/${e.slug}`} className="block overflow-hidden rounded-xl border border-[#e6e8f0] bg-white transition-shadow hover:shadow-[0_2px_16px_rgba(15,107,92,0.10)]">
                {e.image && <MediaSlot need={e.image} />}
                <div className="p-6">
                  <span className="inline-block w-fit rounded bg-[#253D9A]/8 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-[#253D9A]">{e.type}</span>
                  <h3 className="mt-4 flex items-start gap-2 text-[16px] font-semibold leading-snug text-[#22263a]">{e.title} <StatusTag status={e.status} /></h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
