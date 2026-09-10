import { reports } from "../../../_content/people";
import { PageHeader, DocumentRow } from "../../_ui/kit";

export default function AnnualReportsV2() {
  return (
    <>
      <PageHeader kicker="About" title="Annual Reports & Strategic Plans" />
      <section className="mx-auto max-w-6xl px-6 pb-16 pt-8">
        <ul className="grid gap-3">
          {reports.map((r) => <DocumentRow key={r.title} doc={r} />)}
        </ul>
      </section>
    </>
  );
}
