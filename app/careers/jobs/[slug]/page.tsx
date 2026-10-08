import Link from "next/link";
import { notFound } from "next/navigation";
import { jobs } from "../../../_content/jobs";
import { PageHeader, StatusTag } from "../../../_ui/kit";

export function generateStaticParams() {
  return jobs.map((j) => ({ slug: j.slug }));
}

export default async function JobDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const job = jobs.find((j) => j.slug === slug);
  if (!job) notFound();

  return (
    <>
      <PageHeader kicker="Careers" title={job.title} />
      <section className="mx-auto max-w-3xl px-6 py-16">
        <div className="mb-6 flex items-center gap-2 text-sm text-[#5b5f74]">
          {job.closes} <StatusTag status={job.status} />
        </div>
        <p className="text-lg leading-relaxed text-[#4b4f66]">{job.description}</p>
        <ul className="mt-6 list-disc space-y-2 pl-5 text-[15px] leading-relaxed text-[#4b4f66]">
          {job.responsibilities.map((r) => <li key={r}>{r}</li>)}
        </ul>
        <Link href="/fellowship/apply" className="mt-8 inline-block rounded-md bg-[#253D9A] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1B2C70]">
          Apply &rarr;
        </Link>
      </section>
    </>
  );
}
