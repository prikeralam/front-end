import Link from "next/link";
import { org } from "../../_content/org";
import { listJobs } from "../../_lib/api/engage";
import { load } from "../../_lib/api/load";
import { PageHeader } from "../../_ui/kit";
import ApplicationForm from "./ApplicationForm";

export default async function FellowshipApplyPage({ searchParams }: { searchParams: Promise<{ role?: string }> }) {
  const { role } = await searchParams;
  // Without the roles the form still takes fellowship and internship applications.
  const jobs = await load("open roles", listJobs);
  const roles = jobs.ok ? jobs.data.map((j) => ({ slug: j.slug, title: j.title })) : [];

  return (
    <>
      <PageHeader kicker="Engage" title="Apply" />
      <section className="mx-auto max-w-3xl px-6 py-16">
        <Link href="/fellowship" className="text-[14px] font-semibold text-[#253D9A] hover:underline">&larr; Fellowships &amp; Internships</Link>
        <div className="mt-8">
          <ApplicationForm roles={roles} initialRole={typeof role === "string" ? role : undefined} email={org.email} />
        </div>
      </section>
    </>
  );
}
