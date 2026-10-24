import Link from "next/link";
import RichText from "../../../_ui/RichText";
import { notFound } from "next/navigation";
import { LoadError } from "../../../_ui/ApiMessage";
import { getJobBySlug } from "../../../_lib/api/engage";
import { jobApplyPath, jobAvailability, jobDescriptionPath, todayInIndia } from "../../../_lib/api/engageAdapter";
import { load } from "../../../_lib/api/load";
import { PageHeader } from "../../../_ui/kit";
import type { Metadata } from "next";
import { jobPostingJsonLd, pageMetadata } from "../../../_lib/seo";
import JsonLd from "../../../_ui/JsonLd";
import CopyLinkButton from "./CopyLinkButton";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const result = await load("this role", () => getJobBySlug(slug));
  const job = result.ok ? result.data : null;
  if (!job) return { title: "Careers" };
  return pageMetadata({
    title: `${job.title} (job opening)`,
    description: job.summary || `${job.title} at the Policy and Research Initiative.`,
    path: `/careers/jobs/${job.slug}`,
  });
}

export default async function JobDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const result = await load("this role", () => getJobBySlug(slug));
  if (!result.ok) {
    return (
      <>
        <PageHeader kicker="Careers" title="Open role" />
        <section className="mx-auto max-w-3xl px-6 py-16"><LoadError what="this role" /></section>
      </>
    );
  }
  const job = result.data;
  if (!job) notFound();

  return (
    <>
      {/* A closed role is no longer a job posting for search engines. */}
      {!job.closed && <JsonLd data={jobPostingJsonLd(job, todayInIndia())} />}
      <PageHeader kicker="Careers" title={job.title} />
      <section className="mx-auto max-w-3xl px-6 py-16">
        <Link href="/careers" className="text-[14px] font-semibold text-[#253D9A] hover:underline">&larr; All open roles</Link>
        <p className="mt-6 text-sm text-[#5b5f74]">{[jobAvailability(job), job.location, job.employment].filter(Boolean).join(" · ")}</p>
        {job.summary && <p className="mt-6 text-lg leading-relaxed text-[#4b4f66]">{job.summary}</p>}
        {job.description && (
          <div className="mt-10">
            <RichText text={job.description} />
          </div>
        )}
        {job.writingSample === "required" && (
          <p className="mt-8 text-[14px] text-[#4b4f66]">This role asks for a writing sample with your CV and cover letter.</p>
        )}
        {job.closed && (
          <p className="mt-8 rounded-md border border-[#e3e6f0] bg-[#f7f8fc] px-4 py-3 text-[14px] font-semibold text-[#3a3f55]" role="status">
            This role is no longer taking applications.
          </p>
        )}
        <div className="mt-8 flex flex-wrap items-center gap-3">
          {!job.closed && (
            <Link href={jobApplyPath(job.slug)} className="inline-block rounded-md bg-[#253D9A] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1B2C70]">
              Apply for this role &rarr;
            </Link>
          )}
          {job.hasDescriptionPdf && (
            <>
              <a href={jobDescriptionPath(job.slug)} target="_blank" rel="noopener" className="inline-block rounded-md border border-[#253D9A] px-5 py-2.5 text-sm font-semibold text-[#253D9A] hover:bg-[#253D9A]/5">
                Job description (PDF)
              </a>
              <CopyLinkButton path={jobDescriptionPath(job.slug)} title={`${job.title}: job description`} />
            </>
          )}
        </div>
      </section>
    </>
  );
}
