import Link from "next/link";
import { org, missionPoints, pillars, vision } from "../_content/org";
import { updates, quickLinks } from "../_content/updates";
import { testimonials } from "../_content/people";
import { SectionHeading, StatusTag, NumberedItem, Quote } from "./_ui/kit";

export default function HomeV3() {
  return (
    <>
      {/* Hero */}
      <section className="border-b border-[#e6dbc7] bg-[#F1E9D8]">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 lg:grid-cols-[1.5fr_1fr]">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#B8862F]">
              Think Tank &middot; Research &middot; Policy Advocacy
            </p>
            <h1 className="mt-4 max-w-2xl font-[family-name:var(--font-heading)] text-[42px] font-semibold leading-[1.14] text-[#171a2b] sm:text-[50px]">
              Evidence for a more equitable society.
            </h1>
            <p className="mt-6 max-w-2xl text-[17px] leading-relaxed text-[#4b4f66]">{org.summary}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/v3/research" className="bg-[#6B2737] px-6 py-3 text-sm font-semibold text-white hover:bg-[#551E2A]">
                Explore Our Research
              </Link>
              <Link href="/v3/about" className="border border-[#6B2737] px-6 py-3 text-sm font-semibold text-[#6B2737] hover:bg-[#6B2737] hover:text-white">
                About PRI
              </Link>
            </div>
          </div>
          <aside className="border-l-4 border-[#B8862F] bg-white p-7">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8b8fa3]">Our Vision</p>
            <p className="mt-4 font-[family-name:var(--font-heading)] text-[16px] leading-relaxed text-[#22263a]">
              {vision.text}
            </p>
          </aside>
        </div>
      </section>

      {/* Mission */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <p className="max-w-3xl text-[17px] leading-relaxed text-[#4b4f66]">{org.intro}</p>
        <h2 className="mt-12 border-b-2 border-[#6B2737] pb-3 font-[family-name:var(--font-heading)] text-[26px] font-semibold text-[#171a2b]">
          Our Mission
        </h2>
        <div className="mt-6 grid gap-x-12 gap-y-6 sm:grid-cols-2">
          {missionPoints.map((point, i) => (
            <NumberedItem key={point} n={i + 1}>
              <span className="text-[15px] leading-relaxed text-[#4b4f66]">{point}</span>
            </NumberedItem>
          ))}
        </div>
      </section>

      {/* Pillars */}
      <section className="border-y border-[#e6dbc7] bg-[#F1E9D8]">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <SectionHeading>Our Functions</SectionHeading>
          <div className="mt-8 grid gap-px bg-[#e6dbc7] sm:grid-cols-3">
            {pillars.map((p) => (
              <Link key={p.title} href={p.href} className="bg-white p-7 hover:bg-[#FBF7EE]">
                <h3 className="font-[family-name:var(--font-heading)] text-[19px] font-semibold leading-snug text-[#4A1B26]">
                  {p.title}
                </h3>
                <div className="mt-3 h-px w-10 bg-[#B8862F]" />
                <p className="mt-4 text-sm leading-relaxed text-[#5b5f74]">{p.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Latest updates */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="flex items-baseline justify-between border-b-2 border-[#6B2737] pb-3">
          <h2 className="font-[family-name:var(--font-heading)] text-[26px] font-semibold text-[#171a2b]">
            Latest Updates
          </h2>
          <span className="text-sm text-[#8b8fa3]">Most recent first</span>
        </div>
        <div className="divide-y divide-[#e6dbc7]">
          {updates.map((u) => (
            <article key={u.title} className="grid gap-3 py-6 sm:grid-cols-[130px_1fr] sm:gap-8">
              <div>
                <span className="inline-block bg-[#6B2737]/8 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#6B2737]">
                  {u.type}
                </span>
                <p className="mt-2 text-[12px] text-[#8b8fa3]">{u.meta}</p>
              </div>
              <div>
                <h3 className="flex items-center gap-2 font-[family-name:var(--font-heading)] text-xl font-semibold leading-snug text-[#171a2b]">
                  <Link href={u.href} className="hover:text-[#6B2737] hover:underline">{u.title}</Link>
                  <StatusTag status={u.status} />
                </h3>
                <p className="mt-2 max-w-3xl text-[15px] leading-relaxed text-[#5b5f74]">{u.desc}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Quick links */}
      <section className="border-y border-[#e6dbc7] bg-[#F1E9D8]">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <SectionHeading>Where to Start</SectionHeading>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {quickLinks.map((q) => (
              <Link key={q.title} href={`/v3${q.href}`} className="group border border-[#e6dbc7] bg-white p-7 transition-colors hover:border-[#6B2737]">
                <h3 className="font-[family-name:var(--font-heading)] text-[19px] font-semibold text-[#4A1B26]">{q.title}</h3>
                <p className="mt-4 text-sm leading-relaxed text-[#5b5f74]">{q.desc}</p>
                <span className="mt-5 inline-block text-sm font-semibold text-[#6B2737] group-hover:underline">Explore &rarr;</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <SectionHeading>From Our Collaborators</SectionHeading>
        <div className="mt-8 grid gap-8 sm:grid-cols-3">
          {testimonials.map((t, i) => (
            <Quote key={i} quote={t.quote} name={t.name} role={t.role} status={t.status} />
          ))}
        </div>
      </section>
    </>
  );
}
