import Link from "next/link";
import type { HomeData } from "../../_lib/home/homeData";
import { formatPublicationDate } from "../../_lib/api/publicationAdapter";
import { LoadError, NotPublishedYet } from "../../_ui/ApiMessage";
import HomeSlider from "../../_ui/home/HomeSlider";
import { ChairmanQuote, ClosingCta, dateParts, homeMono, homeViewAll, PartnersRow, SectionIntro } from "../../_ui/home/sections";
import MediaSlot from "../../_ui/MediaSlot";
import ProjectStageTag from "../../_ui/ProjectStageTag";
import Byline from "../../research/_ui/Byline";

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

/** B. Think-tank split (after ORF, Centre for Policy Research, Takshashila): photo beside a blue panel, then an editorial index. */
export default function HomeB({ data }: { data: HomeData }) {
  const projects = data.projects.ok ? data.projects.data : [];
  const events = data.orderedEvents.slice(0, 4);

  return (
    <>
      <HomeSlider slides={data.slides} layout="split" />

      <section className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-[1fr_20rem] lg:gap-16">
          <div>
            <SectionIntro label="Research" title="Latest research" action={<Link href="/research" className={homeViewAll}>All research &rarr;</Link>} />
            {!data.research.ok && <LoadError what="our research" />}
            {data.research.ok && data.publications.length === 0 && <NotPublishedYet>Research will be published here soon.</NotPublishedYet>}
            <ul className="mt-8 divide-y divide-[#e3e6f0] border-t border-[#e3e6f0]">
              {data.publications.slice(0, 4).map((p) => (
                <li key={p.slug}>
                  <Link href={`/research/${p.slug}`} className="group grid gap-5 py-7 sm:grid-cols-[13rem_1fr]">
                    {p.cover ? (
                      <div className="overflow-hidden rounded-md border border-[#e3e6f0]">
                        <MediaSlot need={{ ...p.cover, ratio: "4:3" }} />
                      </div>
                    ) : (
                      <div aria-hidden="true" className="hidden aspect-[4/3] rounded-md bg-[#eef1fb] sm:block" />
                    )}
                    <div className="grid content-start gap-2.5">
                      <p className={`${homeMono} text-[#253D9A]`}>
                        {p.format}
                        {p.theme && <span className="text-[#8b8fa3]"> · {p.theme}</span>}
                        <span className="text-[#8b8fa3]"> · {formatPublicationDate(p.date)}</span>
                      </p>
                      <h3 className="text-balance text-[21px] leading-snug text-[#171a2b] group-hover:text-[#253D9A]">{p.title}</h3>
                      <p className="line-clamp-2 text-[14.5px] leading-relaxed text-[#5b6280]">{p.abstract}</p>
                      <span className="text-[13px] text-[#5b6280]">
                        <Byline size={24} people={p.authors.map((slug) => data.authors[slug]).filter((a) => a !== undefined)} />
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {data.themes.length > 0 && (
            <aside className="lg:pt-[5.5rem]">
              <h2 className={`${homeMono} border-b-[3px] border-[#253D9A] pb-3 text-[#171a2b]`}>Areas of work</h2>
              <ul className="divide-y divide-[#e3e6f0]">
                {data.themes.map((t) => (
                  <li key={t.name}>
                    <Link href={t.datasets > 0 ? `/data/theme/${encodeURIComponent(t.name)}` : "/research"} className="group flex items-baseline justify-between gap-4 py-4">
                      <span className="text-[16px] font-semibold text-[#171a2b] group-hover:text-[#253D9A]">{t.name}</span>
                      <span className="shrink-0 text-right text-[12.5px] text-[#8b8fa3]">
                        {[t.publications > 0 && plural(t.publications, "study", "studies"), t.datasets > 0 && plural(t.datasets, "dataset", "datasets")].filter(Boolean).join(" · ")}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
              <Link href="/data" className={`mt-4 inline-block ${homeViewAll}`}>
                Browse the data &rarr;
              </Link>
            </aside>
          )}
        </div>
      </section>

      <section className="border-y border-[#e3e6f0] bg-white">
        <div className="mx-auto grid max-w-6xl gap-14 px-6 py-16 sm:py-20 lg:grid-cols-2">
          <div>
            <SectionIntro label="What we do" title="Our projects" action={<Link href="/projects" className={homeViewAll}>All &rarr;</Link>} />
            {!data.projects.ok && <LoadError what="our projects" />}
            {data.projects.ok && projects.length === 0 && <NotPublishedYet>Projects will be published here soon.</NotPublishedYet>}
            <ul className="mt-8 divide-y divide-[#e3e6f0] border-y border-[#e3e6f0]">
              {projects.map((p) => (
                <li key={p.slug}>
                  <Link href={`/projects/${p.slug}`} className="group grid gap-2 py-5">
                    {p.stage && <ProjectStageTag stage={p.stage} />}
                    <span className="flex items-start justify-between gap-4 text-[17px] font-semibold leading-snug text-[#171a2b] group-hover:text-[#253D9A]">
                      {p.title}
                      <span aria-hidden="true" className="text-[#253D9A]">&rarr;</span>
                    </span>
                    <span className="line-clamp-2 text-[14px] leading-relaxed text-[#5b6280]">{p.blurb}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <SectionIntro label="Engage" title="Events & campaigns" action={<Link href="/events" className={homeViewAll}>All &rarr;</Link>} />
            {!data.events.ok && <LoadError what="our events" />}
            {data.events.ok && events.length === 0 && <NotPublishedYet>Events and campaigns will be published here soon.</NotPublishedYet>}
            <ul className="mt-8 divide-y divide-[#e3e6f0] border-y border-[#e3e6f0]">
              {events.map((e) => {
                const date = dateParts(e);
                return (
                  <li key={e.slug}>
                    <Link href={`/events/${e.slug}`} className="group grid grid-cols-[4.5rem_1fr] gap-5 py-5">
                      <span className={`grid h-[4.5rem] place-content-center rounded-md text-center ${e.timing === "upcoming" ? "bg-[#253D9A] text-white" : "bg-[#eef1fb] text-[#253D9A]"}`}>
                        {date ? (
                          <>
                            <span className="font-[family-name:var(--font-heading)] text-[26px] leading-none">{date.day}</span>
                            <span className="mt-1 font-[family-name:var(--font-mono)] text-[10.5px] font-semibold uppercase tracking-[0.1em]">
                              {date.month} {date.year.slice(2)}
                            </span>
                          </>
                        ) : (
                          <span className="font-[family-name:var(--font-mono)] text-[10.5px] font-semibold uppercase tracking-[0.1em]">TBA</span>
                        )}
                      </span>
                      <span className="grid content-center gap-1.5">
                        <span className={`${homeMono} ${e.timing === "upcoming" ? "text-[#253D9A]" : "text-[#8b8fa3]"}`}>{e.timing === "upcoming" ? `Upcoming ${e.kind}` : e.kind}</span>
                        <span className="text-[16px] font-semibold leading-snug text-[#171a2b] group-hover:text-[#253D9A]">{e.title}</span>
                        <span className="text-[13px] text-[#8b8fa3]">{[date ? null : e.dateLabel, e.location].filter(Boolean).join(" · ")}</span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </section>

      <ChairmanQuote quote={data.quote} chairman={data.chairman} />
      <PartnersRow partners={data.partners} />
      <ClosingCta />
    </>
  );
}
