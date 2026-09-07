import { notFound } from "next/navigation";
import { publications } from "../../../_content/publications";
import { PageHeader, StatusTag } from "../../_ui/kit";
import MediaSlot from "../../_ui/MediaSlot";

export function generateStaticParams() {
  return publications.map((p) => ({ slug: p.slug }));
}

export default async function PublicationDetailV2({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const pub = publications.find((p) => p.slug === slug);
  if (!pub) notFound();

  return (
    <>
      <PageHeader kicker={`${pub.format} · ${pub.theme}`} title={pub.title} />
      <section className="mx-auto max-w-3xl px-6 py-16">
        <div className="flex items-center gap-2 text-sm text-[#5b5f74]">
          {pub.authors.join(", ")} &middot; {pub.date} <StatusTag status={pub.status} />
        </div>
        {pub.cover && <MediaSlot need={pub.cover} className="mt-6 max-w-sm" />}
        <p className="mt-8 text-lg leading-relaxed text-[#4b4f66]">{pub.abstract}</p>
        <div className="mt-10 flex flex-wrap gap-3">
          <button disabled className="cursor-not-allowed rounded-full bg-[#0F6B5C]/40 px-5 py-2.5 text-sm font-semibold text-white">
            Download PDF (not wired)
          </button>
          <button disabled className="cursor-not-allowed rounded-full border border-[#dcdee8] px-5 py-2.5 text-sm font-semibold text-[#8b8fa3]">
            Export citation
          </button>
        </div>
      </section>
    </>
  );
}
