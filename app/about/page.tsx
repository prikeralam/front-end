import { org, vision, missionPoints, departments } from "../_content/org";
import { PageHeader, SectionHeading } from "../_ui/kit";

export default function AboutV2() {
  return (
    <>
      <PageHeader kicker="Who we are" title={org.tagline} intro={org.summary} />

      <section className="mx-auto max-w-6xl px-6 py-16">
        <SectionHeading>Who We Are</SectionHeading>
        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <div className="rounded-xl border border-[#e6e8f0] bg-white p-8">
            <p className="text-xs font-bold uppercase tracking-wider text-[#8b8fa3]">Who We Are</p>
            <p className="mt-4 text-lg leading-relaxed text-[#4b4f66]">{org.intro}</p>
          </div>
          <div className="rounded-xl bg-[#253D9A] p-8 text-white">
            <p className="text-xs font-bold uppercase tracking-wider text-white/60">Our Vision</p>
            <p className="mt-4 text-lg leading-relaxed">{vision.text}</p>
          </div>
        </div>

        <div className="mt-8 rounded-xl border border-[#e6e8f0] bg-white p-8">
          <p className="text-2xl font-bold tracking-tight text-[#171a2b]">Our Mission</p>
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            {missionPoints.map((point, i) => (
              <div key={point} className="flex gap-4">
                <span className="font-[family-name:var(--font-mono)] text-sm font-semibold text-[#E4633F]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-lg leading-relaxed text-[#4b4f66]">{point}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <SectionHeading>Research &amp; Analysis Wing</SectionHeading>
        <p className="mt-2 max-w-2xl text-[15px] text-[#5b5f74]">
          Five specialised departments examining gaps, inequalities, and opportunities across different societal sections.
        </p>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {departments.map((d, i) => (
            <div key={d.name} className="rounded-xl border border-[#e6e8f0] p-6">
              <span className="font-[family-name:var(--font-mono)] text-xs font-semibold text-[#E4633F]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-3 text-[16px] font-bold leading-snug text-[#171a2b]">{d.name}</h3>
              <ul className="mt-4 space-y-1.5">
                {d.areas.map((a) => (
                  <li key={a} className="text-[13px] leading-relaxed text-[#5b5f74]">{a}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
