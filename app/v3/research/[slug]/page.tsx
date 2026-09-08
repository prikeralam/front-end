import { notFound } from "next/navigation";
import { publications } from "../../../_content/publications";
import { dataStories, educationCharts, demographyCharts, healthCharts, migrationCharts } from "../../../_content/dataStories";
import { PageHeader, SectionHeading, StatusTag } from "../../_ui/kit";
import MediaSlot from "../../_ui/MediaSlot";
import { HBarChart, GroupedBarChart, DivergingBarChart, ScatterChart, LineChart, VBarChart, HBarSimpleChart, type ChartPalette } from "../../../_lib/dataStoryCharts";

export function generateStaticParams() {
  return publications.map((p) => ({ slug: p.slug }));
}

const palette: ChartPalette = {
  primary: "#243D9A",
  secondary: "#B8862F",
  text: "#171a2b",
  textSoft: "#5b5f74",
  grid: "#e6dbc7",
  fontFamily: "Source Sans 3, sans-serif",
};
const neutralGrey = "#c9c3b4";

function sortAsc(labels: string[], values: number[]) {
  return labels
    .map((label, i) => ({ label, value: values[i] }))
    .sort((a, b) => a.value - b.value);
}

function Figure({ children, caption }: { children: React.ReactNode; caption: string }) {
  return (
    <div className="mt-6">
      <div className="border border-[#e6dbc7] bg-white p-3">{children}</div>
      <p className="mt-2 text-sm text-[#8b8fa3]">{caption}</p>
    </div>
  );
}

function Prose({ children }: { children: React.ReactNode }) {
  return <p className="mt-4 text-[15px] leading-relaxed text-[#4b4f66]">{children}</p>;
}

function HookBox({ story }: { story: (typeof dataStories)[string] }) {
  return (
    <div className="mt-10 border-l-4 border-[#B8862F] bg-[#F1E9D8] p-7">
      <div className="flex flex-wrap gap-8">
        {story.hookStats.map((s, i) => (
          <div key={i}>
            <p className="font-[family-name:var(--font-heading)] text-[28px] font-semibold text-[#243D9A]">{s.value}</p>
            {s.label && <p className="mt-1 max-w-xs text-[13px] leading-snug text-[#5b5f74]">{s.label}</p>}
          </div>
        ))}
      </div>
      <p className="mt-4 text-[15px] leading-relaxed text-[#4b4f66]">{story.hookNote}</p>
    </div>
  );
}

function CalloutGrid({ callouts }: { callouts: NonNullable<(typeof dataStories)[string]["callouts"]> }) {
  return (
    <div className={`mt-10 grid gap-4 sm:grid-cols-${Math.min(callouts.length, 3)}`}>
      {callouts.map((c) => (
        <div key={c.label} className="border border-[#e6dbc7] bg-white p-5">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[#8b8fa3]">{c.label}</p>
          <p
            className="mt-2 font-[family-name:var(--font-heading)] text-[22px] font-semibold"
            style={{ color: c.tone === "bad" ? palette.secondary : c.tone === "good" ? palette.primary : palette.text }}
          >
            {c.value}
          </p>
          <div className="mt-2 h-px w-8 bg-[#B8862F]" />
          {c.sub && <p className="mt-2 text-[12px] text-[#5b5f74]">{c.sub}</p>}
        </div>
      ))}
    </div>
  );
}

function WhyItMatters({ text }: { text: string }) {
  return (
    <div className="mt-16 bg-[#243D9A] p-8 text-white">
      <h2 className="mb-4 font-[family-name:var(--font-heading)] text-[22px] font-semibold">Why this matters</h2>
      <p className="text-[15px] leading-relaxed text-white/85">{text}</p>
    </div>
  );
}

function Sources({ sources }: { sources: string[] }) {
  return (
    <div className="mt-12 border-t border-[#e6dbc7] pt-6">
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8b8fa3]">Sources &amp; notes</p>
      <ol className="list-decimal space-y-2 pl-5 text-sm text-[#8b8fa3]">
        {sources.map((s, i) => (
          <li key={i}>{s}</li>
        ))}
      </ol>
    </div>
  );
}

function EducationCharts() {
  const batch = sortAsc(educationCharts.districts, educationCharts.perBatch);
  const science = sortAsc(educationCharts.districts, educationCharts.sciencePct);
  return {
    batch: (
      <Figure caption="Malappuram's average batch size is nearly double Pathanamthitta's, and the only district above 60 students per batch alongside Wayanad and Kasargode.">
        <HBarChart
          id="chart-batch-v3"
          labels={batch.map((d) => d.label)}
          values={batch.map((d) => d.value)}
          palette={palette}
          xTitle="Students per Plus One batch"
          refLines={[{ x: educationCharts.keralaAvgBatch, label: "All-Kerala avg: 54" }]}
          invertGradient
        />
      </Figure>
    ),
    science: (
      <Figure caption="Malappuram and Kasargode offer the smallest share of science batches in Kerala — roughly 9 to 11 percentage points below the state average.">
        <HBarChart
          id="chart-science-v3"
          labels={science.map((d) => d.label)}
          values={science.map((d) => d.value)}
          palette={palette}
          xTitle="Share of batches that are Science stream (%)"
          refLines={[{ x: educationCharts.keralaAvgScience, label: "All-Kerala avg: 51%" }]}
        />
      </Figure>
    ),
    scatter: (
      <Figure caption="Each point is a district. Larger average batch size tracks with a smaller share of science batches — Malappuram sits at the crowded, science-scarce end of the line.">
        <ScatterChart
          id="chart-scatter-v3"
          palette={palette}
          xTitle="Students per batch"
          yTitle="Science batches (%)"
          points={educationCharts.districts.map((d, i) => ({
            label: d,
            x: educationCharts.perBatch[i],
            y: educationCharts.sciencePct[i],
            highlight: educationCharts.scatterHighlight.includes(d),
          }))}
        />
      </Figure>
    ),
    forecast: (
      <Figure caption="Malappuram's Plus One demand is projected to stay above 82,000 in eight of the ten years to 2036, easing meaningfully only in the final two years.">
        <LineChart
          id="chart-forecast-v3"
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
      </Figure>
    ),
  };
}

function DemographyChartsBlock() {
  const { groups2011, groups2024, ageHindu, ageMuslim, ageChristian, births2014, births2024 } = demographyCharts;
  return {
    share: (
      <Figure caption="Most of Muslims' 3.3-point share increase is mirrored by Hindus' 2.7-point decline, with Christians accounting for a smaller share of the shift (−0.7 points).">
        <GroupedBarChart
          id="chart-share-v3"
          palette={palette}
          categories={["Hindu", "Muslim", "Christian"]}
          series={[
            { name: "2011 (Census)", values: groups2011, color: neutralGrey },
            { name: "2024 (est.)", values: groups2024, color: [palette.primary, palette.secondary, palette.primary] },
          ]}
          yTitle="Share of Kerala population (%)"
          yRange={[0, 60]}
        />
      </Figure>
    ),
    age: (
      <Figure caption="Each religion's share of Kerala's population changes by age bracket — Muslims are the youngest-skewing group, Hindus the oldest-skewing.">
        <GroupedBarChart
          id="chart-age-v3"
          palette={palette}
          categories={["Under 18", "18–40", "40+"]}
          series={[
            { name: "Hindu", values: ageHindu, color: palette.primary },
            { name: "Muslim", values: ageMuslim, color: palette.secondary },
            { name: "Christian", values: ageChristian, color: palette.textSoft },
          ]}
          yTitle="Share of age bracket (%)"
          yRange={[0, 65]}
          xTitle="Age bracket"
        />
      </Figure>
    ),
    representation: (
      <Figure caption="Percentage points above (right) or below (left) each group's own overall 2024 population share, by age bracket — Muslims' under-18 over-representation and over-40 under-representation are both the largest of the three groups.">
        <DivergingBarChart
          id="chart-representation-v3"
          palette={palette}
          groups={["Hindu", "Muslim", "Christian"]}
          series={[
            {
              name: "Under-18 bracket",
              values: [ageHindu[0] - groups2024[0], ageMuslim[0] - groups2024[1], ageChristian[0] - groups2024[2]],
              colors: [palette.primary, palette.secondary, palette.textSoft],
              opacity: 0.55,
            },
            {
              name: "40+ bracket",
              values: [ageHindu[2] - groups2024[0], ageMuslim[2] - groups2024[1], ageChristian[2] - groups2024[2]],
              colors: [palette.primary, palette.secondary, palette.textSoft],
            },
          ]}
          xTitle="Percentage points vs. own 2024 overall share"
        />
      </Figure>
    ),
    births: (
      <Figure caption="Annual Muslim births in Kerala fell by more than a quarter between 2014 and 2024.">
        <VBarChart
          id="chart-births-v3"
          palette={palette}
          labels={["2014", "2024"]}
          values={[births2014, births2024]}
          colors={[palette.primary, palette.secondary]}
          yTitle="Annual births, Kerala Muslim families"
          yRange={[0, 250000]}
          note={{ text: "−27% (−59,349 births)", x: 0.5, y: 235000 }}
        />
      </Figure>
    ),
  };
}

function HealthChartsBlock() {
  const phc = sortAsc(healthCharts.phc.districts, healthCharts.phc.values);
  const bed = sortAsc(healthCharts.bed.districts, healthCharts.bed.values);
  const doctor = sortAsc(healthCharts.doctor.districts, healthCharts.doctor.values);
  return {
    phc: (
      <Figure caption="Every district exceeds Kerala's 3,000-per-PHC policy target by a wide margin, but Malappuram and Kozhikode exceed even the statewide average of 36,303 — while Pathanamthitta and Idukki sit furthest below it.">
        <HBarChart
          id="chart-phc-v3"
          labels={phc.map((d) => d.label)}
          values={phc.map((d) => d.value)}
          palette={palette}
          xTitle="People per Primary Health Centre"
          refLines={[
            { x: healthCharts.phc.keralaAvg, label: "Kerala avg: 36,303" },
            { x: healthCharts.phc.policyTarget, label: "GOK policy target: 3,000", labelAtBottom: true, color: palette.primary },
          ]}
          invertGradient
        />
      </Figure>
    ),
    bed: (
      <Figure caption="Malappuram's population-per-bed ratio is roughly double the Kerala average of 928; Pathanamthitta's is little more than half of it.">
        <HBarChart
          id="chart-bed-v3"
          labels={bed.map((d) => d.label)}
          values={bed.map((d) => d.value)}
          palette={palette}
          xTitle="People per government-hospital bed"
          refLines={[{ x: healthCharts.bed.keralaAvg, label: "Kerala average: 928" }]}
          invertGradient
        />
      </Figure>
    ),
    doctor: (
      <Figure caption="The doctor-access gap between the best- and worst-served districts is close to 2-to-1: 3,754 people per doctor in Pathanamthitta versus 7,437 in Malappuram.">
        <HBarChart
          id="chart-doctor-v3"
          labels={doctor.map((d) => d.label)}
          values={doctor.map((d) => d.value)}
          palette={palette}
          xTitle="People per government-hospital doctor"
          invertGradient
        />
      </Figure>
    ),
    compare: (
      <Figure caption="Malappuram and Pathanamthitta anchor opposite ends of all three indicators — the gap isn't confined to one part of the health system.">
        <GroupedBarChart
          id="chart-compare-v3"
          palette={palette}
          categories={["Per PHC", "Per bed", "Per doctor"]}
          series={[
            { name: "Malappuram", values: healthCharts.compare.malappuram, color: palette.secondary },
            { name: "Kerala reference*", values: healthCharts.compare.reference, color: neutralGrey },
            { name: "Pathanamthitta", values: healthCharts.compare.pathanamthitta, color: palette.primary },
          ]}
          yTitle="People per unit"
        />
      </Figure>
    ),
  };
}

function MigrationChartsBlock() {
  const occupation = sortAsc(migrationCharts.jobs, migrationCharts.jobVals);
  return {
    share: (
      <Figure caption="Hindus are under-represented among emigrants by 18 points; Muslims are over-represented by 12.6 points and Christians by 5.4 points.">
        <GroupedBarChart
          id="chart-mshare-v3"
          palette={palette}
          categories={["Hindu", "Muslim", "Christian", "Others"]}
          series={[
            { name: "Total population", values: migrationCharts.totalPop, color: neutralGrey },
            { name: "Emigrant population", values: migrationCharts.emigrantPop, color: [palette.primary, palette.secondary, palette.primary, palette.textSoft] },
          ]}
          yTitle="Share (%)"
          yRange={[0, 60]}
        />
      </Figure>
    ),
    representation: (
      <Figure caption="Muslims show the largest positive gap between emigrant share and population share of any group in Kerala.">
        <DivergingBarChart
          id="chart-mrepresentation-v3"
          palette={palette}
          groups={["Hindu", "Muslim", "Christian", "Others"]}
          series={[
            {
              name: "",
              values: migrationCharts.emigrantPop.map((v, i) => v - migrationCharts.totalPop[i]),
              colors: [palette.primary, palette.secondary, palette.primary, palette.textSoft],
            },
          ]}
          xTitle="Emigrant share minus population share (points)"
        />
      </Figure>
    ),
    gulf: (
      <Figure caption="Muslim emigrants are the most concentrated on Gulf destinations of any religious group in Kerala — 22 points above the Christian figure.">
        <VBarChart
          id="chart-gulf-v3"
          palette={palette}
          labels={migrationCharts.gulf.labels}
          values={migrationCharts.gulf.values}
          colors={[palette.primary, palette.primary, palette.textSoft, palette.secondary]}
          yTitle="Share of emigrants going to the Gulf (%)"
          yRange={[0, 110]}
        />
      </Figure>
    ),
    occupation: (
      <Figure caption="Sales and driving roles alone account for nearly 39% of Muslim migrants' occupations in the Gulf.">
        <HBarSimpleChart
          id="chart-occupation-v3"
          labels={occupation.map((d) => d.label)}
          values={occupation.map((d) => d.value)}
          color={palette.secondary}
          palette={palette}
          xTitle="Share of Muslim migrants (%)"
        />
      </Figure>
    ),
  };
}

export default async function PublicationDetailV3({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const pub = publications.find((p) => p.slug === slug);
  if (!pub) notFound();

  const story = dataStories[slug];

  if (!story) {
    return (
      <>
        <PageHeader kicker={`${pub.format} · ${pub.theme}`} title={pub.title} />
        <section className="mx-auto max-w-3xl px-6 py-16">
          <div className="flex items-center gap-2 text-sm text-[#5b5f74]">
            {pub.authors.join(", ")} &middot; {pub.date} <StatusTag status={pub.status} />
          </div>
          {pub.cover && <MediaSlot need={pub.cover} className="mt-6 max-w-sm" />}
          <p className="mt-8 text-[17px] leading-relaxed text-[#4b4f66]">{pub.abstract}</p>
          <div className="mt-10 flex flex-wrap gap-3">
            <button disabled className="cursor-not-allowed bg-[#243D9A]/40 px-5 py-2.5 text-sm font-semibold text-white">
              Download PDF (not wired)
            </button>
            <button disabled className="cursor-not-allowed border border-[#243D9A]/30 px-5 py-2.5 text-sm font-semibold text-[#243D9A]/60">
              Export citation
            </button>
          </div>
        </section>
      </>
    );
  }

  const charts =
    slug === "malappuram-classrooms"
      ? EducationCharts()
      : slug === "kerala-population-mix"
        ? DemographyChartsBlock()
        : slug === "kerala-healthcare-gap"
          ? HealthChartsBlock()
          : MigrationChartsBlock();
  const chartList = Object.values(charts);

  return (
    <>
      <PageHeader kicker={`${pub.format} · ${pub.theme}`} title={pub.title} intro={story.lede} />
      <section className="mx-auto max-w-3xl px-6 py-16">
        <div className="flex items-center gap-2 text-sm text-[#5b5f74]">
          {pub.authors.join(", ")} &middot; {pub.date} <StatusTag status={pub.status} />
        </div>
        {pub.cover && <MediaSlot need={pub.cover} className="mt-6 max-w-sm" />}

        <HookBox story={story} />

        {story.sections.map((section, i) => (
          <div key={section.heading} className="mt-16">
            <SectionHeading>{section.heading}</SectionHeading>
            {section.paragraphs.map((p, j) => (
              <Prose key={j}>{p}</Prose>
            ))}
            {chartList[i]}
          </div>
        ))}

        {story.callouts && <CalloutGrid callouts={story.callouts} />}

        <WhyItMatters text={story.whyItMatters} />
        <Sources sources={story.sources} />
      </section>
    </>
  );
}
