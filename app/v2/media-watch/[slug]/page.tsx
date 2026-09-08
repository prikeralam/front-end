import { notFound } from "next/navigation";
import { mediaCases } from "../../../_content/mediaCases";
import { PageHeader, StatusTag } from "../../_ui/kit";
import MediaSlot from "../../_ui/MediaSlot";

export function generateStaticParams() {
  return mediaCases.map((c) => ({ slug: c.slug }));
}

export default async function MediaCaseDetailV2({ params }: { params: Promise<{ slug: string }> }) {
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
        <p className="mt-8 text-lg leading-relaxed text-[#4b4f66]">{item.summary}</p>
        <div className="mt-8 rounded-xl bg-[#243D9A] p-6 text-white">
          <p className="text-xs font-bold uppercase tracking-wider text-white/60">PRI&rsquo;s Response</p>
          <p className="mt-2 text-[15px] leading-relaxed">{item.response}</p>
        </div>
      </section>
    </>
  );
}
