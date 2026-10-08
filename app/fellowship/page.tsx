import Link from "next/link";
import { currentFellows } from "../_content/fellows";
import { PageHeader, SectionHeading, PersonCard } from "../_ui/kit";

const featuredFellows = currentFellows.filter((f) => f.slug === "hisham");

export default function FellowshipPage() {
  return (
    <>
      <PageHeader kicker="Engage" title="Fellowships & Internships" />

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="rounded-lg border border-[#e6e8f0] bg-white p-8">
          <h2 className="text-2xl text-[#171a2b]">Apply for internships and fellowships</h2>
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-[#5b5f74]">
            Applications are open on a rolling basis, with no deadline. Send us your CV and a statement of purpose
            whenever you are ready, and we will get back to you.
          </p>
          <Link href="/fellowship/apply" className="mt-6 inline-block rounded-md bg-[#253D9A] px-6 py-3 text-sm font-semibold text-white hover:bg-[#1B2C70]">
            Apply now &rarr;
          </Link>
        </div>
      </section>

      <section className="border-y border-[#e6e8f0] bg-white">
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
