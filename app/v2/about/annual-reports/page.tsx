import { reports, legalStatus } from "../../../_content/people";
import { PageHeader, DocumentRow, SectionHeading } from "../../_ui/kit";

export default function AnnualReportsV2() {
  return (
    <>
      <PageHeader kicker="About" title="Annual Reports & Strategic Plans" />
      <section className="mx-auto max-w-6xl px-6 pb-16 pt-8">
        <ul className="grid gap-3">
          {reports.map((r) => <DocumentRow key={r.title} doc={r} />)}
        </ul>
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
        </div>
      </section>
    </>
  );
}
