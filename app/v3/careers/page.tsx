import Link from "next/link";
import { jobs, involvementPaths } from "../../_content/jobs";
import { PageHeader, SectionHeading, FormMock, StatusTag } from "../_ui/kit";

export default function GetInvolvedV3() {
  return (
    <>
      <PageHeader kicker="Careers" title="Ways to work with PRI" />

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-6 sm:grid-cols-4">
          {involvementPaths.map((p) => (
            <div key={p.title} className="border-t-2 border-[#253D9A] pt-4">
              <h3 className="font-[family-name:var(--font-heading)] text-lg font-semibold text-[#171a2b]">{p.title}</h3>
              <p className="mt-2 text-sm text-[#5b5f74]">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-[#e6dbc7] bg-[#F1E9D8]">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <SectionHeading>Open Roles</SectionHeading>
          <ul className="mt-8 divide-y divide-[#e6dbc7] border-y border-[#e6dbc7]">
            {jobs.map((j) => (
              <li key={j.slug}>
                <Link href={`/v3/careers/jobs/${j.slug}`} className="flex items-center justify-between gap-4 py-5 hover:text-[#253D9A]">
                  <div>
                    <p className="flex items-center gap-2 text-[15px] font-semibold text-[#171a2b]">{j.title} <StatusTag status={j.status} /></p>
                    <p className="mt-1 text-[13px] text-[#8b8fa3]">{j.location} &middot; {j.employment}</p>
                  </div>
                  <span className="shrink-0 text-sm text-[#253D9A]">View &rarr;</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <SectionHeading>Volunteer &amp; Intern</SectionHeading>
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          <FormMock title="Volunteer application" fields={["Full name", "Email", "Area of interest"]} />
          <FormMock title="Internship interest" fields={["Full name", "Email", "Department", "Availability"]} />
        </div>
      </section>

      <section className="border-t border-[#e6dbc7] bg-[#F1E9D8]">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <SectionHeading>Mailing List</SectionHeading>
          <div className="mt-6 max-w-md">
            <FormMock title="Join the mailing list" fields={["Email", "Interest: General or Media briefings"]} />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <SectionHeading>Suggestions &amp; Whistleblower Reports</SectionHeading>
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          <FormMock title="Suggestions" fields={["Name (optional)", "Email (optional)", "Suggestion"]} />
          <div className="border-2 border-[#B8862F]/60 bg-white p-6">
            <FormMock title="Whistleblower report" fields={["Report details"]} note="Anonymity toggle: identifying metadata is suppressed when selected. Handling policy to be confirmed before this form goes live." />
          </div>
        </div>
      </section>
    </>
  );
}
