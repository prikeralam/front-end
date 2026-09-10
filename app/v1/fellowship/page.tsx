import Link from "next/link";
import { programmes, timeline, currentFellows, pastFellows } from "../../_content/fellows";
import { PageHeader, SectionHeading, PersonCard, FormMock, StatusTag } from "../_ui/kit";

export default function FellowshipV1() {
  return (
    <>
      <PageHeader
        kicker="Fellowship & Internship Portal"
        title="Programmes to train the next generation of researchers and policymakers"
      />

      <section className="mx-auto max-w-5xl px-6 pb-16">
        <div className="grid gap-6 sm:grid-cols-2">
          {programmes.map((p) => (
            <div key={p.name} className="border border-[#253D9A]/12 bg-white p-6">
              <h3 className="flex items-center gap-2 font-[family-name:var(--font-heading)] text-lg text-[#171a2b]">
                {p.name} <StatusTag status={p.status} />
              </h3>
              <p className="mt-2 text-sm text-[#5b5f74]">{p.desc}</p>
              <p className="mt-3 text-[12px] uppercase tracking-wide text-[#8b8fa3]">Duration: {p.duration}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 border border-[#253D9A]/12 bg-[#f7f7f3] p-6">
          <p className="text-[12px] uppercase tracking-[0.12em] text-[#8b8fa3]">Timeline</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-4">
            {timeline.map((t) => (
              <div key={t.stage}>
                <p className="text-[13px] font-medium text-[#171a2b]">{t.stage}</p>
                <p className="mt-1 text-[12px] text-[#8b8fa3]">{t.when}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8">
          <Link href="#apply" className="inline-block bg-[#253D9A] px-6 py-3 text-sm font-semibold text-white hover:bg-[#242c72]">
            Apply now &rarr;
          </Link>
        </div>
      </section>

      <section className="border-y border-[#253D9A]/10 bg-[#f7f7f3]">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <SectionHeading>Current Fellows</SectionHeading>
          <div className="mt-8 grid gap-5 sm:grid-cols-3">
            {currentFellows.map((f) => (
              <Link key={f.slug} href={`/v1/fellowship/${f.slug}`}>
                <PersonCard person={f} />
              </Link>
            ))}
          </div>
          <SectionHeading><span className="mt-4 block">Past Fellows</span></SectionHeading>
          <div className="mt-8 grid gap-5 sm:grid-cols-3">
            {pastFellows.map((f) => (
              <Link key={f.slug} href={`/v1/fellowship/${f.slug}`}>
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
