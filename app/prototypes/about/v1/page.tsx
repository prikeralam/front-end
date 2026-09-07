import Header from "../../_shared/v1/Header";
import Footer from "../../_shared/v1/Footer";
import { headingFont, bodyFont } from "../../_shared/v1/fonts";
import {
  org, vision, missionPoints, departments, directorsNote,
  executiveCouncil, steeringCouncil, legalStatus, reports,
} from "../../_shared/content";

export default function AboutV1() {
  return (
    <div className={`${headingFont.variable} ${bodyFont.variable} flex min-h-screen flex-col bg-white font-[family-name:var(--font-body)] text-[#22263a]`}>
      <Header active="about" />

      <main className="flex-1">
        {/* Institutional Overview */}
        <section className="mx-auto max-w-3xl px-6 pb-14 pt-20">
          <p className="text-[13px] uppercase tracking-[0.2em] text-[#2e3891]">About PRI</p>
          <h1 className="mt-5 font-[family-name:var(--font-heading)] text-4xl leading-tight text-[#171a2b] sm:text-5xl">
            {org.tagline}
          </h1>
          <p className="mt-7 text-lg leading-relaxed text-[#4b4f66]">{org.summary}</p>
          <p className="mt-5 text-lg leading-relaxed text-[#4b4f66]">{org.intro}</p>

          <div className="mt-12 border-l-2 border-[#C9972C] pl-6">
            <p className="text-[12px] uppercase tracking-[0.12em] text-[#8b8fa3]">Our Vision</p>
            <p className="mt-3 font-[family-name:var(--font-heading)] text-xl leading-relaxed text-[#171a2b]">{vision}</p>
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

        {/* Director's Note */}
        <section className="border-y border-[#2e3891]/10 bg-[#f7f7f3]">
          <div className="mx-auto max-w-3xl px-6 py-16">
            <p className="text-[13px] uppercase tracking-[0.2em] text-[#2e3891]">Director&rsquo;s Note</p>
            <blockquote className="mt-6 font-[family-name:var(--font-heading)] text-2xl italic leading-snug text-[#171a2b]">
              &ldquo;{directorsNote.quote}&rdquo;
            </blockquote>
            <p className="mt-6 text-sm text-[#5b5f74]">
              &mdash; {directorsNote.name}, {directorsNote.role}
            </p>
          </div>
        </section>

        {/* Research structure */}
        <section className="mx-auto max-w-3xl px-6 py-16">
          <h2 className="font-[family-name:var(--font-heading)] text-2xl italic text-[#171a2b]">Research &amp; Analysis Wing</h2>
          <p className="mt-3 text-[15px] leading-relaxed text-[#5b5f74]">
            Five specialised departments examining gaps, inequalities, and opportunities across
            different societal sections.
          </p>
          <div className="mt-8 divide-y divide-[#2e3891]/10 border-y border-[#2e3891]/10">
            {departments.map((d, i) => (
              <div key={d.name} className="grid gap-3 py-6 sm:grid-cols-[40px_1fr] sm:gap-6">
                <span className="font-[family-name:var(--font-heading)] text-[13px] text-[#C9972C]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="font-[family-name:var(--font-heading)] text-lg text-[#171a2b]">{d.name}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#5b5f74]">{d.areas.join(" · ")}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Governance */}
        <section className="border-y border-[#2e3891]/10 bg-[#f7f7f3]">
          <div className="mx-auto max-w-3xl px-6 py-16">
            <h2 className="font-[family-name:var(--font-heading)] text-2xl italic text-[#171a2b]">Governance</h2>
            <div className="mt-8 grid gap-10 sm:grid-cols-2">
              <div>
                <p className="mb-4 text-[12px] uppercase tracking-[0.12em] text-[#8b8fa3]">Executive Council</p>
                <ul className="space-y-4">
                  {executiveCouncil.map((p, i) => (
                    <li key={i} className="border-b border-[#2e3891]/10 pb-3">
                      <p className="text-[15px] text-[#171a2b]">{p.name}</p>
                      <p className="text-sm text-[#5b5f74]">{p.role}</p>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="mb-4 text-[12px] uppercase tracking-[0.12em] text-[#8b8fa3]">Steering Council</p>
                <ul className="space-y-4">
                  {steeringCouncil.map((p, i) => (
                    <li key={i} className="border-b border-[#2e3891]/10 pb-3">
                      <p className="text-[15px] text-[#171a2b]">{p.name}</p>
                      <p className="text-sm text-[#5b5f74]">{p.role}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Org chart */}
        <section className="mx-auto max-w-3xl px-6 py-16">
          <h2 className="font-[family-name:var(--font-heading)] text-2xl italic text-[#171a2b]">Organisational Chart</h2>
          <div className="mt-8 flex h-56 items-center justify-center border border-dashed border-[#2e3891]/30 bg-[#f7f7f3] text-sm text-[#8b8fa3]">
            Org chart diagram &mdash; uploaded via CMS (Module A)
          </div>
        </section>

        {/* Legal Status */}
        <section className="border-y border-[#2e3891]/10 bg-[#f7f7f3]">
          <div className="mx-auto max-w-3xl px-6 py-16">
            <h2 className="font-[family-name:var(--font-heading)] text-2xl italic text-[#171a2b]">Legal Status</h2>
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

        {/* Annual Reports */}
        <section className="mx-auto max-w-3xl px-6 py-16">
          <h2 className="font-[family-name:var(--font-heading)] text-2xl italic text-[#171a2b]">Annual Reports &amp; Strategic Plans</h2>
          <ul className="mt-8 divide-y divide-[#2e3891]/10 border-y border-[#2e3891]/10">
            {reports.map((r) => (
              <li key={r.title} className="flex items-center justify-between gap-4 py-4">
                <span className="text-[15px] text-[#22263a]">{r.title}</span>
                <span className="shrink-0 text-[12px] uppercase tracking-wide text-[#C9972C]">PDF</span>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <Footer />
    </div>
  );
}
