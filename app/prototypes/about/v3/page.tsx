import Header from "../../_shared/v3/Header";
import Footer from "../../_shared/v3/Footer";
import { headingFont, bodyFont } from "../../_shared/v3/fonts";
import {
  org, vision, missionPoints, departments, directorsNote,
  executiveCouncil, steeringCouncil, legalStatus, reports,
} from "../../_shared/content";

const sections = [
  "Institutional Overview",
  "Director's Note",
  "Governance",
  "Organisational Chart",
  "Legal Status",
  "Reports & Plans",
];

export default function AboutV3() {
  return (
    <div className={`${headingFont.variable} ${bodyFont.variable} flex min-h-screen flex-col bg-white font-[family-name:var(--font-body)] text-[#22263a]`}>
      <Header active="about" />

      <main className="flex-1">
        {/* Page title */}
        <section className="border-b border-[#d8dae6] bg-[#f4f4f7]">
          <div className="mx-auto max-w-6xl px-6 py-12">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#A64B2A]">About PRI</p>
            <h1 className="mt-3 font-[family-name:var(--font-heading)] text-[42px] font-semibold leading-tight text-[#171a2b]">
              Institutional Overview
            </h1>
          </div>
        </section>

        <div className="mx-auto grid max-w-6xl gap-12 px-6 py-14 lg:grid-cols-[200px_1fr]">
          {/* Section index */}
          <nav className="hidden lg:block">
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8b8fa3]">On this page</p>
            <ul className="space-y-2 border-l border-[#d8dae6]">
              {sections.map((s) => (
                <li key={s}>
                  <span className="-ml-px block border-l-2 border-transparent pl-4 text-[13px] leading-snug text-[#5b5f74] hover:border-[#A64B2A] hover:text-[#2e3891]">
                    {s}
                  </span>
                </li>
              ))}
            </ul>
          </nav>

          <div className="max-w-3xl">
            {/* Overview */}
            <section>
              <p className="text-[17px] leading-relaxed text-[#4b4f66]">{org.summary}</p>
              <p className="mt-5 text-[17px] leading-relaxed text-[#4b4f66]">{org.intro}</p>

              <div className="mt-10 border-l-4 border-[#A64B2A] bg-[#f4f4f7] p-7">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8b8fa3]">Our Vision</p>
                <p className="mt-3 font-[family-name:var(--font-heading)] text-[19px] leading-relaxed text-[#22263a]">{vision}</p>
              </div>

              <h2 className="mt-12 border-b-2 border-[#2e3891] pb-3 font-[family-name:var(--font-heading)] text-[26px] font-semibold text-[#171a2b]">
                Our Mission
              </h2>
              <ol className="mt-6 space-y-5">
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

            {/* Director's Note */}
            <section className="mt-16">
              <h2 className="border-b-2 border-[#2e3891] pb-3 font-[family-name:var(--font-heading)] text-[26px] font-semibold text-[#171a2b]">
                Director&rsquo;s Note
              </h2>
              <blockquote className="mt-6 font-[family-name:var(--font-heading)] text-[22px] leading-relaxed text-[#22263a]">
                &ldquo;{directorsNote.quote}&rdquo;
              </blockquote>
              <p className="mt-5 text-sm text-[#5b5f74]">
                <span className="font-semibold text-[#1c2456]">{directorsNote.name}</span>
                <span className="block">{directorsNote.role}</span>
              </p>
            </section>

            {/* Departments */}
            <section className="mt-16">
              <h2 className="border-b-2 border-[#2e3891] pb-3 font-[family-name:var(--font-heading)] text-[26px] font-semibold text-[#171a2b]">
                Research &amp; Analysis Wing
              </h2>
              <p className="mt-4 text-[15px] leading-relaxed text-[#5b5f74]">
                Five specialised departments examining gaps, inequalities, and opportunities across
                different societal sections through a multidisciplinary approach.
              </p>
              <div className="mt-6 divide-y divide-[#d8dae6] border-y border-[#d8dae6]">
                {departments.map((d, i) => (
                  <div key={d.name} className="grid gap-2 py-5 sm:grid-cols-[44px_1fr] sm:gap-4">
                    <span className="font-[family-name:var(--font-heading)] text-xl font-semibold text-[#2e3891]/25">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <h3 className="font-[family-name:var(--font-heading)] text-[18px] font-semibold text-[#1c2456]">{d.name}</h3>
                      <ul className="mt-2 flex flex-wrap gap-x-2 gap-y-1">
                        {d.areas.map((a) => (
                          <li key={a} className="text-[13px] text-[#5b5f74] after:ml-2 after:text-[#c9ccdb] after:content-['·'] last:after:content-['']">
                            {a}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Governance */}
            <section className="mt-16">
              <h2 className="border-b-2 border-[#2e3891] pb-3 font-[family-name:var(--font-heading)] text-[26px] font-semibold text-[#171a2b]">
                Governance
              </h2>
              <div className="mt-6 grid gap-8 sm:grid-cols-2">
                <div>
                  <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8b8fa3]">Executive Council</p>
                  <table className="w-full text-left">
                    <tbody className="divide-y divide-[#d8dae6] border-y border-[#d8dae6]">
                      {executiveCouncil.map((p, i) => (
                        <tr key={i}>
                          <td className="py-3 pr-3 text-[15px] font-semibold text-[#1c2456]">{p.name}</td>
                          <td className="py-3 text-right text-[13px] text-[#5b5f74]">{p.role}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div>
                  <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8b8fa3]">Steering Council</p>
                  <table className="w-full text-left">
                    <tbody className="divide-y divide-[#d8dae6] border-y border-[#d8dae6]">
                      {steeringCouncil.map((p, i) => (
                        <tr key={i}>
                          <td className="py-3 pr-3 text-[15px] font-semibold text-[#1c2456]">{p.name}</td>
                          <td className="py-3 text-right text-[13px] text-[#5b5f74]">{p.role}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* Org chart */}
            <section className="mt-16">
              <h2 className="border-b-2 border-[#2e3891] pb-3 font-[family-name:var(--font-heading)] text-[26px] font-semibold text-[#171a2b]">
                Organisational Chart
              </h2>
              <div className="mt-6 flex h-60 items-center justify-center border border-dashed border-[#2e3891]/30 bg-[#f4f4f7] text-sm text-[#8b8fa3]">
                Org chart diagram &mdash; uploaded via CMS (Module A)
              </div>
            </section>

            {/* Legal status */}
            <section className="mt-16">
              <h2 className="border-b-2 border-[#2e3891] pb-3 font-[family-name:var(--font-heading)] text-[26px] font-semibold text-[#171a2b]">
                Legal Status
              </h2>
              <table className="mt-6 w-full text-left">
                <tbody className="divide-y divide-[#d8dae6] border-y border-[#d8dae6]">
                  {legalStatus.map((l) => (
                    <tr key={l.label}>
                      <th scope="row" className="w-40 py-4 pr-4 align-top text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8b8fa3]">
                        {l.label}
                      </th>
                      <td className="py-4">
                        <p className="text-[15px] font-semibold text-[#1c2456]">{l.value}</p>
                        <p className="text-[13px] text-[#8b8fa3]">{l.note}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            {/* Reports */}
            <section className="mt-16">
              <h2 className="border-b-2 border-[#2e3891] pb-3 font-[family-name:var(--font-heading)] text-[26px] font-semibold text-[#171a2b]">
                Annual Reports &amp; Strategic Plans
              </h2>
              <ul className="mt-6 divide-y divide-[#d8dae6] border-y border-[#d8dae6]">
                {reports.map((r) => (
                  <li key={r.title} className="flex items-center justify-between gap-4 py-4">
                    <div>
                      <p className="text-[15px] font-semibold text-[#1c2456]">{r.title}</p>
                      <p className="text-[13px] text-[#8b8fa3]">{r.kind}</p>
                    </div>
                    <span className="shrink-0 border border-[#A64B2A]/40 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#A64B2A]">
                      PDF
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
