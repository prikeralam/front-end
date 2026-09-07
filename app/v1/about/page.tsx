import { org, vision, missionPoints, departments } from "../../_content/org";
import { directorsNote, executiveCouncil, steeringCouncil, legalStatus, reports, orgChart } from "../../_content/people";
import { PageHeader, SectionHeading, PersonCard, DocumentRow, StatusTag } from "../_ui/kit";
import MediaSlot from "../_ui/MediaSlot";

export default function AboutV1() {
  return (
    <>
      <PageHeader kicker="About PRI" title={org.tagline} intro={org.summary} />

      <section className="mx-auto max-w-3xl px-6 pb-14">
        <p className="text-lg leading-relaxed text-[#4b4f66]">{org.intro}</p>

        <div className="mt-12 border-l-2 border-[#C9972C] pl-6">
          <p className="text-[12px] uppercase tracking-[0.12em] text-[#8b8fa3]">Our Vision</p>
          <p className="mt-3 font-[family-name:var(--font-heading)] text-xl leading-relaxed text-[#171a2b]">{vision.text}</p>
        </div>

        <div className="mt-12">
          <p className="text-[12px] uppercase tracking-[0.12em] text-[#8b8fa3]">Our Mission</p>
          <ul className="mt-5 space-y-4">
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

      <section className="border-y border-[#2e3891]/10 bg-[#f7f7f3]">
        <div className="mx-auto max-w-3xl px-6 py-16">
          <p className="flex items-center gap-2 text-[13px] uppercase tracking-[0.2em] text-[#2e3891]">
            Director&rsquo;s Note <StatusTag status={directorsNote.status} />
          </p>
          <blockquote className="mt-6 font-[family-name:var(--font-heading)] text-2xl italic leading-snug text-[#171a2b]">
            &ldquo;{directorsNote.quote}&rdquo;
          </blockquote>
          <p className="mt-6 text-sm text-[#5b5f74]">&mdash; {directorsNote.name}, {directorsNote.role}</p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-16">
        <SectionHeading>Research &amp; Analysis Wing</SectionHeading>
        <p className="mt-3 text-[15px] leading-relaxed text-[#5b5f74]">
          Five specialised departments examining gaps, inequalities, and opportunities across different societal sections.
        </p>
        <div className="mt-8 divide-y divide-[#2e3891]/10 border-y border-[#2e3891]/10">
          {departments.map((d, i) => (
            <div key={d.name} className="grid gap-3 py-6 sm:grid-cols-[40px_1fr] sm:gap-6">
              <span className="font-[family-name:var(--font-heading)] text-[13px] text-[#C9972C]">{String(i + 1).padStart(2, "0")}</span>
              <div>
                <h3 className="font-[family-name:var(--font-heading)] text-lg text-[#171a2b]">{d.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#5b5f74]">{d.areas.join(" · ")}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-[#2e3891]/10 bg-[#f7f7f3]">
        <div className="mx-auto max-w-3xl px-6 py-16">
          <SectionHeading>Governance</SectionHeading>
          <div className="mt-8 grid gap-8 sm:grid-cols-2">
            <div>
              <p className="mb-4 text-[12px] uppercase tracking-[0.12em] text-[#8b8fa3]">Executive Council</p>
              <div className="grid gap-3">
                {executiveCouncil.map((p) => <PersonCard key={p.slug} person={p} />)}
              </div>
            </div>
            <div>
              <p className="mb-4 text-[12px] uppercase tracking-[0.12em] text-[#8b8fa3]">Steering Council</p>
              <div className="grid gap-3">
                {steeringCouncil.map((p) => <PersonCard key={p.slug} person={p} />)}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-16">
        <SectionHeading>Organisational Chart</SectionHeading>
        <MediaSlot need={orgChart} className="mt-8" />
      </section>

      <section className="border-y border-[#2e3891]/10 bg-[#f7f7f3]">
        <div className="mx-auto max-w-3xl px-6 py-16">
          <SectionHeading>Legal Status</SectionHeading>
          <dl className="mt-8 grid gap-6 border-t border-[#2e3891]/10 pt-6 sm:grid-cols-3">
            {legalStatus.map((l) => (
              <div key={l.label}>
                <dt className="text-[12px] uppercase tracking-[0.12em] text-[#8b8fa3]">{l.label}</dt>
                <dd className="mt-2 text-[15px] text-[#171a2b]">{l.value}</dd>
                <dd className="mt-1 text-[13px] text-[#8b8fa3]">{l.note}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-16">
        <SectionHeading>Annual Reports &amp; Strategic Plans</SectionHeading>
        <ul className="mt-8 divide-y divide-[#2e3891]/10 border-y border-[#2e3891]/10">
          {reports.map((r) => <DocumentRow key={r.title} doc={r} />)}
        </ul>
      </section>
    </>
  );
}
