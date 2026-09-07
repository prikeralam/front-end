import Link from "next/link";
import Header from "../../_shared/v1/Header";
import Footer from "../../_shared/v1/Footer";
import { headingFont, bodyFont } from "../../_shared/v1/fonts";
import { org, missionPoints, pillars, updates, quickLinks, testimonials } from "../../_shared/content";

export default function HomeV1() {
  return (
    <div className={`${headingFont.variable} ${bodyFont.variable} flex min-h-screen flex-col bg-white font-[family-name:var(--font-body)] text-[#22263a]`}>
      <Header active="home" />

      <main className="flex-1">
        {/* Hero */}
        <section className="mx-auto max-w-5xl px-6 pb-16 pt-20">
          <p className="text-[13px] uppercase tracking-[0.2em] text-[#2e3891]">{org.tagline}</p>
          <h1 className="mt-5 max-w-3xl font-[family-name:var(--font-heading)] text-5xl leading-[1.08] text-[#171a2b] sm:text-[62px]">
            Evidence for a more equitable society.
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-relaxed text-[#4b4f66]">{org.summary}</p>
          <div className="mt-9 flex flex-wrap items-center gap-8">
            <Link href="#" className="border-b-2 border-[#C9972C] pb-1 text-sm font-medium tracking-wide text-[#171a2b] transition-colors hover:border-[#2e3891]">
              Explore our research &rarr;
            </Link>
            <Link href="/prototypes/about/v1" className="border-b border-transparent pb-1 text-sm tracking-wide text-[#5b5f74] transition-colors hover:border-[#2e3891] hover:text-[#2e3891]">
              About PRI
            </Link>
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

        {/* Three pillars */}
        <section className="mx-auto max-w-5xl px-6 py-16">
          <h2 className="font-[family-name:var(--font-heading)] text-2xl italic text-[#171a2b]">How we work</h2>
          <div className="mt-8 grid gap-10 sm:grid-cols-3">
            {pillars.map((p) => (
              <div key={p.title} className="border-t-2 border-[#2e3891] pt-5">
                <h3 className="font-[family-name:var(--font-heading)] text-lg leading-snug text-[#171a2b]">{p.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-[#5b5f74]">{p.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Latest Updates */}
        <section className="border-t border-[#2e3891]/10 bg-[#f7f7f3]">
          <div className="mx-auto max-w-5xl px-6 py-16">
            <div className="flex items-baseline justify-between">
              <h2 className="font-[family-name:var(--font-heading)] text-2xl italic text-[#171a2b]">Latest from PRI</h2>
              <Link href="#" className="text-sm text-[#2e3891] hover:underline">All updates &rarr;</Link>
            </div>
            <div className="mt-8 divide-y divide-[#2e3891]/10 border-y border-[#2e3891]/10">
              {updates.map((u) => (
                <article key={u.title} className="grid gap-2 py-6 sm:grid-cols-[110px_1fr] sm:gap-6">
                  <span className="pt-1 text-[12px] uppercase tracking-[0.12em] text-[#C9972C]">{u.type}</span>
                  <div>
                    <Link href="#" className="font-[family-name:var(--font-heading)] text-xl leading-snug text-[#171a2b] hover:text-[#2e3891]">
                      {u.title}
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
          <h2 className="font-[family-name:var(--font-heading)] text-2xl italic text-[#171a2b]">Where to start</h2>
          <div className="mt-8 grid gap-px overflow-hidden border border-[#2e3891]/15 bg-[#2e3891]/15 sm:grid-cols-3">
            {quickLinks.map((q) => (
              <Link key={q.title} href="#" className="group flex flex-col justify-between bg-white p-7 transition-colors hover:bg-[#2e3891]">
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-[family-name:var(--font-heading)] text-lg text-[#171a2b] group-hover:text-white">{q.title}</h3>
                    {q.tag && (
                      <span className="shrink-0 border border-[#2e3891]/25 px-2 py-0.5 text-[10px] uppercase tracking-wide text-[#2e3891] group-hover:border-white/40 group-hover:text-white">
                        {q.tag}
                      </span>
                    )}
                  </div>
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
                <figure key={i} className="border-l-2 border-[#C9972C] pl-5">
                  <blockquote className="font-[family-name:var(--font-heading)] text-[17px] italic leading-snug text-white/95">
                    &ldquo;{t.quote}&rdquo;
                  </blockquote>
                  <figcaption className="mt-4 text-sm text-white/60">
                    {t.name} &middot; {t.role}
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
