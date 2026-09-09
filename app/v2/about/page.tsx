import Image from "next/image";
import Link from "next/link";
import { org, vision, missionPoints, departments } from "../../_content/org";
import { directorsNote, legalStatus, reports, orgChart } from "../../_content/people";
import { teamPhotos } from "../../_content/gallery";
import { PageHeader, SectionHeading, DocumentRow, StatusTag } from "../_ui/kit";
import MediaSlot from "../_ui/MediaSlot";

export default function AboutV2() {
  return (
    <>
      <PageHeader kicker="Who we are" title={org.tagline} intro={org.summary} />

      <section className="mx-auto max-w-6xl px-6 py-16">
        <SectionHeading>Who We Are</SectionHeading>
        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <p className="text-lg leading-relaxed text-[#4b4f66]">{org.intro}</p>
          <div className="rounded-xl bg-[#243D9A] p-8 text-white">
            <p className="text-xs font-bold uppercase tracking-wider text-white/60">Our Vision</p>
            <p className="mt-4 text-lg leading-relaxed">{vision.text}</p>
          </div>
        </div>

        <div className="mt-8 rounded-xl border border-[#e6e8f0] bg-white p-8">
          <p className="text-xs font-bold uppercase tracking-wider text-[#8b8fa3]">Our Mission</p>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            {missionPoints.map((point, i) => (
              <div key={point} className="flex gap-4">
                <span className="font-[family-name:var(--font-mono)] text-xs font-semibold text-[#E4633F]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-sm leading-relaxed text-[#4b4f66]">{point}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-[#e6e8f0] bg-[#fafbfc]">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#8b8fa3]">
            Director&rsquo;s Note <StatusTag status={directorsNote.status} />
          </p>
          <blockquote className="mt-5 max-w-3xl text-2xl font-semibold leading-snug tracking-tight text-[#171a2b]">
            &ldquo;{directorsNote.quote}&rdquo;
          </blockquote>
          <p className="mt-5 text-sm text-[#5b5f74]">
            <span className="font-semibold text-[#22263a]">{directorsNote.name}</span> &middot; {directorsNote.role}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <SectionHeading>Life at PRI</SectionHeading>
        <p className="mt-2 max-w-2xl text-[15px] text-[#5b5f74]">Moments from PRI&rsquo;s office and everyday work.</p>
        <div className="mt-8 grid gap-5 sm:grid-cols-3">
          {teamPhotos.map((p) => (
            <div key={p.slug} className="relative aspect-[4/3] overflow-hidden rounded-xl">
              <Image src={p.src} alt={p.description} fill sizes="(min-width: 640px) 33vw, 100vw" className="object-cover" />
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <SectionHeading>Research &amp; Analysis Wing</SectionHeading>
        <p className="mt-2 max-w-2xl text-[15px] text-[#5b5f74]">
          Five specialised departments examining gaps, inequalities, and opportunities across different societal sections.
        </p>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {departments.map((d, i) => (
            <div key={d.name} className="rounded-xl border border-[#e6e8f0] p-6">
              <span className="font-[family-name:var(--font-mono)] text-xs font-semibold text-[#E4633F]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-3 text-[16px] font-bold leading-snug text-[#171a2b]">{d.name}</h3>
              <ul className="mt-4 space-y-1.5">
                {d.areas.map((a) => (
                  <li key={a} className="text-[13px] leading-relaxed text-[#5b5f74]">{a}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-[#e6e8f0] bg-[#fafbfc]">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <SectionHeading>Governance</SectionHeading>
          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-[#5b5f74]">
            PRI&rsquo;s governance includes a 7-person team, 2 patrons, and a 17-member Executive Council.
          </p>
          <Link href="/v2/people" className="mt-5 inline-block text-sm font-semibold text-[#243D9A] hover:underline">
            Meet our people &rarr;
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <SectionHeading>Organisational Chart</SectionHeading>
        <MediaSlot need={orgChart} className="mt-8" />
      </section>

      <section className="border-t border-[#e6e8f0] bg-[#fafbfc]">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <SectionHeading>Legal Status</SectionHeading>
          <dl className="mt-8 grid gap-4 sm:grid-cols-3">
            {legalStatus.map((l) => (
              <div key={l.label} className="rounded-lg border border-[#e6e8f0] bg-white px-5 py-4">
                <dt className="text-xs font-bold uppercase tracking-wider text-[#8b8fa3]">{l.label}</dt>
                <dd className="mt-1 text-[15px] font-semibold text-[#171a2b]">{l.value}</dd>
                <dd className="text-[13px] text-[#8b8fa3]">{l.note}</dd>
              </div>
            ))}
          </dl>

          <p className="mb-4 mt-10 text-xs font-bold uppercase tracking-wider text-[#8b8fa3]">Annual Reports &amp; Strategic Plans</p>
          <ul className="grid gap-3">
            {reports.map((r) => <DocumentRow key={r.title} doc={r} />)}
          </ul>
        </div>
      </section>
    </>
  );
}
