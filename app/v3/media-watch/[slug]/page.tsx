import { notFound } from "next/navigation";
import { mediaCases } from "../../../_content/mediaCases";
import { PageHeader, StatusTag } from "../../_ui/kit";
import MediaSlot from "../../_ui/MediaSlot";

export function generateStaticParams() {
  return mediaCases.map((c) => ({ slug: c.slug }));
}

export default async function MediaCaseDetailV3({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = mediaCases.find((c) => c.slug === slug);
  if (!item) notFound();

  return (
    <>
      <PageHeader kicker={item.classification} title={item.headline} />
      <section className="mx-auto max-w-3xl px-6 py-16">
        <div className="mb-6 flex items-center gap-2 text-sm text-[#5b5f74]">
          {item.source} &middot; {item.date} <StatusTag status={item.status} />
        </div>
        {item.screenshot && <MediaSlot need={item.screenshot} className="max-w-lg" />}
        <p className="mt-8 text-[17px] leading-relaxed text-[#4b4f66]">{item.summary}</p>
        <div className="mt-8 border-l-4 border-[#B8862F] bg-[#F1E9D8] p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8b8fa3]">PRI&rsquo;s Response</p>
          <p className="mt-2 text-[15px] leading-relaxed text-[#171a2b]">{item.response}</p>
        </div>
      </section>
    </>
  );
}
