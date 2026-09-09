import Image from "next/image";
import Link from "next/link";
import { org, pillars } from "../_content/org";
import { updates, quickLinks } from "../_content/updates";
import { testimonials } from "../_content/people";
import { heroProjects } from "../_content/projects";
import { heroProjectPhotos } from "../_lib/stockPhotos";
import { officeLifePhotos } from "../_content/gallery";
import { SectionHeading, Quote, StatusTag } from "./_ui/kit";
import HeroCarousel from "./_ui/HeroCarousel";

export default function HomeV1() {
  return (
    <>
      {/* Hero banners */}
      <div className="mx-auto max-w-5xl px-6 pt-8">
        <HeroCarousel projects={heroProjects} photos={heroProjectPhotos} />
      </div>

      {/* Intro */}
      <section className="mx-auto max-w-5xl px-6 pb-14 pt-16">
        <p className="text-[13px] uppercase tracking-[0.2em] text-[#243D9A]">{org.tagline}</p>
        <h1 className="mt-5 max-w-3xl font-[family-name:var(--font-heading)] text-5xl leading-[1.08] text-[#171a2b] sm:text-[62px]">
          Evidence for a more equitable society.
        </h1>
        <p className="mt-7 max-w-2xl text-lg leading-relaxed text-[#4b4f66]">{org.summary}</p>
        <div className="mt-9 flex flex-wrap items-center gap-8">
          <Link href="/v1/research" className="border-b-2 border-[#C9972C] pb-1 text-sm font-medium tracking-wide text-[#171a2b] transition-colors hover:border-[#243D9A]">
            Explore our research &rarr;
          </Link>
          <Link href="/v1/about" className="border-b border-transparent pb-1 text-sm tracking-wide text-[#5b5f74] transition-colors hover:border-[#243D9A] hover:text-[#243D9A]">
            About PRI
          </Link>
        </div>
      </section>

      {/* Pillars */}
      <section className="mx-auto max-w-5xl px-6 py-16">
        <SectionHeading>How we work</SectionHeading>
        <div className="mt-8 grid gap-10 sm:grid-cols-3">
          {pillars.map((p) => (
            <Link key={p.title} href={p.href} className="block border-t-2 border-[#243D9A] pt-5 hover:opacity-80">
              <h3 className="font-[family-name:var(--font-heading)] text-lg leading-snug text-[#171a2b]">{p.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-[#5b5f74]">{p.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Inside PRI */}
      <section className="mx-auto max-w-5xl px-6 py-16">
        <SectionHeading>Inside PRI</SectionHeading>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#5b5f74]">A look at PRI&rsquo;s team and everyday work.</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-4">
          {officeLifePhotos.map((p) => (
            <div key={p.slug} className="relative aspect-[4/3] overflow-hidden">
              <Image src={p.src} alt={p.description} fill sizes="(min-width: 640px) 25vw, 50vw" className="object-cover" />
            </div>
          ))}
        </div>
      </section>

      {/* Latest Updates */}
      <section className="border-t border-[#243D9A]/10 bg-[#f7f7f3]">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <SectionHeading>Latest from PRI</SectionHeading>
          <div className="mt-8 divide-y divide-[#243D9A]/10 border-y border-[#243D9A]/10">
            {updates.map((u) => (
              <article key={u.title} className="grid gap-2 py-6 sm:grid-cols-[110px_1fr] sm:gap-6">
                <span className="pt-1 text-[12px] uppercase tracking-[0.12em] text-[#C9972C]">{u.type}</span>
                <div>
                  <Link href={u.href} className="flex items-center gap-2 font-[family-name:var(--font-heading)] text-xl leading-snug text-[#171a2b] hover:text-[#243D9A]">
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
        <div className="mt-8 grid gap-px overflow-hidden border border-[#243D9A]/15 bg-[#243D9A]/15 sm:grid-cols-3">
          {quickLinks.map((q) => (
            <Link key={q.title} href={`/v1${q.href}`} className="group flex flex-col justify-between bg-white p-7 transition-colors hover:bg-[#243D9A]">
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
