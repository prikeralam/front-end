import Link from "next/link";
import { programmes, timeline, currentFellows, pastFellows } from "../../_content/fellows";
import { PageHeader, SectionHeading, PersonCard, FormMock, StatusTag } from "../_ui/kit";

export default function FellowshipV2() {
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
          <Link href="#apply" className="inline-block rounded-full bg-[#0F6B5C] px-6 py-3 text-sm font-semibold text-white hover:bg-[#0B5347]">
            Apply now &rarr;
          </Link>
        </div>
      </section>

      <section className="border-y border-[#e6e8f0] bg-[#fafbfc]">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <SectionHeading>Current Fellows</SectionHeading>
          <div className="mt-8 grid gap-5 sm:grid-cols-3">
            {currentFellows.map((f) => (
              <Link key={f.slug} href={`/v2/fellowship/${f.slug}`}>
                <PersonCard person={f} />
              </Link>
            ))}
          </div>
          <div className="mt-12">
            <SectionHeading>Past Fellows</SectionHeading>
          </div>
          <div className="mt-8 grid gap-5 sm:grid-cols-3">
            {pastFellows.map((f) => (
              <Link key={f.slug} href={`/v2/fellowship/${f.slug}`}>
                <PersonCard person={f} />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="apply" className="mx-auto max-w-3xl px-6 py-16">
        <SectionHeading>Application</SectionHeading>
        <div className="mt-8">
          <FormMock
            title="Fellowship / Internship application"
            fields={["Full name", "Email", "Programme", "CV upload", "Writing sample upload", "Statement of interest"]}
          />
        </div>
        <div className="mt-10">
          <SectionHeading>Feedback &amp; Testimonials</SectionHeading>
          <div className="mt-6">
            <FormMock title="Share your experience" fields={["Name", "Cohort / year", "Testimonial"]} note="Submissions are reviewed by an Editor before publishing." />
          </div>
        </div>
      </section>
    </>
  );
}
