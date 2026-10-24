import Link from "next/link";
import { org } from "../../_content/org";
import { PageHeader } from "../../_ui/kit";
import ApplicationForm from "./ApplicationForm";
import { pageMetadata } from "../../_lib/seo";

export const metadata = pageMetadata({
  title: "Apply for a fellowship or internship",
  description: "Apply for a fellowship or an internship at the Policy and Research Initiative.",
  path: "/careers/apply",
});

/** Fellowships and internships; each job opening has its own apply page under /careers/jobs/<slug>/apply. */
export default function CareersApplyPage() {
  return (
    <>
      <PageHeader compact kicker="Careers" title="Apply" />
      <section className="mx-auto max-w-3xl px-6 py-16">
        <Link href="/careers#fellowships" className="text-[14px] font-semibold text-[#253D9A] hover:underline">&larr; Careers</Link>
        <div className="mt-8">
          <ApplicationForm email={org.email} />
        </div>
      </section>
    </>
  );
}
