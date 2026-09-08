import Image from "next/image";
import Link from "next/link";
import { org, pillars } from "../_content/org";
import { updates, quickLinks } from "../_content/updates";
import { testimonials } from "../_content/people";
import { heroProjects } from "../_content/projects";
import { heroProjectPhotos } from "../_lib/stockPhotos";
import { SectionHeading, Quote, StatusTag } from "./_ui/kit";

const stats = [
  { value: "05", label: "Research departments" },
  { value: "11", label: "Research domains" },
  { value: "03", label: "Operational wings" },
  { value: "01", label: "Central data repository" },
];

export default function HomeV2() {
  return (
    <>
      {/* Hero banners */}
      <section className="grid sm:grid-cols-3">
        {heroProjects.map((p) => (
          <Link key={p.slug} href={`/v2/projects/${p.slug}`} className="group relative block h-[380px] overflow-hidden sm:h-[480px]">
            <Image
              src={heroProjectPhotos[p.slug]}
              alt={p.title}
              fill
              priority
              sizes="(min-width: 640px) 33vw, 100vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-7">
              <h2 className="text-2xl font-extrabold leading-tight text-white">{p.title}</h2>
              <p className="mt-2 max-w-xs text-sm leading-relaxed text-white/80">{p.blurb}</p>
              <span className="mt-5 inline-block rounded-full bg-[#E4633F] px-5 py-2.5 text-sm font-semibold text-white">
                Explore project &rarr;
              </span>
            </div>
          </Link>
        ))}
      </section>

      {/* Hero */}
      <section className="border-b border-[#e6e8f0]">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 py-16 lg:grid-cols-[1.15fr_1fr] lg:items-center">
          <div>
            <span className="inline-block rounded-full bg-[#E4633F]/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#E4633F]">
              {org.tagline}
            </span>
            <h1 className="mt-6 text-5xl font-extrabold leading-[1.06] tracking-tight text-[#171a2b] sm:text-6xl">
              Inequality,<br />measured.
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-[#4b4f66]">{org.summary}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/v2/research" className="rounded-full bg-[#243D9A] px-6 py-3 text-sm font-semibold text-white hover:bg-[#1B2C70]">
                Explore our research
              </Link>
              <Link href="/v2/about" className="rounded-full border border-[#dcdee8] px-6 py-3 text-sm font-semibold text-[#243D9A] hover:border-[#243D9A]">
                About PRI
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-[#e6e8f0] bg-[#e6e8f0]">
            {stats.map((s) => (
              <div key={s.label} className="bg-[#fafbfc] p-7">
                <p className="font-[family-name:var(--font-mono)] text-3xl font-semibold text-[#243D9A]">{s.value}</p>
                <p className="mt-2 text-sm text-[#5b5f74]">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <SectionHeading>How we work</SectionHeading>
        <div className="mt-8 grid gap-5 sm:grid-cols-3">
          {pillars.map((p, i) => (
            <Link key={p.title} href={`/v2${p.href}`} className="rounded-xl border border-[#e6e8f0] p-7 transition-shadow hover:shadow-[0_2px_16px_rgba(15,107,92,0.10)]">
              <span className="font-[family-name:var(--font-mono)] text-xs font-semibold text-[#E4633F]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-3 text-lg font-bold text-[#171a2b]">{p.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-[#5b5f74]">{p.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Latest work */}
      <section className="border-y border-[#e6e8f0] bg-[#fafbfc]">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="flex items-end justify-between">
            <SectionHeading>Latest work</SectionHeading>
            <span className="text-sm font-semibold text-[#E4633F]">Updated regularly</span>
          </div>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {updates.map((u) => (
              <Link key={u.title} href={u.href} className="group flex flex-col rounded-xl border border-[#e6e8f0] bg-white p-6 transition-shadow hover:shadow-[0_2px_16px_rgba(15,107,92,0.10)]">
                <span className="inline-block w-fit rounded bg-[#243D9A]/8 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-[#243D9A]">{u.type}</span>
                <h3 className="mt-4 flex items-start gap-2 text-[16px] font-semibold leading-snug text-[#22263a] group-hover:text-[#243D9A]">
                  {u.title} <StatusTag status={u.status} />
                </h3>
                <p className="mt-2 flex-1 text-[13px] leading-relaxed text-[#5b5f74]">{u.desc}</p>
                <p className="mt-4 font-[family-name:var(--font-mono)] text-xs text-[#8b8fa3]">{u.meta}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Quick links */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <SectionHeading>Start here</SectionHeading>
        <div className="mt-8 grid gap-5 sm:grid-cols-3">
          {quickLinks.map((q) => (
            <Link key={q.title} href={`/v2${q.href}`} className="group rounded-xl border border-[#e6e8f0] bg-white p-7 transition-colors hover:border-[#243D9A]">
              <h3 className="text-lg font-bold text-[#171a2b]">{q.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-[#5b5f74]">{q.desc}</p>
              <span className="mt-5 inline-block text-sm font-semibold text-[#E4633F] group-hover:underline">Explore &rarr;</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="border-t border-[#e6e8f0] bg-[#fafbfc]">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <SectionHeading>Trusted by collaborators</SectionHeading>
          <div className="mt-8 grid gap-5 sm:grid-cols-3">
            {testimonials.map((t, i) => (
              <Quote key={i} quote={t.quote} name={t.name} role={t.role} status={t.status} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
