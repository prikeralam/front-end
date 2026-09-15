import Link from "next/link";
import { advisoryBody } from "../../_content/people";
import { PageHeader, SectionHeading, PersonCard } from "../../_ui/kit";
import type { Person } from "../../_lib/types";

function PersonGrid({ people }: { people: Person[] }) {
  return (
    <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {people.map((p) => (
        <Link key={p.slug} href={`/people/${p.slug}`} className="block transition-shadow hover:shadow-[0_2px_16px_rgba(15,107,92,0.10)]">
          <PersonCard person={p} />
        </Link>
      ))}
    </div>
  );
}

export default function AdvisoryV2() {
  return (
    <>
      <PageHeader kicker="People" title="Advisory Body" intro="Advisors who guide PRI's research direction and institutional strategy." />
      <section className="mx-auto max-w-6xl px-6 py-16">
        <SectionHeading>Advisory Body</SectionHeading>
        <PersonGrid people={advisoryBody} />
      </section>
    </>
  );
}
