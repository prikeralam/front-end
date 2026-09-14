import Link from "next/link";
import { advisoryBody } from "../../../_content/people";
import { PageHeader, SectionHeading, PersonCard } from "../../_ui/kit";
import type { Person } from "../../../_lib/types";

function PeopleGrid({ people }: { people: Person[] }) {
  return (
    <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {people.map((p) => (
        <Link key={p.slug} href={`/v3/people/${p.slug}`} className="block transition-opacity hover:opacity-80">
          <PersonCard person={p} />
        </Link>
      ))}
    </div>
  );
}

export default function AdvisoryV3() {
  return (
    <>
      <PageHeader kicker="People" title="Advisory Body" intro="Advisors who guide PRI's research direction and institutional strategy." />
      <section className="mx-auto max-w-6xl px-6 py-16">
        <SectionHeading>Advisory Body</SectionHeading>
        <PeopleGrid people={advisoryBody} />
      </section>
    </>
  );
}
