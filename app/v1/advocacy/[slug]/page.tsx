import { notFound } from "next/navigation";
import { advocacyItems } from "../../../_content/advocacy";
import { PageHeader, StatusTag } from "../../_ui/kit";
import MediaSlot from "../../_ui/MediaSlot";

export function generateStaticParams() {
  return advocacyItems.map((a) => ({ slug: a.slug }));
}

export default async function AdvocacyDetailV1({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = advocacyItems.find((a) => a.slug === slug);
  if (!item) notFound();

  return (
    <>
      <PageHeader kicker={item.type} title={item.title} />
      <section className="mx-auto max-w-3xl px-6 pb-16">
        <div className="mb-6 flex items-center gap-2 text-sm text-[#5b5f74]">
          {item.date}{item.recipient ? ` · ${item.recipient}` : ""} <StatusTag status={item.status} />
        </div>
        {item.media && <MediaSlot need={item.media} className="max-w-lg" />}
        <p className="mt-8 text-lg leading-relaxed text-[#4b4f66]">{item.summary}</p>
        <button disabled className="mt-8 cursor-not-allowed bg-[#2e3891]/40 px-5 py-2.5 text-sm font-medium text-white">
          Download PDF (not wired)
        </button>
      </section>
    </>
  );
}
