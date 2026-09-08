import Link from "next/link";
import { PageHeader, SectionHeading } from "../_ui/kit";

const sections = [
  { title: "Our Team", href: "/v3/people/team", desc: "PRI's staff, who run the day-to-day work of the institute." },
  { title: "Patrons", href: "/v3/people/patrons", desc: "Individuals who lend PRI their name and support." },
  { title: "Executive Council", href: "/v3/people/executive", desc: "PRI's governing council." },
  { title: "Partners", href: "/v3/partners", desc: "Institutions and researchers collaborating with PRI." },
];

export default function PeopleV3() {
  return (
    <>
      <PageHeader kicker="People" title="The people behind PRI" intro="Our team, patrons, Executive Council, and partners." />
      <section className="mx-auto max-w-6xl px-6 py-16">
        <SectionHeading>Browse by group</SectionHeading>
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          {sections.map((s) => (
            <Link key={s.title} href={s.href} className="group border border-[#e6dbc7] bg-white p-7 transition-colors hover:border-[#243D9A]">
              <h3 className="font-[family-name:var(--font-heading)] text-[19px] font-semibold text-[#4A1B26]">{s.title}</h3>
              <p className="mt-4 text-sm leading-relaxed text-[#5b5f74]">{s.desc}</p>
              <span className="mt-5 inline-block text-sm font-semibold text-[#243D9A] group-hover:underline">Explore &rarr;</span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
