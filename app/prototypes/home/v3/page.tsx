import Link from "next/link";
import Header from "../../_shared/v3/Header";
import Footer from "../../_shared/v3/Footer";
import { headingFont, bodyFont } from "../../_shared/v3/fonts";
import { org, vision, missionPoints, pillars, researchDomains, updates, quickLinks, testimonials } from "../../_shared/content";

export default function HomeV3() {
  return (
    <div className={`${headingFont.variable} ${bodyFont.variable} flex min-h-screen flex-col bg-white font-[family-name:var(--font-body)] text-[#22263a]`}>
      <Header active="home" />

      <main className="flex-1">
        {/* Hero */}
        <section className="border-b border-[#d8dae6] bg-[#f4f4f7]">
          <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 lg:grid-cols-[1.5fr_1fr]">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#A64B2A]">
                Think Tank · Research · Policy Advocacy
              </p>
              <h1 className="mt-4 max-w-2xl font-[family-name:var(--font-heading)] text-[44px] font-semibold leading-[1.14] text-[#171a2b] sm:text-[52px]">
                Research that confronts inequality with evidence.
              </h1>
              <p className="mt-6 max-w-2xl text-[17px] leading-relaxed text-[#4b4f66]">{org.summary}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="#" className="bg-[#2e3891] px-6 py-3 text-sm font-semibold text-white hover:bg-[#242c72]">
                  Explore Our Research
                </Link>
                <Link href="/prototypes/about/v3" className="border border-[#2e3891] px-6 py-3 text-sm font-semibold text-[#2e3891] hover:bg-[#2e3891] hover:text-white">
                  About PRI
                </Link>
              </div>
            </div>

            <aside className="border-l-4 border-[#A64B2A] bg-white p-7">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8b8fa3]">Our Vision</p>
              <p className="mt-4 font-[family-name:var(--font-heading)] text-[17px] leading-relaxed text-[#22263a]">
                {vision}
              </p>
            </aside>
          </div>
        </section>

        {/* Mission */}
        <section className="mx-auto max-w-6xl px-6 py-16">
          <p className="max-w-3xl text-[17px] leading-relaxed text-[#4b4f66]">{org.intro}</p>
          <h2 className="mt-12 font-[family-name:var(--font-heading)] text-[26px] font-semibold text-[#171a2b]">
            Our Mission
          </h2>
          <ol className="mt-6 grid gap-x-12 gap-y-6 border-t border-[#d8dae6] pt-8 sm:grid-cols-2">
            {missionPoints.map((point, i) => (
              <li key={point} className="flex gap-4">
                <span className="font-[family-name:var(--font-heading)] text-2xl font-semibold text-[#2e3891]/25">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="pt-1 text-[15px] leading-relaxed text-[#4b4f66]">{point}</span>
              </li>
            ))}
          </ol>
        </section>

        {/* Pillars */}
        <section className="border-y border-[#d8dae6] bg-[#f4f4f7]">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <h2 className="font-[family-name:var(--font-heading)] text-[26px] font-semibold text-[#171a2b]">
              Our Functions
            </h2>
            <div className="mt-8 grid gap-px bg-[#d8dae6] sm:grid-cols-3">
              {pillars.map((p) => (
                <div key={p.title} className="bg-white p-7">
                  <h3 className="font-[family-name:var(--font-heading)] text-[19px] font-semibold leading-snug text-[#1c2456]">
                    {p.title}
                  </h3>
                  <div className="mt-3 h-px w-10 bg-[#A64B2A]" />
                  <p className="mt-4 text-sm leading-relaxed text-[#5b5f74]">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Latest updates */}
        <section className="mx-auto max-w-6xl px-6 py-16">
          <div className="flex items-baseline justify-between border-b-2 border-[#2e3891] pb-3">
            <h2 className="font-[family-name:var(--font-heading)] text-[26px] font-semibold text-[#171a2b]">
              Latest Updates
            </h2>
            <Link href="#" className="text-sm font-semibold text-[#2e3891] hover:underline">View all &rarr;</Link>
          </div>
          <div className="divide-y divide-[#d8dae6]">
            {updates.map((u) => (
              <article key={u.title} className="grid gap-3 py-6 sm:grid-cols-[130px_1fr] sm:gap-8">
                <div>
                  <span className="inline-block bg-[#2e3891]/8 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#2e3891]">
                    {u.type}
                  </span>
                  <p className="mt-2 text-[12px] text-[#8b8fa3]">{u.meta}</p>
                </div>
                <div>
                  <h3 className="font-[family-name:var(--font-heading)] text-xl font-semibold leading-snug text-[#171a2b]">
                    <Link href="#" className="hover:text-[#2e3891] hover:underline">{u.title}</Link>
                  </h3>
                  <p className="mt-2 max-w-3xl text-[15px] leading-relaxed text-[#5b5f74]">{u.desc}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Research domains */}
        <section className="border-y border-[#d8dae6] bg-[#f4f4f7]">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <h2 className="font-[family-name:var(--font-heading)] text-[26px] font-semibold text-[#171a2b]">
              Research Domains
            </h2>
            <p className="mt-2 max-w-2xl text-[15px] text-[#5b5f74]">
              Our research spans multiple domains, each contributing to a deeper understanding of
              societal challenges and opportunities for inclusive development.
            </p>
            <div className="mt-8 grid gap-x-10 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
              {researchDomains.map((d) => (
                <div key={d.title} className="border-t border-[#c9ccdb] pt-4">
                  <h3 className="text-[15px] font-semibold text-[#1c2456]">{d.title}</h3>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-[#5b5f74]">{d.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Quick links */}
        <section className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="font-[family-name:var(--font-heading)] text-[26px] font-semibold text-[#171a2b]">
            Where to Start
          </h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {quickLinks.map((q) => (
              <Link key={q.title} href="#" className="group border border-[#d8dae6] p-7 transition-colors hover:border-[#2e3891]">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-[family-name:var(--font-heading)] text-[19px] font-semibold text-[#1c2456]">{q.title}</h3>
                  {q.tag && (
                    <span className="shrink-0 border border-[#A64B2A]/40 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#A64B2A]">
                      {q.tag}
                    </span>
                  )}
                </div>
                <p className="mt-4 text-sm leading-relaxed text-[#5b5f74]">{q.desc}</p>
                <span className="mt-5 inline-block text-sm font-semibold text-[#2e3891] group-hover:underline">Explore &rarr;</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section className="border-t border-[#d8dae6] bg-[#f4f4f7]">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <h2 className="font-[family-name:var(--font-heading)] text-[26px] font-semibold text-[#171a2b]">
              From Our Collaborators
            </h2>
            <div className="mt-8 grid gap-8 sm:grid-cols-3">
              {testimonials.map((t, i) => (
                <figure key={i} className="border-t-2 border-[#2e3891] bg-white p-7">
                  <blockquote className="font-[family-name:var(--font-heading)] text-[17px] leading-relaxed text-[#22263a]">
                    &ldquo;{t.quote}&rdquo;
                  </blockquote>
                  <figcaption className="mt-5 border-t border-[#d8dae6] pt-4 text-sm">
                    <span className="font-semibold text-[#1c2456]">{t.name}</span>
                    <span className="block text-[#8b8fa3]">{t.role}</span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
