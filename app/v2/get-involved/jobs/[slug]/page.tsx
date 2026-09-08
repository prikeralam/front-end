import { notFound } from "next/navigation";
import { jobs } from "../../../../_content/jobs";
import { PageHeader, StatusTag } from "../../../_ui/kit";

export function generateStaticParams() {
  return jobs.map((j) => ({ slug: j.slug }));
}

export default async function JobDetailV2({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const job = jobs.find((j) => j.slug === slug);
  if (!job) notFound();

  return (
    <>
      <PageHeader kicker={`${job.location} · ${job.employment}`} title={job.title} />
      <section className="mx-auto max-w-3xl px-6 py-16">
        <div className="mb-6 flex items-center gap-2 text-sm text-[#5b5f74]">
          Closes: {job.closes} <StatusTag status={job.status} />
        </div>
        <p className="text-lg leading-relaxed text-[#4b4f66]">{job.description}</p>
        <ul className="mt-6 list-disc space-y-2 pl-5 text-[15px] leading-relaxed text-[#4b4f66]">
          {job.responsibilities.map((r) => <li key={r}>{r}</li>)}
        </ul>
        <button disabled className="mt-8 cursor-not-allowed rounded-full bg-[#243D9A]/40 px-5 py-2.5 text-sm font-semibold text-white">
          Apply (outbound link not set)
        </button>
      </section>
    </>
  );
}
