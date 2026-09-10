import { reports } from "../../../_content/people";
import { PageHeader, DocumentRow } from "../../_ui/kit";

export default function AnnualReportsV1() {
  return (
    <>
      <PageHeader kicker="About" title="Annual Reports & Strategic Plans" />
      <section className="mx-auto max-w-3xl px-6 pb-16 pt-8">
        <ul className="divide-y divide-[#253D9A]/10 border-y border-[#253D9A]/10">
          {reports.map((r) => <DocumentRow key={r.title} doc={r} />)}
        </ul>
      </section>
    </>
  );
}
