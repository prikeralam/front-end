import Link from "next/link";
import Header from "../../_shared/v2/Header";
import Footer from "../../_shared/v2/Footer";
import { headingFont, bodyFont, monoFont } from "../../_shared/v2/fonts";
import { org, missionPoints, pillars, researchDomains, updates, quickLinks, testimonials } from "../../_shared/content";

const stats = [
  { value: "05", label: "Research departments" },
  { value: "11", label: "Research domains" },
  { value: "03", label: "Operational wings" },
  { value: "01", label: "Central data repository" },
];

export default function HomeV2() {
  return (
    <div className={`${headingFont.variable} ${bodyFont.variable} ${monoFont.variable} flex min-h-screen flex-col bg-white font-[family-name:var(--font-body)] text-[#22263a]`}>
      <Header active="home" />

      <main className="flex-1">
        {/* Hero */}
        <section className="border-b border-[#e6e8f0]">
          <div className="mx-auto grid max-w-6xl gap-12 px-6 py-20 lg:grid-cols-[1.15fr_1fr] lg:items-center">
            <div>
              <span className="inline-block rounded-full bg-[#1B8A6B]/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#1B8A6B]">
                {org.tagline}
              </span>
              <h1 className="mt-6 text-5xl font-extrabold leading-[1.06] tracking-tight text-[#171a2b] sm:text-6xl">
                Inequality,<br />measured.
              </h1>
              <p className="mt-6 max-w-lg text-lg leading-relaxed text-[#4b4f66]">{org.summary}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="#" className="rounded-full bg-[#2e3891] px-6 py-3 text-sm font-semibold text-white hover:bg-[#242c72]">
                  Explore the Data Hub
                </Link>
                <Link href="/prototypes/about/v2" className="rounded-full border border-[#dcdee8] px-6 py-3 text-sm font-semibold text-[#2e3891] hover:border-[#2e3891]">
                  About PRI
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-[#e6e8f0] bg-[#e6e8f0]">
              {stats.map((s) => (
                <div key={s.label} className="bg-[#fafbfc] p-7">
                  <p className="font-[family-name:var(--font-mono)] text-3xl font-semibold text-[#2e3891]">{s.value}</p>
                  <p className="mt-2 text-sm text-[#5b5f74]">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Mission */}
        <section className="border-b border-[#e6e8f0] bg-[#fafbfc]">
          <div className="mx-auto max-w-6xl px-6 py-14">
            <p className="max-w-3xl text-lg leading-relaxed text-[#22263a]">{org.intro}</p>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {missionPoints.map((point, i) => (
                <div key={point} className="border-t-2 border-[#2e3891] pt-4">
                  <span className="font-[family-name:var(--font-mono)] text-xs font-semibold text-[#1B8A6B]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p className="mt-2 text-sm leading-relaxed text-[#4b4f66]">{point}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Latest work */}
        <section className="mx-auto max-w-6xl px-6 py-16">
          <div className="flex items-end justify-between">
            <h2 className="text-2xl font-bold tracking-tight text-[#171a2b]">Latest work</h2>
            <Link href="#" className="text-sm font-semibold text-[#1B8A6B] hover:underline">View all &rarr;</Link>
          </div>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {updates.map((u) => (
              <Link key={u.title} href="#" className="group flex flex-col rounded-xl border border-[#e6e8f0] p-6 transition-shadow hover:shadow-[0_2px_16px_rgba(46,56,145,0.10)]">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-[#2e3891]/8 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-[#2e3891]">{u.type}</span>
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-[#8b8fa3]">{u.topic}</span>
                </div>
                <h3 className="mt-4 text-[16px] font-semibold leading-snug text-[#22263a] group-hover:text-[#2e3891]">{u.title}</h3>
                <p className="mt-2 flex-1 text-[13px] leading-relaxed text-[#5b5f74]">{u.desc}</p>
                <p className="mt-4 font-[family-name:var(--font-mono)] text-xs text-[#8b8fa3]">{u.meta}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* Research domains */}
        <section className="border-y border-[#e6e8f0] bg-[#fafbfc]">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <h2 className="text-2xl font-bold tracking-tight text-[#171a2b]">Research domains</h2>
            <p className="mt-2 max-w-2xl text-[15px] text-[#5b5f74]">
              Eleven domains spanning the socio-economic and political factors that shape inclusive development.
            </p>
            <div className="mt-8 flex flex-wrap gap-2">
              {researchDomains.map((d) => (
                <Link
                  key={d.title}
                  href="#"
                  title={d.desc}
                  className="rounded-full border border-[#dcdee8] bg-white px-4 py-2 text-sm font-medium text-[#3a3f55] transition-colors hover:border-[#2e3891] hover:text-[#2e3891]"
                >
                  {d.title}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Pillars */}
        <section className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="text-2xl font-bold tracking-tight text-[#171a2b]">How we work</h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-3">
            {pillars.map((p, i) => (
              <div key={p.title} className="rounded-xl border border-[#e6e8f0] p-7">
                <span className="font-[family-name:var(--font-mono)] text-xs font-semibold text-[#1B8A6B]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-3 text-lg font-bold text-[#171a2b]">{p.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-[#5b5f74]">{p.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Quick links */}
        <section className="border-y border-[#e6e8f0] bg-[#fafbfc]">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <h2 className="text-2xl font-bold tracking-tight text-[#171a2b]">Start here</h2>
            <div className="mt-8 grid gap-5 sm:grid-cols-3">
              {quickLinks.map((q) => (
                <Link key={q.title} href="#" className="group rounded-xl border border-[#e6e8f0] bg-white p-7 transition-colors hover:border-[#2e3891]">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-lg font-bold text-[#171a2b]">{q.title}</h3>
                    {q.tag && (
                      <span className="shrink-0 rounded-full bg-[#f0f1f5] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#8b8fa3]">{q.tag}</span>
                    )}
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-[#5b5f74]">{q.desc}</p>
                  <span className="mt-5 inline-block text-sm font-semibold text-[#1B8A6B] group-hover:underline">Explore &rarr;</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="text-2xl font-bold tracking-tight text-[#171a2b]">Trusted by collaborators</h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-3">
            {testimonials.map((t, i) => (
              <figure key={i} className="rounded-xl bg-[#2e3891] p-7 text-white">
                <blockquote className="text-[15px] leading-relaxed text-white/95">&ldquo;{t.quote}&rdquo;</blockquote>
                <figcaption className="mt-5 border-t border-white/15 pt-4 text-sm">
                  <span className="font-semibold">{t.name}</span>
                  <span className="block text-white/60">{t.role}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
