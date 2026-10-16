import Link from "next/link";
import type { HomeData } from "../../_lib/home/homeData";
import { formatPublicationDate } from "../../_lib/api/publicationAdapter";
import { LoadError, NotPublishedYet } from "../../_ui/ApiMessage";
import HomeSlider from "../../_ui/home/HomeSlider";
import { ChairmanQuote, ClosingCta, homeMono, homeViewAll, PartnersRow, SectionIntro } from "../../_ui/home/sections";
import MediaSlot from "../../_ui/MediaSlot";
import ProjectStageTag from "../../_ui/ProjectStageTag";
import Byline from "../../research/_ui/Byline";

/** A. Institutional (after Brookings, Chatham House, Carnegie): full-bleed photographs, then one feed of the latest work. */
export default function HomeA({ data }: { data: HomeData }) {
  const [lead, ...moreResearch] = data.publications;
  const feed = [
    ...moreResearch.slice(0, 2).map((p) => ({ key: `r-${p.slug}`, href: `/research/${p.slug}`, kind: p.format, title: p.title, when: formatPublicationDate(p.date) })),
    ...data.orderedEvents.slice(0, 3).map((e) => ({
      key: `e-${e.slug}`,
      href: `/events/${e.slug}`,
      kind: `${e.timing === "upcoming" ? "Upcoming" : "Past"} ${e.kind}`,
      title: e.title,
      when: e.dateLabel,
    })),
  ].slice(0, 4);
  const projects = data.projects.ok ? data.projects.data : [];

  return (
    <>
      <HomeSlider slides={data.slides} layout="overlay" />

      <section className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
        <SectionIntro label="Latest from PRI" title="New research and events" action={<Link href="/research" className={homeViewAll}>All research &rarr;</Link>} />
        {!data.research.ok && <LoadError what="our research" />}
        {data.research.ok && !lead && <NotPublishedYet>Research will be published here soon.</NotPublishedYet>}
        {lead && (
          <div className="mt-10 grid gap-10 lg:grid-cols-[1.35fr_1fr] lg:gap-14">
            <Link href={`/research/${lead.slug}`} className="group grid content-start gap-5">
              {lead.cover && (
                <div className="overflow-hidden rounded-lg border border-[#e3e6f0]">
                  <MediaSlot need={{ ...lead.cover, ratio: "16:9" }} />
                </div>
              )}
              <p className={`${homeMono} text-[#253D9A]`}>
                {lead.format} <span className="text-[#8b8fa3]">· {formatPublicationDate(lead.date)}</span>
              </p>
              <h3 className="text-balance text-[26px] leading-tight text-[#171a2b] group-hover:text-[#253D9A] sm:text-[30px]">{lead.title}</h3>
              <p className="max-w-[62ch] text-pretty text-[15.5px] leading-relaxed text-[#4b4f66]">{lead.abstract}</p>
              <span className="text-[13.5px] text-[#5b6280]">
                <Byline people={lead.authors.map((slug) => data.authors[slug]).filter((p) => p !== undefined)} />
              </span>
            </Link>
            <ol className="grid content-start divide-y divide-[#e3e6f0] border-y border-[#e3e6f0]">
              {feed.map((item) => (
                <li key={item.key}>
                  <Link href={item.href} className="group grid gap-2 py-5">
                    <span className={`${homeMono} text-[#253D9A]`}>{item.kind}</span>
                    <span className="text-[17px] font-semibold leading-snug text-[#171a2b] group-hover:text-[#253D9A]">{item.title}</span>
                    <span className="text-[13px] text-[#8b8fa3]">{item.when}</span>
                  </Link>
                </li>
              ))}
              <li className="py-5">
                <Link href="/events" className={homeViewAll}>
                  All events &amp; campaigns &rarr;
                </Link>
              </li>
            </ol>
          </div>
        )}
      </section>

      <section className="border-y border-[#e3e6f0] bg-white">
        <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
          <SectionIntro label="What we do" title="Our projects" action={<Link href="/projects" className={homeViewAll}>All projects &rarr;</Link>} />
          {!data.projects.ok && <LoadError what="our projects" />}
          {data.projects.ok && projects.length === 0 && <NotPublishedYet>Projects will be published here soon.</NotPublishedYet>}
          <div className="mt-10 grid gap-px overflow-hidden rounded-lg border border-[#e3e6f0] bg-[#e3e6f0] md:grid-cols-3">
            {projects.map((p, i) => (
              <Link key={p.slug} href={`/projects/${p.slug}`} className="group flex flex-col gap-4 bg-white p-7 transition-colors hover:bg-[#f7f8fc]">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-[family-name:var(--font-heading)] text-[34px] leading-none text-[#cdd6f3] group-hover:text-[#253D9A]">{String(i + 1).padStart(2, "0")}</span>
                  {p.stage && <ProjectStageTag stage={p.stage} />}
                </div>
                <h3 className="text-[19px] leading-snug text-[#171a2b]">{p.title}</h3>
                <p className="line-clamp-4 flex-1 text-[14.5px] leading-relaxed text-[#5b6280]">{p.blurb}</p>
                <span className="text-[13.5px] font-semibold text-[#253D9A]">Explore project &rarr;</span>
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
