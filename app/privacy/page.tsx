import { PageHeader } from "../_ui/kit";
import RichText from "../_ui/RichText";
import { LEGAL_UPDATED, privacyPolicy } from "../_content/legal";
import { formatPublicationDate } from "../_lib/api/publicationAdapter";
import { pageMetadata } from "../_lib/seo";

export const metadata = pageMetadata({
  title: "Privacy policy",
  description: "What personal information the Policy and Research Initiative's website collects, why, and your rights over it.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <>
      <PageHeader compact kicker="Legal" title="Privacy policy" />
      <section className="mx-auto max-w-3xl px-6 py-14">
        <p className="font-[family-name:var(--font-mono)] text-[12px] font-semibold uppercase tracking-[0.12em] text-[#8b8fa3]">Last updated {formatPublicationDate(LEGAL_UPDATED)}</p>
        <div className="mt-8">
          <RichText text={privacyPolicy} />
        </div>
      </section>
    </>
  );
}
