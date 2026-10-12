import type { ReactNode } from "react";
import { org, vision, missionPoints } from "../_content/org";
import { pageMetadata } from "../_lib/seo";
import { BandKicker, DARK_BAND } from "../_ui/kit";
import { load } from "../_lib/api/load";
import { getContentBlock } from "../_lib/api/contentBlocks";
import { listPublications } from "../_lib/api/publications";
import { listDatasets } from "../_lib/api/datasets";
import { listProjects } from "../_lib/api/projects";
import { listEvents } from "../_lib/api/engage";
import { paragraphs } from "../_lib/eventPage";
import { aboutStats, missionTiles } from "../_lib/aboutPage";
import MissionTiles from "./_ui/MissionTiles";
import ExploreCards from "./_ui/ExploreCards";

export const metadata = pageMetadata({
  title: "About PRI",
  description: "Who we are: the Policy and Research Initiative's vision, mission and work for inclusive development, social justice and national integration in Kerala and India.",
  path: "/about",
});

const label = "font-[family-name:var(--font-mono)] text-[11.5px] font-semibold uppercase tracking-[0.14em] text-[#253D9A]";

/** A block's text from the dashboard, or PRI's own copy in `org.ts` when the block is missing or the API is down. */
async function blockText(slug: string, fallback: string): Promise<string> {
  const result = await load(slug, () => getContentBlock(slug));
  return (result.ok && result.data?.body.trim()) || fallback;
}

/** How many of something are published, or undefined when it can't be read (the figure is then left out). */
async function count(what: string, read: () => Promise<unknown[]>): Promise<number | undefined> {
  const result = await load(what, read);
  return result.ok ? result.data.length : undefined;
}

/** "First sentence. The rest." -> the first sentence as the pull quote's lead, the rest beneath it. */
function splitLead(text: string): [string, string] {
  const match = /^(.+?[.!?])\s+([\s\S]+)$/.exec(text.trim());
  return match ? [match[1], match[2]] : [text.trim(), ""];
}

function SectionTitle({ kicker, title }: { kicker: string; title: string }) {
  return (
    <div className="max-w-2xl">
      <p className={`flex items-center gap-2.5 ${label}`}>
        <span aria-hidden="true" className="h-2 w-2 bg-[#253D9A]" />
        {kicker}
      </p>
      <h2 className="mt-4 text-balance font-[family-name:var(--font-heading)] text-3xl leading-tight tracking-tight text-[#171a2b] sm:text-4xl">{title}</h2>
    </div>
  );
}

function Band({ children, white = false }: { children: ReactNode; white?: boolean }) {
  return (
    <section className={white ? "border-y border-[#e3e6f0] bg-white" : ""}>
      <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24">{children}</div>
    </section>
  );
}

export default async function AboutPage() {
  const [statement, whoWeAre, visionText, missionText, publications, datasets, projects, events] = await Promise.all([
    blockText("organization-statement", org.summary),
    blockText("who-we-are", org.intro),
    blockText("our-vision", vision.text),
    blockText("our-mission", missionPoints.join("\n")),
    count("publications", async () => (await listPublications()).publications),
    count("datasets", () => listDatasets()),
    count("projects", () => listProjects()),
    count("events", () => listEvents()),
  ]);
  const [visionLead, visionRest] = splitLead(visionText);
  const tiles = missionTiles(paragraphs(missionText));
  const stats = aboutStats({ publications, datasets, projects, events });

  return (
    <>
      <section className={DARK_BAND}>
        <div className="relative z-10 mx-auto max-w-6xl px-6 pb-16 pt-16 sm:pb-20 sm:pt-20">
          <BandKicker>About PRI</BandKicker>
          <h1 className="mt-5 max-w-4xl text-balance text-[2.5rem] leading-[1.05] tracking-tight text-white sm:text-6xl">{org.tagline}</h1>
          <p className="mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-white/75 sm:text-xl">{statement}</p>
        </div>
      </section>

      <Band>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-16">
          <div>
            <SectionTitle kicker="Our purpose" title="Who we are" />
            <p className="mt-8 text-pretty text-xl leading-relaxed text-[#3a3e56]">{whoWeAre}</p>
          </div>
          <figure className="relative flex flex-col justify-center overflow-hidden rounded-lg bg-[#253D9A] p-8 text-white sm:p-10">
            <span aria-hidden="true" className="pointer-events-none absolute -right-2 -top-10 font-[family-name:var(--font-heading)] text-[11rem] leading-none text-white/10">&ldquo;</span>
            <p className="relative font-[family-name:var(--font-mono)] text-[11.5px] font-semibold uppercase tracking-[0.14em] text-white/60">Our vision</p>
            <blockquote className="relative mt-5">
              <p className="text-pretty font-[family-name:var(--font-heading)] text-2xl leading-snug sm:text-[1.7rem]">{visionLead}</p>
              {visionRest && <p className="mt-4 text-[15.5px] leading-relaxed text-white/75">{visionRest}</p>}
            </blockquote>
          </figure>
        </div>
      </Band>

      {tiles.length > 0 && (
        <Band white>
          <SectionTitle kicker="Our mission" title="What we do" />
          <div className="mt-12">
            <MissionTiles tiles={tiles} />
          </div>
        </Band>
      )}

      {stats.length > 0 && (
        <Band>
          <SectionTitle kicker="By the numbers" title="Our work so far" />
          <dl className={`mt-12 grid gap-8 sm:grid-cols-2 ${stats.length >= 4 ? "lg:grid-cols-4" : stats.length === 3 ? "lg:grid-cols-3" : ""}`}>
            {stats.map((stat) => (
              <div key={stat.label} className="border-t-2 border-[#253D9A] pt-5">
                <dd className="font-[family-name:var(--font-heading)] text-5xl tracking-tight text-[#253D9A] sm:text-6xl">{stat.value}</dd>
                <dt className="mt-2 font-[family-name:var(--font-mono)] text-[12px] font-semibold uppercase tracking-[0.12em] text-[#5b5f74]">{stat.label}</dt>
              </div>
            ))}
          </dl>
        </Band>
      )}

      <Band white>
        <SectionTitle kicker="Explore further" title="Get to know PRI" />
        <div className="mt-12">
          <ExploreCards />
        </div>
      </Band>
    </>
  );
}
