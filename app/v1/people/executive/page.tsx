import Link from "next/link";
import { executiveCouncil } from "../../../_content/people";
import type { Person } from "../../../_lib/types";
import { PageHeader, SectionHeading, PersonCard } from "../../_ui/kit";

function PeopleGrid({ people }: { people: Person[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {people.map((p) => (
        <Link key={p.slug} href={`/v1/people/${p.slug}`} className="block transition-opacity hover:opacity-80">
          <PersonCard person={p} />
        </Link>
      ))}
    </div>
  );
}

export default function ExecutiveCouncilV1() {
  return (
    <>
      <PageHeader kicker="People" title="Executive Council" intro="PRI's governing council, chaired and staffed by 13 members." />
      <section className="mx-auto max-w-5xl px-6 pb-16">
        <SectionHeading>Executive Council</SectionHeading>
        <div className="mt-8">
          <PeopleGrid people={executiveCouncil} />
        </div>
      </section>
    </>
  );
}
