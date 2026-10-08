import { legalStatus } from "../../_content/org";
import { NotPublishedYet, LoadError } from "../../_ui/ApiMessage";
import { listDocuments } from "../../_lib/api/documents";
import { load } from "../../_lib/api/load";
import { PageHeader, DocumentRow, SectionHeading } from "../../_ui/kit";
import { pageMetadata } from "../../_lib/seo";

export const metadata = pageMetadata({
  title: "Annual Reports",
  description: "Annual reports of the Policy and Research Initiative (PRI), covering its research, programmes and finances.",
  path: "/about/annual-reports",
});

export default async function AnnualReportsPage() {
  const result = await load("annual reports", () => listDocuments("annual-report"));

  return (
    <>
      <PageHeader kicker="About" title="Annual Reports" />
      <section className="mx-auto max-w-6xl px-6 pb-16 pt-8">
        {!result.ok && <LoadError what="the annual reports" />}
        {result.ok && result.data.length === 0 && <NotPublishedYet>Reports will be published here soon.</NotPublishedYet>}
        <ul className="grid gap-3">
          {(result.ok ? result.data : []).map((r) => <DocumentRow key={r.title} doc={r} />)}
        </ul>
      </section>

      <section className="border-t border-[#e6e8f0] bg-white">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <SectionHeading>Legal Status</SectionHeading>
          <dl className="mt-8 grid gap-4 sm:grid-cols-3">
            {legalStatus.map((l) => (
              <div key={l.label} className="rounded-lg border border-[#e6e8f0] bg-white px-5 py-4">
                <dt className="text-xs font-[family-name:var(--font-mono)] font-semibold uppercase tracking-[0.12em] text-[#8b8fa3]">{l.label}</dt>
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
