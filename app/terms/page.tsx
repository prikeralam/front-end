import { PageHeader } from "../_ui/kit";
import RichText from "../_ui/RichText";
import { LEGAL_UPDATED, termsOfUse } from "../_content/legal";
import { formatPublicationDate } from "../_lib/api/publicationAdapter";
import { pageMetadata } from "../_lib/seo";

export const metadata = pageMetadata({
  title: "Terms of use",
  description: "The terms for using the Policy and Research Initiative's website, publications and datasets.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <>
      <PageHeader compact kicker="Legal" title="Terms of use" />
      <section className="mx-auto max-w-3xl px-6 py-14">
        <p className="font-[family-name:var(--font-mono)] text-[12px] font-semibold uppercase tracking-[0.12em] text-[#8b8fa3]">Last updated {formatPublicationDate(LEGAL_UPDATED)}</p>
        <div className="mt-8">
          <RichText text={termsOfUse} />
        </div>
      </section>
    </>
  );
}
