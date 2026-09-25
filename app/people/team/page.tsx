import Link from "next/link";
import { PageHeader, SectionHeading, PersonCard } from "../../_ui/kit";
import { listPeopleByGroup } from "../../_lib/api/people";
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

async function loadTeam(): Promise<{ team: Person[] } | { error: true }> {
  try {
    return { team: await listPeopleByGroup("team") };
  } catch (error) {
    console.error("Failed to load team from API", error);
    return { error: true };
  }
}

export default async function TeamV2() {
  const result = await loadTeam();

  return (
    <>
      <PageHeader kicker="People" title="Our Team" intro="PRI's staff, who run the day-to-day work of the institute." />
      <section className="mx-auto max-w-6xl px-6 py-16">
        <SectionHeading>Our Team</SectionHeading>
        {"error" in result ? (
          <p className="mt-8 text-[15px] text-[#5b5f74]">We couldn&apos;t load our team just now. Please try again in a few minutes.</p>
        ) : result.team.length === 0 ? (
          <p className="mt-8 text-[15px] text-[#5b5f74]">Our team profiles will be published here soon.</p>
        ) : (
          <PersonGrid people={result.team} />
        )}
      </section>
    </>
  );
}
