import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { org } from "../../../../_content/org";
import { getJobBySlug } from "../../../../_lib/api/engage";
import { jobAvailability } from "../../../../_lib/api/engageAdapter";
import { load } from "../../../../_lib/api/load";
import { pageMetadata } from "../../../../_lib/seo";
import { LoadError } from "../../../../_ui/ApiMessage";
import { PageHeader } from "../../../../_ui/kit";
import ApplicationForm from "../../../../fellowship/apply/ApplicationForm";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const result = await load("this role", () => getJobBySlug(slug));
  const job = result.ok ? result.data : null;
  if (!job) return { title: "Apply" };
  return pageMetadata({
    title: `Apply: ${job.title}`,
    description: `Apply for ${job.title} at the Policy and Research Initiative.`,
    path: `/careers/jobs/${job.slug}/apply`,
  });
}

/** Applying for one job opening: the form is locked to the role, so there is no fellowship or internship choice. */
export default async function JobApplyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const result = await load("this role", () => getJobBySlug(slug));
  if (!result.ok) {
    return (
      <>
        <PageHeader compact kicker="Careers" title="Apply" />
        <section className="mx-auto max-w-3xl px-6 py-16"><LoadError what="this role" /></section>
      </>
    );
  }
  const job = result.data;
  if (!job) notFound();
  const rolePath = `/careers/jobs/${job.slug}`;

  return (
    <>
      <PageHeader compact kicker="Careers" title={`Apply: ${job.title}`} />
      <section className="mx-auto max-w-3xl px-6 py-16">
        <Link href={rolePath} className="text-[14px] font-semibold text-[#253D9A] hover:underline">&larr; {job.title}</Link>
        <p className="mt-6 text-sm text-[#5b5f74]">{[jobAvailability(job), job.location, job.employment].filter(Boolean).join(" · ")}</p>
        <div className="mt-8">
          {job.closed ? (
            <div className="rounded-lg border border-[#e3e6f0] bg-white p-6 sm:p-8" role="status">
              <p className="text-[18px] leading-snug text-[#171a2b]">This role is no longer taking applications.</p>
              <p className="mt-2 text-[14.5px] leading-relaxed text-[#4b4f66]">
                See the <Link href="/careers" className="font-semibold text-[#253D9A] hover:underline">open roles</Link>, or write to{" "}
                <a href={`mailto:${org.email}`} className="font-semibold text-[#253D9A] hover:underline">{org.email}</a>.
              </p>
            </div>
          ) : (
            <ApplicationForm fixedRole={{ slug: job.slug, title: job.title, writingSample: job.writingSample }} email={org.email} />
          )}
        </div>
      </section>
    </>
  );
}
