import Link from "next/link";
import { redirect } from "next/navigation";
import { org } from "../../_content/org";
import { jobApplyPath } from "../../_lib/api/engageAdapter";
import { PageHeader } from "../../_ui/kit";
import ApplicationForm from "./ApplicationForm";
import { pageMetadata } from "../../_lib/seo";

export const metadata = pageMetadata({
  title: "Apply",
  description: "Apply for a fellowship or an internship at the Policy and Research Initiative.",
  path: "/fellowship/apply",
});

export default async function FellowshipApplyPage({ searchParams }: { searchParams: Promise<{ role?: string | string[] }> }) {
  const { role } = await searchParams;
  // Job pages used to link here with ?role=<slug>; each role now has its own apply page, so shared links keep working.
  if (typeof role === "string" && role) redirect(jobApplyPath(role));

  return (
    <>
      <PageHeader compact kicker="Engage" title="Apply" />
      <section className="mx-auto max-w-3xl px-6 py-16">
        <Link href="/fellowship" className="text-[14px] font-semibold text-[#253D9A] hover:underline">&larr; Fellowships &amp; Internships</Link>
        <div className="mt-8">
          <ApplicationForm email={org.email} />
        </div>
      </section>
    </>
  );
}
