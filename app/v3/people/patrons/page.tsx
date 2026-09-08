import Link from "next/link";
import { patrons } from "../../../_content/people";
import { PageHeader, SectionHeading, PersonCard } from "../../_ui/kit";
import type { Person } from "../../../_lib/types";

function PeopleGrid({ people }: { people: Person[] }) {
  return (
    <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {people.map((p) => (
        <Link key={p.slug} href={`/v3/people/${p.slug}`} className="block transition-opacity hover:opacity-80">
          <PersonCard person={p} />
        </Link>
      ))}
    </div>
  );
}

export default function PatronsV3() {
  return (
    <>
      <PageHeader kicker="People" title="Patrons" intro="Individuals who lend PRI their name and support." />
      <section className="mx-auto max-w-6xl px-6 py-16">
        <SectionHeading>Patrons</SectionHeading>
        <PeopleGrid people={patrons} />
      </section>
    </>
  );
}
