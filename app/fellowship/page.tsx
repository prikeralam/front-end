import Link from "next/link";
import { programmes, timeline, currentFellows } from "../_content/fellows";
import { PageHeader, SectionHeading, PersonCard, StatusTag } from "../_ui/kit";

const featuredFellows = currentFellows.filter((f) => f.slug === "hisham");

export default function FellowshipPage() {
  return (
    <>
      <PageHeader
        kicker="Fellowship & Internship Portal"
        title="Programmes to train the next generation of researchers and policymakers"
      />

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-5 sm:grid-cols-2">
          {programmes.map((p) => (
            <div key={p.name} className="rounded-xl border border-[#e6e8f0] bg-white p-6">
              <h3 className="flex items-center gap-2 text-lg font-bold text-[#171a2b]">
                {p.name} <StatusTag status={p.status} />
              </h3>
              <p className="mt-2 text-sm text-[#5b5f74]">{p.desc}</p>
              <p className="mt-3 text-[12px] font-semibold uppercase tracking-wide text-[#8b8fa3]">Duration: {p.duration}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-xl border border-[#e6e8f0] bg-[#fafbfc] p-6">
          <p className="text-xs font-bold uppercase tracking-wider text-[#8b8fa3]">Timeline</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-4">
            {timeline.map((t) => (
              <div key={t.stage}>
                <p className="text-[13px] font-semibold text-[#171a2b]">{t.stage}</p>
                <p className="mt-1 text-[12px] text-[#8b8fa3]">{t.when}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8">
          <Link href="/fellowship/apply" className="inline-block rounded-full bg-[#253D9A] px-6 py-3 text-sm font-semibold text-white hover:bg-[#1B2C70]">
            Apply now &rarr;
          </Link>
        </div>
      </section>

      <section className="border-y border-[#e6e8f0] bg-[#fafbfc]">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <SectionHeading>Current Fellows</SectionHeading>
          <div className="mt-8 grid gap-5 sm:grid-cols-3">
            {featuredFellows.map((f) => (
              <Link key={f.slug} href={`/fellowship/${f.slug}`}>
                <PersonCard person={f} />
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
