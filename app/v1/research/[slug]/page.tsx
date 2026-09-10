import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { publications } from "../../../_content/publications";
import { people } from "../../../_content/people";
import { stockPhotoFor } from "../../../_lib/stockPhotos";
import { dataStories, educationCharts, demographyCharts, healthCharts, migrationCharts } from "../../../_content/dataStories";
import { HBarChart, GroupedBarChart, DivergingBarChart, ScatterChart, LineChart, VBarChart, HBarSimpleChart, type ChartPalette } from "../../../_lib/dataStoryCharts";
import { PageHeader, SectionHeading, StatusTag } from "../../_ui/kit";
import MediaSlot from "../../_ui/MediaSlot";

export function generateStaticParams() {
  return publications.map((p) => ({ slug: p.slug }));
}

const palette: ChartPalette = {
  primary: "#253D9A",
  secondary: "#C9972C",
  text: "#171a2b",
  textSoft: "#4b4f66",
  grid: "#e6e8f0",
  fontFamily: "Inter, sans-serif",
};
const neutralGrey = "#c9c3b4";

function sortAsc(labels: string[], values: number[]) {
  const order = labels.map((l, i) => ({ l, v: values[i] })).sort((a, b) => a.v - b.v);
  return { labels: order.map((o) => o.l), values: order.map((o) => o.v) };
}

function Figure({ children, caption }: { children: ReactNode; caption: string }) {
  return (
    <div className="mt-6">
      <div className="border border-[#253D9A]/12 p-3">{children}</div>
      <p className="mt-2 text-sm italic text-[#8b8fa3]">{caption}</p>
    </div>
  );
}

function Prose({ children }: { children: ReactNode }) {
  return <p className="mt-4 text-[15px] leading-relaxed text-[#4b4f66]">{children}</p>;
}

function StoryBody({ slug }: { slug: string }) {
  const story = dataStories[slug];

  const charts: Record<string, ReactNode[]> = {
    "malappuram-classrooms": (() => {
      const batch = sortAsc(educationCharts.districts, educationCharts.perBatch);
      const science = sortAsc(educationCharts.districts, educationCharts.sciencePct);
      return [
        <Figure key="c1" caption="Malappuram's average batch size is nearly double Pathanamthitta's, and the only district above 60 students per batch alongside Wayanad and Kasargode.">
          <HBarChart id="chart-batch-v1" labels={batch.labels} values={batch.values} palette={palette} xTitle="Students per Plus One batch" refLines={[{ x: educationCharts.keralaAvgBatch, label: "All-Kerala avg: 54" }]} invertGradient />
        </Figure>,
        <Figure key="c2" caption="Malappuram and Kasargode offer the smallest share of science batches in Kerala — roughly 9 to 11 percentage points below the state average.">
          <HBarChart id="chart-science-v1" labels={science.labels} values={science.values} palette={palette} xTitle="Share of batches that are Science stream (%)" refLines={[{ x: educationCharts.keralaAvgScience, label: "All-Kerala avg: 51%" }]} />
        </Figure>,
        <Figure key="c3" caption="Each point is a district. Larger average batch size tracks with a smaller share of science batches — Malappuram sits at the crowded, science-scarce end of the line.">
          <ScatterChart
            id="chart-scatter-v1"
            palette={palette}
            xTitle="Students per batch"
            yTitle="Science batches (%)"
            points={educationCharts.districts.map((d, i) => ({ label: d, x: educationCharts.perBatch[i], y: educationCharts.sciencePct[i], highlight: educationCharts.scatterHighlight.includes(d) }))}
          />
        </Figure>,
        <Figure key="c4" caption="Malappuram's Plus One demand is projected to stay above 82,000 in eight of the ten years to 2036, easing meaningfully only in the final two years.">
          <LineChart
            id="chart-forecast-v1"
            palette={palette}
            x={educationCharts.forecastYears}
            y={educationCharts.forecastVals}
            xTitle="Year"
            yTitle="Expected Plus One aspirants, Malappuram"
            yRange={[74000, 89000]}
            baseline={84265}
            callouts={[
              { x: 2027, y: 84265, text: "84,265" },
              { x: 2036, y: 77442, text: "77,442" },
              { x: 2033, y: 86106, text: "peak: 86,106", color: palette.text, ay: -24 },
            ]}
          />
        </Figure>,
      ];
    })(),

    "kerala-population-mix": [
      <Figure key="c1" caption="Most of Muslims' 3.3-point share increase is mirrored by Hindus' 2.7-point decline, with Christians accounting for a smaller share of the shift (−0.7 points).">
        <GroupedBarChart
          id="chart-share-v1"
          palette={palette}
          categories={["Hindu", "Muslim", "Christian"]}
          series={[
            { name: "2011 (Census)", values: demographyCharts.groups2011, color: neutralGrey },
            { name: "2024 (est.)", values: demographyCharts.groups2024, color: [palette.primary, palette.secondary, palette.primary] },
          ]}
          yTitle="Share of Kerala population (%)"
          yRange={[0, 60]}
        />
      </Figure>,
      <Figure key="c2" caption="Each religion's share of Kerala's population changes by age bracket — Muslims are the youngest-skewing group, Hindus the oldest-skewing.">
        <GroupedBarChart
          id="chart-age-v1"
          palette={palette}
          categories={["Under 18", "18–40", "40+"]}
          series={[
            { name: "Hindu", values: demographyCharts.ageHindu, color: palette.primary },
            { name: "Muslim", values: demographyCharts.ageMuslim, color: palette.secondary },
            { name: "Christian", values: demographyCharts.ageChristian, color: palette.textSoft },
          ]}
          yTitle="Share of age bracket (%)"
          yRange={[0, 65]}
          xTitle="Age bracket"
        />
      </Figure>,
      <Figure key="c3" caption="Percentage points above or below each group's own overall 2024 population share, by age bracket — Muslims' under-18 over-representation and over-40 under-representation are both the largest of the three groups.">
        <DivergingBarChart
          id="chart-representation-v1"
          palette={palette}
          groups={["Hindu", "Muslim", "Christian"]}
          series={[
            {
              name: "Under-18 bracket",
              values: [demographyCharts.ageHindu[0] - demographyCharts.groups2024[0], demographyCharts.ageMuslim[0] - demographyCharts.groups2024[1], demographyCharts.ageChristian[0] - demographyCharts.groups2024[2]],
              colors: [palette.primary, palette.secondary, palette.textSoft],
              opacity: 0.55,
            },
            {
              name: "40+ bracket",
              values: [demographyCharts.ageHindu[2] - demographyCharts.groups2024[0], demographyCharts.ageMuslim[2] - demographyCharts.groups2024[1], demographyCharts.ageChristian[2] - demographyCharts.groups2024[2]],
              colors: [palette.primary, palette.secondary, palette.textSoft],
            },
          ]}
          xTitle="Percentage points vs. own 2024 overall share"
        />
      </Figure>,
      <Figure key="c4" caption="Annual Muslim births in Kerala fell by more than a quarter between 2014 and 2024.">
        <VBarChart
          id="chart-births-v1"
          palette={palette}
          labels={["2014", "2024"]}
          values={[demographyCharts.births2014, demographyCharts.births2024]}
          colors={[palette.primary, palette.secondary]}
          yTitle="Annual births, Kerala Muslim families"
          yRange={[0, 250000]}
          note={{ text: "−27% (−59,349 births)", x: 0.5, y: 235000 }}
        />
      </Figure>,
    ],

    "kerala-healthcare-gap": (() => {
      const phc = sortAsc(healthCharts.phc.districts, healthCharts.phc.values);
      const bed = sortAsc(healthCharts.bed.districts, healthCharts.bed.values);
      const doctor = sortAsc(healthCharts.doctor.districts, healthCharts.doctor.values);
      return [
        <Figure key="c1" caption="Every district exceeds Kerala's 3,000-per-PHC policy target by a wide margin, but Malappuram and Kozhikode exceed even the statewide average of 36,303.">
          <HBarChart
            id="chart-phc-v1"
            palette={palette}
            labels={phc.labels}
            values={phc.values}
            xTitle="People per Primary Health Centre"
            invertGradient
            refLines={[
              { x: healthCharts.phc.keralaAvg, label: "Kerala avg: 36,303" },
              { x: healthCharts.phc.policyTarget, label: "GOK policy target: 3,000", labelAtBottom: true, color: palette.primary },
            ]}
          />
        </Figure>,
        <Figure key="c2" caption="Malappuram's population-per-bed ratio is roughly double the Kerala average of 928; Pathanamthitta's is little more than half of it.">
          <HBarChart id="chart-bed-v1" palette={palette} labels={bed.labels} values={bed.values} xTitle="People per government-hospital bed" invertGradient refLines={[{ x: healthCharts.bed.keralaAvg, label: "Kerala average: 928" }]} />
        </Figure>,
        <Figure key="c3" caption="The doctor-access gap between the best- and worst-served districts is close to 2-to-1: 3,754 people per doctor in Pathanamthitta versus 7,437 in Malappuram.">
          <HBarChart id="chart-doctor-v1" palette={palette} labels={doctor.labels} values={doctor.values} xTitle="People per government-hospital doctor" invertGradient />
        </Figure>,
        <Figure key="c4" caption="Malappuram and Pathanamthitta anchor opposite ends of all three indicators — the gap isn't confined to one part of the health system.">
          <GroupedBarChart
            id="chart-compare-v1"
            palette={palette}
            categories={["Per PHC", "Per bed", "Per doctor"]}
            series={[
              { name: "Malappuram", values: healthCharts.compare.malappuram, color: palette.secondary },
              { name: "Kerala reference*", values: healthCharts.compare.reference, color: neutralGrey },
              { name: "Pathanamthitta", values: healthCharts.compare.pathanamthitta, color: palette.primary },
            ]}
            yTitle="People per unit"
          />
        </Figure>,
      ];
    })(),

    "kerala-gulf-migration": (() => {
      const jobs = sortAsc(migrationCharts.jobs, migrationCharts.jobVals);
      return [
        <Figure key="c1" caption="Hindus are under-represented among emigrants by 18 points; Muslims are over-represented by 12.6 points and Christians by 5.4 points.">
          <GroupedBarChart
            id="chart-share-mig-v1"
            palette={palette}
            categories={["Hindu", "Muslim", "Christian", "Others"]}
            series={[
              { name: "Total population", values: migrationCharts.totalPop, color: neutralGrey },
              { name: "Emigrant population", values: migrationCharts.emigrantPop, color: [palette.primary, palette.secondary, palette.primary, palette.textSoft] },
            ]}
            yTitle="Share (%)"
            yRange={[0, 60]}
          />
        </Figure>,
        <Figure key="c2" caption="Muslims show the largest positive gap between emigrant share and population share of any group in Kerala.">
          <DivergingBarChart
            id="chart-representation-mig-v1"
            palette={palette}
            groups={["Hindu", "Muslim", "Christian", "Others"]}
            series={[{ name: "", values: migrationCharts.emigrantPop.map((v, i) => v - migrationCharts.totalPop[i]), colors: [palette.primary, palette.secondary, palette.primary, palette.textSoft] }]}
            xTitle="Emigrant share minus population share (points)"
          />
        </Figure>,
        <Figure key="c3" caption="Muslim emigrants are the most concentrated on Gulf destinations of any religious group in Kerala — 22 points above the Christian figure.">
          <VBarChart
            id="chart-gulf-v1"
            palette={palette}
            labels={migrationCharts.gulf.labels}
            values={migrationCharts.gulf.values}
            colors={[palette.primary, palette.primary, palette.textSoft, palette.secondary]}
            yTitle="Share of emigrants going to the Gulf (%)"
            yRange={[0, 110]}
          />
        </Figure>,
        <Figure key="c4" caption="Sales and driving roles alone account for nearly 39% of Muslim migrants' occupations in the Gulf.">
          <HBarSimpleChart id="chart-occupation-v1" palette={palette} labels={jobs.labels} values={jobs.values} color={palette.secondary} xTitle="Share of Muslim migrants (%)" />
        </Figure>,
      ];
    })(),
  };

  const storyCharts = charts[slug] ?? [];

  return (
    <>
      <div className="mt-10 border border-[#253D9A]/12 border-l-4 border-l-[#C9972C] bg-white p-7">
        <div className={story.hookStats.length > 1 ? "grid gap-6 sm:grid-cols-2" : ""}>
          {story.hookStats.map((s, i) => (
            <div key={i}>
              <p className="font-[family-name:var(--font-heading)] text-3xl text-[#C9972C] sm:text-4xl">{s.value}</p>
              {s.label && <p className="mt-1 text-sm text-[#5b5f74]">{s.label}</p>}
            </div>
          ))}
        </div>
        <p className="mt-4 text-[15px] leading-relaxed text-[#4b4f66]">{story.hookNote}</p>
      </div>

      <Prose>{story.lede}</Prose>

      {story.sections.map((section, i) => (
        <div key={i} className="mt-14">
          <SectionHeading>{section.heading}</SectionHeading>
          {section.paragraphs.map((p, j) => (
            <Prose key={j}>{p}</Prose>
          ))}
          {storyCharts[i]}
        </div>
      ))}

      {story.callouts && (
        <div className={`mt-10 grid gap-4 ${story.callouts.length === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
          {story.callouts.map((c, i) => (
            <div key={i} className="border border-[#253D9A]/12 bg-white p-5">
              <p className="text-[13px] text-[#8b8fa3]">{c.label}</p>
              <p className={`mt-1 font-[family-name:var(--font-heading)] text-2xl ${c.tone === "bad" ? "text-[#C9972C]" : c.tone === "good" ? "text-[#253D9A]" : "text-[#171a2b]"}`}>{c.value}</p>
              {c.sub && <p className="mt-1 text-[13px] text-[#8b8fa3]">{c.sub}</p>}
            </div>
          ))}
        </div>
      )}

      <div className="mt-16 bg-[#1c2456] p-8 text-white">
        <h2 className="font-[family-name:var(--font-heading)] text-2xl italic text-white/90">Why this matters</h2>
        <p className="mt-4 text-[15px] leading-relaxed text-white/80">{story.whyItMatters}</p>
      </div>

      <div className="mt-10 border-t border-[#253D9A]/10 pt-6">
        <h3 className="text-[12px] uppercase tracking-[0.12em] text-[#8b8fa3]">Sources &amp; notes</h3>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-[#8b8fa3]">
          {story.sources.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ol>
      </div>
    </>
  );
}

export default async function PublicationDetailV1({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const pub = publications.find((p) => p.slug === slug);
  if (!pub) notFound();
  const story = dataStories[slug];
  const author = people.find((p) => p.slug === pub.authors[0]);

  return (
    <>
      <PageHeader kicker={`${pub.format} · ${pub.theme}`} title={pub.title} />
      <section className="mx-auto max-w-3xl px-6 pb-16">
        <div className="flex items-center gap-2 text-sm text-[#5b5f74]">
          {author?.photo && (
            <Link href={`/v1/people/${author.slug}`} className="relative h-7 w-7 shrink-0 overflow-hidden rounded-full bg-[#f7f7f3]">
              <Image src={author.photo.src ?? stockPhotoFor(author.photo) ?? ""} alt={author.name} fill sizes="28px" className="object-cover" />
            </Link>
          )}
          {author ? (
            <Link href={`/v1/people/${author.slug}`} className="hover:text-[#253D9A]">{author.name}</Link>
          ) : (
            pub.authors.join(", ")
          )}
          &middot; {pub.date} <StatusTag status={pub.status} />
        </div>
        {pub.cover && <MediaSlot need={pub.cover} className="mt-6" />}
        {story ? (
          <StoryBody slug={slug} />
        ) : (
          <>
            <p className="mt-8 text-lg leading-relaxed text-[#4b4f66]">{pub.abstract}</p>
            <div className="mt-10 flex flex-wrap gap-3">
              <button disabled className="cursor-not-allowed bg-[#253D9A]/40 px-5 py-2.5 text-sm font-medium text-white">
                Download PDF (not wired)
              </button>
              <button disabled className="cursor-not-allowed border border-[#253D9A]/30 px-5 py-2.5 text-sm font-medium text-[#253D9A]/60">
                Export citation
              </button>
            </div>
          </>
        )}
      </section>
    </>
  );
}
