import Link from "next/link";
import { PageHeader, SectionHeading } from "../_ui/kit";

const sections = [
  { title: "Our Team", href: "/v1/people/team", desc: "PRI's staff, who run the day-to-day work of the institute." },
  { title: "Patrons", href: "/v1/people/patrons", desc: "Individuals who lend PRI their name and support." },
  { title: "Executive Council", href: "/v1/people/executive", desc: "PRI's governing council." },
  { title: "Partners", href: "/v1/partners", desc: "Institutions and researchers collaborating with PRI." },
];

export default function PeopleV1() {
  return (
    <>
      <PageHeader kicker="People" title="The people behind PRI" intro="Our team, patrons, Executive Council, and partners." />
      <section className="mx-auto max-w-5xl px-6 pb-16">
        <SectionHeading>Browse by group</SectionHeading>
        <div className="mt-8 grid gap-px overflow-hidden border border-[#243D9A]/15 bg-[#243D9A]/15 sm:grid-cols-2">
          {sections.map((s) => (
            <Link key={s.title} href={s.href} className="group flex flex-col justify-between bg-white p-7 transition-colors hover:bg-[#243D9A]">
              <div>
                <h3 className="font-[family-name:var(--font-heading)] text-lg text-[#171a2b] group-hover:text-white">{s.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-[#5b5f74] group-hover:text-white/85">{s.desc}</p>
              </div>
              <span className="mt-6 text-sm text-[#C9972C] group-hover:text-white">Explore &rarr;</span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
