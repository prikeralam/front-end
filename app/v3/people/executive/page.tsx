import Link from "next/link";
import { executiveCouncil } from "../../../_content/people";
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

export default function ExecutiveCouncilV3() {
  return (
    <>
      <PageHeader kicker="People" title="Executive Council" intro="PRI's governing council, chaired and staffed by 13 members." />
      <section className="mx-auto max-w-6xl px-6 py-16">
        <SectionHeading>Executive Council</SectionHeading>
        <PeopleGrid people={executiveCouncil} />
      </section>
    </>
  );
}
