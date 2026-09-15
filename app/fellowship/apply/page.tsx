import Link from "next/link";
import { PageHeader, FormMock } from "../../_ui/kit";

export default function FellowshipApplyV2() {
  return (
    <>
      <PageHeader kicker="Fellowship & Internship Portal" title="Apply" />
      <section className="mx-auto max-w-3xl px-6 py-16">
        <Link href="/fellowship" className="text-[14px] font-semibold text-[#253D9A] hover:underline">&larr; Back to Fellowship &amp; Internship</Link>
        <div className="mt-8">
          <FormMock
            title="Fellowship / Internship application"
            fields={["Full name", "Email", "Programme", "CV upload", "Writing sample upload", "Statement of interest"]}
          />
        </div>
      </section>
    </>
  );
}
