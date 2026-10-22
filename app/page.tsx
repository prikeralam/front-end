import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { mottoSlide } from "./_content/projects";
import { load } from "./_lib/api/load";
import { getContentBlock } from "./_lib/api/contentBlocks";
import { listEvents } from "./_lib/api/engage";
import { listPartners, listPeopleByGroup } from "./_lib/api/people";
import { listProjects } from "./_lib/api/projects";
import { listPublications } from "./_lib/api/publications";
import { listThemes } from "./_lib/api/themes";
import { LoadError, NotPublishedYet } from "./_ui/ApiMessage";
import { StatusTag } from "./_ui/kit";
import MediaSlot from "./_ui/MediaSlot";
import ThemeOrbit from "./_ui/home/ThemeOrbit";
import ProjectStageTag from "./_ui/ProjectStageTag";
import ThemePanel from "./_ui/home/ThemePanel";
import EventCard from "./events/_ui/EventCard";
import JsonLd from "./_ui/JsonLd";
import { DEFAULT_DESCRIPTION, organizationJsonLd, pageMetadata, SITE_NAME, websiteJsonLd } from "./_lib/seo";

/** Themes left out of the hero orbit (they still exist everywhere else). */
const ORBIT_EXCLUDED_THEMES = new Set(["Economics", "Employment"]);

const eyebrow = "flex items-center gap-2.5 font-[family-name:var(--font-mono)] text-[11.5px] font-semibold uppercase tracking-[0.14em] text-[#253D9A]";
const primaryButton = "inline-flex items-center gap-2 rounded-md bg-[#253D9A] px-5 py-3 text-sm font-semibold text-white shadow-[0_1px_2px_rgba(37,61,154,0.3)] transition-colors hover:bg-[#1B2C70]";
const secondaryButton = "inline-flex items-center gap-2 rounded-md border border-[#cdd6f3] bg-white/70 px-5 py-3 text-sm font-semibold text-[#253D9A] transition-colors hover:border-[#253D9A] hover:bg-white";
const viewAll = "text-sm font-semibold text-[#253D9A] hover:underline";

function SectionIntro({ label, title, action }: { label: string; title: string; action?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="grid gap-3">
        <p className={eyebrow}>
          <span aria-hidden="true" className="h-2 w-2 bg-[#253D9A]" />
          {label}
        </p>
        <h2 className="text-balance text-[28px] leading-tight text-[#171a2b] sm:text-[34px]">{title}</h2>
      </div>
      {action}
    </div>
  );
}

/** Keeps hyphenated words ("Evidence-based") on one line; the browser would otherwise break after the hyphen. */
function KeepHyphenated({ text }: { text: string }) {
  return (
    <>
      {text.split(" ").map((word, i) => (
        <span key={i}>
          {i > 0 && " "}
          {word.includes("-") ? <span className="whitespace-nowrap">{word}</span> : word}
        </span>
      ))}
    </>
  );
}

/** "Data-driven research. Evidence-based policy." -> the last sentence gets the accent treatment. */
function splitHeadline(title: string): [string, string] {
  const sentences = title.match(/[^.!?]+[.!?]*/g)?.map((s) => s.trim()) ?? [title];
  return sentences.length > 1 ? [sentences.slice(0, -1).join(" "), sentences[sentences.length - 1]] : ["", title];
}

export const metadata = {
  ...pageMetadata({ title: `${SITE_NAME} (PRI)`, description: DEFAULT_DESCRIPTION, path: "/" }),
  // The full name leads, and the template's " | Policy and Research Initiative" would only repeat it.
  title: { absolute: `${SITE_NAME} (PRI) | Think tank in Kerala` },
};

export default async function HomePage() {
  const [projects, research, themes, partners, executive, heroBlock, quoteBlock, events] = await Promise.all([
    load("projects", listProjects),
    load("research", listPublications),
    load("themes", listThemes),
    load("partners", listPartners),
    load("executive council", () => listPeopleByGroup("executive")),
    load("hero", () => getContentBlock("hero")),
    load("quote", () => getContentBlock("chairman-quote")),
    load("events", listEvents),
  ]);
  // What's coming up first (soonest first), then the most recent past ones.
  const allEvents = events.ok ? events.data : [];
  const featuredEvents = [...allEvents.filter((e) => e.timing === "upcoming").reverse(), ...allEvents.filter((e) => e.timing === "past")].slice(0, 3);

  const featuredResearch = research.ok ? research.data.publications.slice(0, 3) : [];
  const orbitThemes = themes.ok
    ? themes.data.filter((t) => (t.parent === null || t.parent === undefined) && !ORBIT_EXCLUDED_THEMES.has(t.name)).map((t) => t.name)
    : [];
  const hero = heroBlock.ok && heroBlock.data ? { title: heroBlock.data.title, blurb: heroBlock.data.body } : mottoSlide;
  const [headLead, headAccent] = splitHeadline(hero.title);
  const chairman = executive.ok ? executive.data.find((p) => /^chairman$/i.test(p.role.trim())) : undefined;
  const quote = quoteBlock.ok ? quoteBlock.data : null;
  const institutions = partners.ok ? partners.data : [];


  return (
    <>
      <JsonLd data={[organizationJsonLd(), websiteJsonLd()]} />
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-[#e3e6f0] bg-[radial-gradient(1000px_520px_at_88%_4%,rgba(37,61,154,0.10),transparent_62%),radial-gradient(760px_460px_at_0%_100%,rgba(37,61,154,0.05),transparent_60%)] after:pointer-events-none after:absolute after:inset-0 after:bg-[radial-gradient(circle,rgba(37,61,154,0.14)_1px,transparent_1.4px)] after:bg-[length:28px_28px] after:[mask-image:linear-gradient(100deg,transparent_45%,#000_90%)]">
        <div className="pri-motion relative z-10 mx-auto grid max-w-6xl items-center gap-12 px-6 py-16 md:grid-cols-[1.05fr_0.95fr] md:py-20">
          <div className="grid justify-items-start gap-6">
            <h1 className="max-w-[15ch] animate-[pri-rise_700ms_cubic-bezier(.22,1,.36,1)_60ms_both] text-balance text-[40px] leading-[1.04] tracking-tight text-[#171a2b] sm:text-[56px]">
              {headLead && <><KeepHyphenated text={headLead} /> </>}
              <span className="animate-[pri-glint_7s_ease-in-out_1.5s_infinite] bg-[linear-gradient(105deg,#253D9A_40%,#8fa6ff_50%,#253D9A_60%)] bg-[length:250%_100%] bg-[position:100%_0] bg-no-repeat bg-clip-text text-transparent">
                <KeepHyphenated text={headAccent} />
              </span>
            </h1>
            <p className="max-w-[46ch] animate-[pri-rise_700ms_cubic-bezier(.22,1,.36,1)_160ms_both] text-pretty text-[17px] leading-relaxed text-[#4b4f66]">{hero.blurb}</p>
            <div className="flex animate-[pri-rise_700ms_cubic-bezier(.22,1,.36,1)_260ms_both] flex-wrap gap-3">
              <Link href="/research" className={primaryButton}>
                Explore our research <span aria-hidden="true">&rarr;</span>
              </Link>
              <Link href="/data" className={secondaryButton}>
                Browse the data
              </Link>
            </div>
          </div>
          {orbitThemes.length > 0 && (
            <div>
              <ThemeOrbit themes={orbitThemes} />
              <p className="sr-only">Research themes: {orbitThemes.join(", ")}.</p>
            </div>
          )}
        </div>
      </section>


      {/* What we do */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <SectionIntro label="What we do" title="Projects" action={<Link href="/projects" className={viewAll}>All projects &rarr;</Link>} />
        {!projects.ok && <LoadError what="our projects" />}
        {projects.ok && projects.data.length === 0 && <NotPublishedYet>Projects will be published here soon.</NotPublishedYet>}
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {(projects.ok ? projects.data : []).map((p, i) => (
            <Link
              key={p.slug}
              href={`/projects/${p.slug}`}
              className="group flex flex-col overflow-hidden rounded-lg border border-[#e3e6f0] bg-white transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1 hover:border-[#cdd6f3] hover:shadow-[0_16px_32px_-18px_rgba(23,26,43,0.4)] motion-reduce:hover:translate-y-0"
            >
              <ThemePanel slug={p.slug} index={i} />
              <div className="flex flex-1 flex-col gap-2 p-6">
                {p.stage && <ProjectStageTag stage={p.stage} />}
                <h3 className="text-[20px] leading-snug text-[#171a2b]">{p.title}</h3>
                <p className="flex-1 text-[14.5px] leading-relaxed text-[#5b6280]">{p.blurb}</p>
                <span className="mt-2 inline-flex items-center gap-1 text-[13.5px] font-semibold text-[#253D9A]">
                  Explore project <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">&rarr;</span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured research */}
      <section className="border-y border-[#e3e6f0] bg-white">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <SectionIntro label="Research" title="Featured Research" action={<Link href="/research" className={viewAll}>View all research &rarr;</Link>} />
          {!research.ok && <LoadError what="our research" />}
          {research.ok && featuredResearch.length === 0 && <NotPublishedYet>Research will be published here soon.</NotPublishedYet>}
          <div className="mt-8 grid gap-5 sm:grid-cols-3">
            {featuredResearch.map((p) => (
              <Link key={p.slug} href={`/research/${p.slug}`} className="block overflow-hidden rounded-lg border border-[#e3e6f0] bg-white transition-shadow hover:shadow-[0_12px_28px_-16px_rgba(23,26,43,0.35)]">
                {p.cover && <MediaSlot need={p.cover} />}
                <div className="p-6">
                  <span className="inline-block w-fit rounded bg-[#253D9A]/8 px-2 py-0.5 font-[family-name:var(--font-mono)] text-[11px] font-semibold uppercase tracking-[0.08em] text-[#253D9A]">{p.format}</span>
                  <h3 className="mt-4 flex items-start gap-2 text-[17px] leading-snug text-[#22263a]">{p.title} <StatusTag status={p.status} /></h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>


      {/* Chairman's words: shown only once the content block is published, never invented. */}
      {quote && chairman && (
        <section className="bg-[#171a2b] text-white">
          {/* Edge to edge, but kept short: compact padding and a small portrait. */}
          <div className="mx-auto grid max-w-6xl items-center gap-8 px-6 py-10 md:grid-cols-[1fr_auto] md:gap-12 md:py-12">
            <figure className="grid max-w-[62ch] gap-5">
              <span aria-hidden="true" className="h-8 font-[family-name:var(--font-heading)] text-[72px] leading-[0.8] text-[#8fa6ff]">&ldquo;</span>
              {quote.title && <p className="text-balance font-[family-name:var(--font-heading)] text-[24px] leading-tight sm:text-[30px]">{quote.title}</p>}
              <blockquote className="text-pretty text-[15.5px] leading-relaxed text-white/75">{quote.body}</blockquote>
              <figcaption className="border-l-2 border-[#8fa6ff] pl-4">
                <span className="block text-[15px] font-semibold">{chairman.name}</span>
                <span className="font-[family-name:var(--font-mono)] text-[11.5px] uppercase tracking-[0.08em] text-white/55">{chairman.role}, Policy and Research Initiative</span>
              </figcaption>
            </figure>
            {chairman.photo?.src && (
              <div className="relative mx-auto aspect-[4/5] w-full max-w-[240px] overflow-hidden rounded-lg md:w-[240px]">
                <Image src={chairman.photo.src} alt={`Portrait of ${chairman.name}`} fill sizes="240px" className="object-cover object-top grayscale" />
              </div>
            )}
          </div>
        </section>
      )}

      {/* Featured events */}
      <section className="border-y border-[#e3e6f0] bg-white">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <SectionIntro label="Engage" title="Featured Events & Campaigns" action={<Link href="/events" className={viewAll}>View all events &rarr;</Link>} />
          {!events.ok && <LoadError what="our events" />}
          {events.ok && featuredEvents.length === 0 && <NotPublishedYet>Events and campaigns will be published here soon.</NotPublishedYet>}
          <div className="mt-8 grid gap-5 sm:grid-cols-3">
            {featuredEvents.map((e) => <EventCard key={e.slug} event={e} />)}
          </div>
        </div>
      </section>

      {/* Partners */}
      {institutions.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 py-14">
          <SectionIntro label="Partners" title="Working with" action={<Link href="/partners" className={viewAll}>All partners &rarr;</Link>} />
          <ul className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
            {institutions.map((p) => (
              <li key={p.slug}>
                <Link
                  href={p.website ?? "/partners"}
                  {...(p.website ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="group flex h-full flex-col items-center justify-center gap-3 rounded-lg border border-[#e3e6f0] bg-white px-4 py-6 text-center transition-colors hover:border-[#cdd6f3]"
                >
                  {p.logo?.src && (
                    <span className="relative block h-14 w-full">
                      <Image src={p.logo.src} alt={`${p.name} logo`} fill sizes="200px" className="object-contain opacity-70 grayscale transition-[filter,opacity] duration-300 group-hover:opacity-100 group-hover:grayscale-0" />
                    </span>
                  )}
                  <span className="text-[13px] font-semibold leading-snug text-[#4b4f66] group-hover:text-[#253D9A]">{p.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Closing call to action */}
      <section className="relative overflow-hidden border-t border-[#e3e6f0] bg-[radial-gradient(760px_380px_at_86%_-10%,rgba(37,61,154,0.12),transparent_62%),radial-gradient(560px_340px_at_2%_110%,rgba(37,61,154,0.07),transparent_62%)]">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-8 px-6 py-16 md:py-20">
          <div className="grid max-w-xl gap-3">
            <h2 className="text-balance text-[30px] leading-tight text-[#171a2b] sm:text-[38px]">Do you want to work with us?</h2>
            <p className="text-[16px] leading-relaxed text-[#4b4f66]">We are always glad to hear from researchers, institutions and people who want to join our team.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/careers" className={primaryButton}>
              Work with us <span aria-hidden="true">&rarr;</span>
            </Link>
            <Link href="/contact" className={secondaryButton}>
              Partner with us
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
