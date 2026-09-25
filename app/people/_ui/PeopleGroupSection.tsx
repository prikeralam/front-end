import Link from "next/link";
import { EmptyState, LoadError } from "../../_ui/ApiMessage";
import { PersonCard, SectionHeading } from "../../_ui/kit";
import { load } from "../../_lib/api/load";
import { listPeopleByGroup } from "../../_lib/api/people";
import type { Person } from "../../_lib/types";

/** A heading plus the grid of published people in one group, with load-error and empty states. */
export default async function PeopleGroupSection({ group, heading, what }: { group: Person["group"]; heading: string; what: string }) {
  const result = await load(what, () => listPeopleByGroup(group));

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <SectionHeading>{heading}</SectionHeading>
      {!result.ok ? (
        <LoadError what={what} />
      ) : result.data.length === 0 ? (
        <EmptyState>Profiles will be published here soon.</EmptyState>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {result.data.map((p) => (
            <Link key={p.slug} href={`/people/${p.slug}`} className="block transition-shadow hover:shadow-[0_2px_16px_rgba(15,107,92,0.10)]">
              <PersonCard person={p} />
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
