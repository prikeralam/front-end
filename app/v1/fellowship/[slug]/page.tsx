import { notFound } from "next/navigation";
import { fellows } from "../../../_content/fellows";
import { PageHeader, StatusTag } from "../../_ui/kit";
import MediaSlot from "../../_ui/MediaSlot";

export function generateStaticParams() {
  return fellows.map((f) => ({ slug: f.slug }));
}

export default async function FellowDetailV1({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const fellow = fellows.find((f) => f.slug === slug);
  if (!fellow) notFound();

  return (
    <>
      <PageHeader kicker={fellow.group === "fellow" ? "Current Fellow" : "Past Fellow"} title={fellow.name} />
      <section className="mx-auto max-w-3xl px-6 pb-16">
        <div className="grid gap-8 sm:grid-cols-[200px_1fr]">
          {fellow.photo && <MediaSlot need={fellow.photo} />}
          <div>
            <p className="flex items-center gap-2 text-[15px] text-[#171a2b]">{fellow.role} <StatusTag status={fellow.status} /></p>
            <p className="mt-4 text-[15px] leading-relaxed text-[#5b5f74]">{fellow.bio}</p>
          </div>
        </div>
        <div className="mt-10 border-t border-[#2e3891]/10 pt-6">
          <p className="text-[12px] uppercase tracking-[0.12em] text-[#8b8fa3]">Linked publications</p>
          <p className="mt-2 text-sm text-[#8b8fa3]">No publications linked yet.</p>
        </div>
      </section>
    </>
  );
}
