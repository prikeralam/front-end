import { notFound } from "next/navigation";
import { publications } from "../../../_content/publications";
import { PageHeader, StatusTag } from "../../_ui/kit";
import MediaSlot from "../../_ui/MediaSlot";

export function generateStaticParams() {
  return publications.map((p) => ({ slug: p.slug }));
}

export default async function PublicationDetailV1({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const pub = publications.find((p) => p.slug === slug);
  if (!pub) notFound();

  return (
    <>
      <PageHeader kicker={`${pub.format} · ${pub.theme}`} title={pub.title} />
      <section className="mx-auto max-w-3xl px-6 pb-16">
        <div className="flex items-center gap-2 text-sm text-[#5b5f74]">
          {pub.authors.join(", ")} &middot; {pub.date} <StatusTag status={pub.status} />
        </div>
        {pub.cover && <MediaSlot need={pub.cover} className="mt-6 max-w-sm" />}
        <p className="mt-8 text-lg leading-relaxed text-[#4b4f66]">{pub.abstract}</p>
        <div className="mt-10 flex flex-wrap gap-3">
          <button disabled className="cursor-not-allowed bg-[#2e3891]/40 px-5 py-2.5 text-sm font-medium text-white">
            Download PDF (not wired)
          </button>
          <button disabled className="cursor-not-allowed border border-[#2e3891]/30 px-5 py-2.5 text-sm font-medium text-[#2e3891]/60">
            Export citation
          </button>
        </div>
      </section>
    </>
  );
}
