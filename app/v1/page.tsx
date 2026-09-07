import Link from "next/link";
import { org, missionPoints, pillars } from "../_content/org";
import { updates, quickLinks } from "../_content/updates";
import { testimonials } from "../_content/people";
import { SectionHeading, Quote, StatusTag } from "./_ui/kit";
import PlaceholderBanner from "./_ui/PlaceholderBanner";

const projects = [
  { title: "Educational Equity Assessment", seed: 1 },
  { title: "Employment Patterns Study", seed: 2 },
  { title: "Policy Roundtable with Stakeholders", seed: 3 },
];

export default function HomeV1() {
  return (
    <>
      {/* Hero */}
      <section className="mx-auto max-w-5xl px-6 pb-14 pt-20">
        <p className="text-[13px] uppercase tracking-[0.2em] text-[#2e3891]">{org.tagline}</p>
        <h1 className="mt-5 max-w-3xl font-[family-name:var(--font-heading)] text-5xl leading-[1.08] text-[#171a2b] sm:text-[62px]">
          Evidence for a more equitable society.
        </h1>
        <p className="mt-7 max-w-2xl text-lg leading-relaxed text-[#4b4f66]">{org.summary}</p>
        <div className="mt-9 flex flex-wrap items-center gap-8">
          <Link href="/v1/research" className="border-b-2 border-[#C9972C] pb-1 text-sm font-medium tracking-wide text-[#171a2b] transition-colors hover:border-[#2e3891]">
            Explore our research &rarr;
          </Link>
          <Link href="/v1/about" className="border-b border-transparent pb-1 text-sm tracking-wide text-[#5b5f74] transition-colors hover:border-[#2e3891] hover:text-[#2e3891]">
            About PRI
          </Link>
        </div>
      </section>

      {/* Project banners */}
      <section className="mx-auto max-w-5xl px-6 pb-16">
        <div className="grid gap-4 sm:grid-cols-3">
          {projects.map((p) => (
            <PlaceholderBanner key={p.title} caption={p.title} ratio="3:2" seed={p.seed} />
          ))}
        </div>
      </section>

      {/* Mission strip */}
      <section className="border-y border-[#2e3891]/10 bg-[#f7f7f3]">
        <div className="mx-auto max-w-5xl px-6 py-14">
          <p className="max-w-3xl font-[family-name:var(--font-heading)] text-xl leading-relaxed text-[#171a2b]">
            {org.intro}
          </p>
          <ul className="mt-10 grid gap-x-10 gap-y-5 sm:grid-cols-2">
            {missionPoints.map((point, i) => (
              <li key={point} className="flex gap-4 text-[15px] leading-relaxed text-[#4b4f66]">
                <span className="font-[family-name:var(--font-heading)] text-[13px] text-[#C9972C]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {point}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Pillars */}
      <section className="mx-auto max-w-5xl px-6 py-16">
        <SectionHeading>How we work</SectionHeading>
        <div className="mt-8 grid gap-10 sm:grid-cols-3">
          {pillars.map((p) => (
            <Link key={p.title} href={p.href} className="block border-t-2 border-[#2e3891] pt-5 hover:opacity-80">
              <h3 className="font-[family-name:var(--font-heading)] text-lg leading-snug text-[#171a2b]">{p.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-[#5b5f74]">{p.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Latest Updates */}
      <section className="border-t border-[#2e3891]/10 bg-[#f7f7f3]">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <SectionHeading>Latest from PRI</SectionHeading>
          <div className="mt-8 divide-y divide-[#2e3891]/10 border-y border-[#2e3891]/10">
            {updates.map((u) => (
              <article key={u.title} className="grid gap-2 py-6 sm:grid-cols-[110px_1fr] sm:gap-6">
                <span className="pt-1 text-[12px] uppercase tracking-[0.12em] text-[#C9972C]">{u.type}</span>
                <div>
                  <Link href={u.href} className="flex items-center gap-2 font-[family-name:var(--font-heading)] text-xl leading-snug text-[#171a2b] hover:text-[#2e3891]">
                    {u.title}
                    <StatusTag status={u.status} />
                  </Link>
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#5b5f74]">{u.desc}</p>
                  <p className="mt-2 text-[12px] text-[#8b8fa3]">{u.meta}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="mx-auto max-w-5xl px-6 py-16">
        <SectionHeading>Where to start</SectionHeading>
        <div className="mt-8 grid gap-px overflow-hidden border border-[#2e3891]/15 bg-[#2e3891]/15 sm:grid-cols-3">
          {quickLinks.map((q) => (
            <Link key={q.title} href={`/v1${q.href}`} className="group flex flex-col justify-between bg-white p-7 transition-colors hover:bg-[#2e3891]">
              <div>
                <h3 className="font-[family-name:var(--font-heading)] text-lg text-[#171a2b] group-hover:text-white">{q.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-[#5b5f74] group-hover:text-white/85">{q.desc}</p>
              </div>
              <span className="mt-6 text-sm text-[#C9972C] group-hover:text-white">Explore &rarr;</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-[#1c2456]">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <h2 className="font-[family-name:var(--font-heading)] text-2xl italic text-white/90">What collaborators say</h2>
          <div className="mt-8 grid gap-10 sm:grid-cols-3">
            {testimonials.map((t, i) => (
              <Quote key={i} quote={t.quote} name={t.name} role={t.role} status={t.status} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
