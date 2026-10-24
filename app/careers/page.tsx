import Link from "next/link";
import { LoadError, NotPublishedYet } from "../_ui/ApiMessage";
import { listJobs } from "../_lib/api/engage";
import { jobAvailability } from "../_lib/api/engageAdapter";
import { load } from "../_lib/api/load";
import { PageHeader, SectionHeading } from "../_ui/kit";
import { pageMetadata } from "../_lib/seo";

export const metadata = pageMetadata({
  title: "Careers",
  description: "Open roles at the Policy and Research Initiative.",
  path: "/careers",
});

export default async function CareersPage() {
  const result = await load("open roles", listJobs);

  return (
    <>
      <PageHeader kicker="Engage" title="Careers" />

      <section className="border-b border-[#e6e8f0] bg-white">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <SectionHeading>Open Roles</SectionHeading>
          {!result.ok && <LoadError what="our open roles" />}
          {result.ok && result.data.length === 0 && <NotPublishedYet>There are no open roles right now.</NotPublishedYet>}
          <ul className="mt-8 grid gap-3">
            {(result.ok ? result.data : []).map((j) => (
              <li key={j.slug}>
                <Link href={`/careers/jobs/${j.slug}`} className="flex items-center justify-between gap-4 rounded-lg border border-[#e6e8f0] bg-white px-5 py-4 transition-shadow hover:shadow-[0_2px_16px_rgba(23,26,43,0.10)]">
                  <div>
                    <p className="text-[15px] font-semibold text-[#171a2b]">{j.title}</p>
                    <p className="mt-1 text-[13px] text-[#8b8fa3]">{[jobAvailability(j), j.location, j.employment].filter(Boolean).join(" · ")}</p>
                  </div>
                  <span className="shrink-0 text-sm font-semibold text-[#253D9A]">View &rarr;</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
