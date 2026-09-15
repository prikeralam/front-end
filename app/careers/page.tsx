import Link from "next/link";
import { jobs, involvementPaths } from "../_content/jobs";
import { PageHeader, SectionHeading, StatusTag } from "../_ui/kit";

export default function GetInvolvedV2() {
  return (
    <>
      <PageHeader kicker="Careers" title="Ways to work with PRI" />

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-5 sm:grid-cols-4">
          {involvementPaths.map((p) => (
            <div key={p.title} className="rounded-xl border border-[#e6e8f0] bg-white p-5">
              <h3 className="text-lg font-bold text-[#171a2b]">{p.title}</h3>
              <p className="mt-2 text-sm text-[#5b5f74]">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-[#e6e8f0] bg-[#fafbfc]">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <SectionHeading>Open Roles</SectionHeading>
          <ul className="mt-8 grid gap-3">
            {jobs.map((j) => (
              <li key={j.slug}>
                <Link href={`/careers/jobs/${j.slug}`} className="flex items-center justify-between gap-4 rounded-xl border border-[#e6e8f0] bg-white px-5 py-4 transition-shadow hover:shadow-[0_2px_16px_rgba(15,107,92,0.10)]">
                  <div>
                    <p className="flex items-center gap-2 text-[15px] font-semibold text-[#171a2b]">{j.title} <StatusTag status={j.status} /></p>
                    <p className="mt-1 text-[13px] text-[#8b8fa3]">{j.location} &middot; {j.employment}</p>
                  </div>
                  <span className="shrink-0 text-sm font-semibold text-[#253D9A]">View &rarr;</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
