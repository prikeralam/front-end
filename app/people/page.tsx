import Link from "next/link";
import { PageHeader, SectionHeading } from "../_ui/kit";

const sections = [
  { title: "Patrons", href: "/people/patrons", desc: "Individuals who lend PRI their name and support." },
  { title: "Executive Council", href: "/people/executive", desc: "PRI's governing council." },
  { title: "Partners", href: "/partners", desc: "Institutions and researchers collaborating with PRI." },
  { title: "Our Team", href: "/people/team", desc: "PRI's staff, who run the day-to-day work of the institute." },
];

export default function PeoplePage() {
  return (
    <>
      <PageHeader kicker="People" title="The people behind PRI" intro="Our team, patrons, Executive Council, and partners." />
      <section className="mx-auto max-w-6xl px-6 py-16">
        <SectionHeading>Browse by group</SectionHeading>
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {sections.map((s) => (
            <Link key={s.title} href={s.href} className="group rounded-lg border border-[#e6e8f0] p-7 transition-colors hover:border-[#253D9A]">
              <h3 className="text-lg font-bold text-[#171a2b]">{s.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-[#5b5f74]">{s.desc}</p>
              <span className="mt-5 inline-block text-sm font-semibold text-[#253D9A] group-hover:underline">Explore &rarr;</span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
