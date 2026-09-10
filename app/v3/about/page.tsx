import Link from "next/link";
import { org, vision, missionPoints, departments } from "../../_content/org";
import { directorsNote, legalStatus } from "../../_content/people";
import { StatusTag, NumberedItem } from "../_ui/kit";

const sections = [
  "Institutional Overview",
  "Who We Are",
  "Director's Note",
  "Research & Analysis Wing",
  "Governance",
  "Legal Status",
];

export default function AboutV3() {
  return (
    <>
      <section className="border-b border-[#e6dbc7] bg-[#F1E9D8]">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#B8862F]">Who we are</p>
          <h1 className="mt-3 font-[family-name:var(--font-heading)] text-[42px] font-semibold leading-tight text-[#171a2b]">
            Institutional Overview
          </h1>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-12 px-6 py-14 lg:grid-cols-[200px_1fr]">
        <nav className="hidden lg:block">
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8b8fa3]">On this page</p>
          <ul className="space-y-2 border-l border-[#e6dbc7]">
            {sections.map((s) => (
              <li key={s}>
                <span className="-ml-px block border-l-2 border-transparent pl-4 text-[13px] leading-snug text-[#5b5f74] hover:border-[#B8862F] hover:text-[#253D9A]">
                  {s}
                </span>
              </li>
            ))}
          </ul>
        </nav>

        <div className="max-w-3xl">
          <section>
            <p className="text-[17px] leading-relaxed text-[#4b4f66]">{org.summary}</p>
            <p className="mt-5 text-[17px] leading-relaxed text-[#4b4f66]">{org.intro}</p>

            <h2 className="mt-12 border-b-2 border-[#253D9A] pb-3 font-[family-name:var(--font-heading)] text-[26px] font-semibold text-[#171a2b]">
              Who We Are
            </h2>

            <div className="mt-8 border-l-4 border-[#B8862F] bg-[#F1E9D8] p-7">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8b8fa3]">Our Vision</p>
              <p className="mt-3 font-[family-name:var(--font-heading)] text-[19px] leading-relaxed text-[#22263a]">{vision.text}</p>
            </div>

            <h2 className="mt-12 border-b-2 border-[#253D9A] pb-3 font-[family-name:var(--font-heading)] text-[26px] font-semibold text-[#171a2b]">
              Our Mission
            </h2>
            <div className="mt-6 space-y-5">
              {missionPoints.map((point, i) => (
                <NumberedItem key={point} n={i + 1}>
                  <span className="text-[15px] leading-relaxed text-[#4b4f66]">{point}</span>
                </NumberedItem>
              ))}
            </div>
          </section>

          <section className="mt-16">
            <h2 className="flex items-center gap-2 border-b-2 border-[#253D9A] pb-3 font-[family-name:var(--font-heading)] text-[26px] font-semibold text-[#171a2b]">
              Director&rsquo;s Note <StatusTag status={directorsNote.status} />
            </h2>
            <blockquote className="mt-6 font-[family-name:var(--font-heading)] text-[22px] leading-relaxed text-[#22263a]">
              &ldquo;{directorsNote.quote}&rdquo;
            </blockquote>
            <p className="mt-5 text-sm text-[#5b5f74]">
              <span className="font-semibold text-[#4A1B26]">{directorsNote.name}</span>
              <span className="block">{directorsNote.role}</span>
            </p>
          </section>

          <section className="mt-16">
            <h2 className="border-b-2 border-[#253D9A] pb-3 font-[family-name:var(--font-heading)] text-[26px] font-semibold text-[#171a2b]">
              Research &amp; Analysis Wing
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-[#5b5f74]">
              Five specialised departments examining gaps, inequalities, and opportunities across
              different societal sections through a multidisciplinary approach.
            </p>
            <div className="mt-6 divide-y divide-[#e6dbc7] border-y border-[#e6dbc7]">
              {departments.map((d, i) => (
                <div key={d.name} className="py-5">
                  <NumberedItem n={i + 1}>
                    <h3 className="font-[family-name:var(--font-heading)] text-[18px] font-semibold text-[#4A1B26]">{d.name}</h3>
                    <ul className="mt-2 flex flex-wrap gap-x-2 gap-y-1">
                      {d.areas.map((a) => (
                        <li key={a} className="text-[13px] text-[#5b5f74] after:ml-2 after:text-[#c9ccdb] after:content-['·'] last:after:content-['']">
                          {a}
                        </li>
                      ))}
                    </ul>
                  </NumberedItem>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-16">
            <h2 className="border-b-2 border-[#253D9A] pb-3 font-[family-name:var(--font-heading)] text-[26px] font-semibold text-[#171a2b]">
              Governance
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-[#5b5f74]">
              PRI&rsquo;s governance includes a 7-person team, 2 patrons, and a 16-member Executive Council.
            </p>
            <Link href="/v3/people" className="mt-4 inline-block text-sm font-semibold text-[#253D9A] hover:underline">
              Meet our people &rarr;
            </Link>
          </section>

          <section className="mt-16">
            <h2 className="border-b-2 border-[#253D9A] pb-3 font-[family-name:var(--font-heading)] text-[26px] font-semibold text-[#171a2b]">
              Legal Status
            </h2>
            <table className="mt-6 w-full text-left">
              <tbody className="divide-y divide-[#e6dbc7] border-y border-[#e6dbc7]">
                {legalStatus.map((l) => (
                  <tr key={l.label}>
                    <th scope="row" className="w-40 py-4 pr-4 align-top text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8b8fa3]">
                      {l.label}
                    </th>
                    <td className="py-4">
                      <p className="text-[15px] font-semibold text-[#4A1B26]">{l.value}</p>
                      <p className="text-[13px] text-[#8b8fa3]">{l.note}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>
      </div>
    </>
  );
}
