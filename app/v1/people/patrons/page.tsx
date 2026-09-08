import Link from "next/link";
import { patrons } from "../../../_content/people";
import type { Person } from "../../../_lib/types";
import { PageHeader, SectionHeading, PersonCard } from "../../_ui/kit";

function PeopleGrid({ people }: { people: Person[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {people.map((p) => (
        <Link key={p.slug} href={`/v1/people/${p.slug}`} className="block transition-opacity hover:opacity-80">
          <PersonCard person={p} />
        </Link>
      ))}
    </div>
  );
}

export default function PatronsV1() {
  return (
    <>
      <PageHeader kicker="People" title="Patrons" intro="Individuals who lend PRI their name and support." />
      <section className="mx-auto max-w-5xl px-6 pb-16">
        <SectionHeading>Patrons</SectionHeading>
        <div className="mt-8">
          <PeopleGrid people={patrons} />
        </div>
      </section>
    </>
  );
}
