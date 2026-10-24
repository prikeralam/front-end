import Link from "next/link";
import { LoadError, NotPublishedYet } from "../_ui/ApiMessage";
import { listJobs } from "../_lib/api/engage";
import { jobAvailability } from "../_lib/api/engageAdapter";
import { load } from "../_lib/api/load";
import { PageHeader, SectionHeading } from "../_ui/kit";
import { pageMetadata } from "../_lib/seo";

export const metadata = pageMetadata({
  title: "Careers",
  description: "Open roles, fellowships and internships at the Policy and Research Initiative.",
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

      {/* Linked from the menu and footer, and where the old /fellowship page redirects. */}
      <section id="fellowships" className="scroll-mt-24 border-b border-[#e6e8f0]">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <SectionHeading>Fellowships &amp; Internships</SectionHeading>
          <div className="mt-8 rounded-lg border border-[#e6e8f0] bg-white p-8">
            <p className="max-w-2xl text-[15px] leading-relaxed text-[#5b5f74]">
              We welcome fellows and interns who want to work on PRI&rsquo;s research and data. Applications are open at any
              time: send us your CV and a cover letter whenever you are ready, and we will get back to you.
            </p>
            <Link href="/careers/apply" className="mt-6 inline-block rounded-md bg-[#253D9A] px-6 py-3 text-sm font-semibold text-white hover:bg-[#1B2C70]">
              Apply for a fellowship or internship &rarr;
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
