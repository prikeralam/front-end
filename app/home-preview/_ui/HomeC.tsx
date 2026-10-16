import Link from "next/link";
import type { HomeData } from "../../_lib/home/homeData";
import { formatPublicationDate } from "../../_lib/api/publicationAdapter";
import { LoadError, NotPublishedYet } from "../../_ui/ApiMessage";
import HomeSlider from "../../_ui/home/HomeSlider";
import { ChairmanQuote, ClosingCta, homeMono, homeViewAll, PartnersRow, SectionIntro } from "../../_ui/home/sections";
import MediaSlot from "../../_ui/MediaSlot";
import ProjectStageTag from "../../_ui/ProjectStageTag";
import EventCard from "../../events/_ui/EventCard";
import EventPoster from "../../events/_ui/EventPoster";

/** C. Data-forward (after Pew Research, IDinsight, Data for India): photo with a caption card, then the numbers and the data. */
export default function HomeC({ data }: { data: HomeData }) {
  const [nextEvent, ...otherEvents] = data.orderedEvents;
  const featured = nextEvent?.timing === "upcoming" ? nextEvent : undefined;
  const restEvents = (featured ? otherEvents : data.orderedEvents).slice(0, 3);
  const projects = data.projects.ok ? data.projects.data : [];

  return (
    <>
      <HomeSlider slides={data.slides} layout="caption" />

      {data.stats.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 pt-14">
          <h2 className="sr-only">PRI by the numbers</h2>
          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-[#e3e6f0] bg-[#e3e6f0] md:grid-cols-4">
            {data.stats.map((s) => (
              <div key={s.label} className="grid gap-1 bg-white px-6 py-6">
                <dt className={`${homeMono} order-2 text-[#5b6280]`}>{s.label}</dt>
                <dd className="order-1 font-[family-name:var(--font-heading)] text-[40px] leading-none text-[#253D9A]">{s.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {data.themes.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 py-16">
          <SectionIntro label="Data repository" title="Explore the data by theme" action={<Link href="/data" className={homeViewAll}>Search all datasets &rarr;</Link>} />
          <ul className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
            {data.themes.map((t) => (
              <li key={t.name}>
                <Link
                  href={t.datasets > 0 ? `/data/theme/${encodeURIComponent(t.name)}` : "/research"}
                  className="group flex h-full flex-col justify-between gap-6 rounded-lg border border-[#e3e6f0] bg-white p-5 transition-colors hover:border-[#253D9A]"
                >
                  <span className="text-[17px] font-semibold text-[#171a2b] group-hover:text-[#253D9A]">{t.name}</span>
                  <span className="grid gap-0.5 text-[12.5px] text-[#8b8fa3]">
                    {t.datasets > 0 && <span>{t.datasets === 1 ? "1 dataset" : `${t.datasets} datasets`}</span>}
                    {t.publications > 0 && <span>{t.publications === 1 ? "1 publication" : `${t.publications} publications`}</span>}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="border-y border-[#e3e6f0] bg-white">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <SectionIntro label="Research" title="Latest research" action={<Link href="/research" className={homeViewAll}>All research &rarr;</Link>} />
          {!data.research.ok && <LoadError what="our research" />}
          {data.research.ok && data.publications.length === 0 && <NotPublishedYet>Research will be published here soon.</NotPublishedYet>}
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {data.publications.slice(0, 3).map((p) => (
              <Link key={p.slug} href={`/research/${p.slug}`} className="group flex flex-col overflow-hidden rounded-lg border border-[#e3e6f0] bg-white transition-shadow hover:shadow-[0_12px_28px_-16px_rgba(23,26,43,0.35)]">
                {p.cover && <MediaSlot need={{ ...p.cover, ratio: "16:9" }} />}
                <div className="flex flex-1 flex-col gap-3 p-6">
                  <p className={`${homeMono} text-[#253D9A]`}>
                    {p.format} <span className="text-[#8b8fa3]">· {formatPublicationDate(p.date)}</span>
                  </p>
                  <h3 className="text-[18px] leading-snug text-[#171a2b] group-hover:text-[#253D9A]">{p.title}</h3>
                  <p className="line-clamp-3 text-[14px] leading-relaxed text-[#5b6280]">{p.abstract}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <SectionIntro label="Engage" title="Events & campaigns" action={<Link href="/events" className={homeViewAll}>All events &rarr;</Link>} />
        {!data.events.ok && <LoadError what="our events" />}
        {data.events.ok && data.orderedEvents.length === 0 && <NotPublishedYet>Events and campaigns will be published here soon.</NotPublishedYet>}
        {featured && (
          <Link href={`/events/${featured.slug}`} className="group mt-8 grid overflow-hidden rounded-lg border border-[#e3e6f0] bg-white md:grid-cols-[1.2fr_1fr]">
            {featured.image && <EventPoster image={featured.image} card />}
            <div className="grid content-center gap-3 p-7 sm:p-9">
              <p className={`${homeMono} text-[#253D9A]`}>Upcoming {featured.kind}</p>
              <h3 className="text-balance text-[24px] leading-tight text-[#171a2b] group-hover:text-[#253D9A]">{featured.title}</h3>
              <p className="line-clamp-3 text-[14.5px] leading-relaxed text-[#5b6280]">{featured.summary}</p>
              <p className="text-[14px] font-semibold text-[#171a2b]">{[featured.dateLabel, featured.location].filter(Boolean).join(" · ")}</p>
              <span className="text-[13.5px] font-semibold text-[#253D9A]">Event details &rarr;</span>
            </div>
          </Link>
        )}
        <div className="mt-5 grid gap-5 sm:grid-cols-3">
          {restEvents.map((e) => (
            <EventCard key={e.slug} event={e} />
          ))}
        </div>
      </section>

      <section className="border-y border-[#e3e6f0] bg-white">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <SectionIntro label="What we do" title="Our projects" action={<Link href="/projects" className={homeViewAll}>All projects &rarr;</Link>} />
          {!data.projects.ok && <LoadError what="our projects" />}
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {projects.map((p) => (
              <Link key={p.slug} href={`/projects/${p.slug}`} className="group flex flex-col gap-3 border-t-[3px] border-[#253D9A] pt-5">
                {p.stage && <ProjectStageTag stage={p.stage} />}
                <h3 className="text-[18px] leading-snug text-[#171a2b] group-hover:text-[#253D9A]">{p.title}</h3>
                <p className="line-clamp-3 text-[14px] leading-relaxed text-[#5b6280]">{p.blurb}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <ChairmanQuote quote={data.quote} chairman={data.chairman} />
      <PartnersRow partners={data.partners} />
      <ClosingCta band />
    </>
  );
}
