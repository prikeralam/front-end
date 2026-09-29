import { notFound } from "next/navigation";
import { fellows } from "../../_content/fellows";
import { PageHeader, StatusTag } from "../../_ui/kit";
import MediaSlot from "../../_ui/MediaSlot";

export function generateStaticParams() {
  return fellows.map((f) => ({ slug: f.slug }));
}

export default async function FellowDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const fellow = fellows.find((f) => f.slug === slug);
  if (!fellow) notFound();

  return (
    <>
      <PageHeader kicker={fellow.group === "fellow" ? "Current Fellow" : "Past Fellow"} title={fellow.name} />
      <section className="mx-auto max-w-3xl px-6 py-16">
        <div className="grid gap-8 sm:grid-cols-[200px_1fr]">
          {fellow.photo && <MediaSlot need={fellow.photo} />}
          <div>
            <p className="flex items-center gap-2 text-[15px] font-semibold text-[#171a2b]">{fellow.role} <StatusTag status={fellow.status} /></p>
            <p className="mt-4 text-[15px] leading-relaxed text-[#5b5f74]">{fellow.bio}</p>
            {fellow.topic && (
              <div className="mt-6">
                <p className="text-[12px] font-[family-name:var(--font-mono)] font-semibold uppercase tracking-[0.12em] text-[#8b8fa3]">Research Topic</p>
                <p className="mt-2 text-[15px] leading-relaxed text-[#171a2b]">{fellow.topic}</p>
              </div>
            )}
            {fellow.objectives && (
              <div className="mt-6">
                <p className="text-[12px] font-[family-name:var(--font-mono)] font-semibold uppercase tracking-[0.12em] text-[#8b8fa3]">Objectives</p>
                <ul className="mt-2 list-disc space-y-1.5 pl-5 text-[15px] leading-relaxed text-[#5b5f74]">
                  {fellow.objectives.map((o) => <li key={o}>{o}</li>)}
                </ul>
              </div>
            )}
          </div>
        </div>
        <div className="mt-10 rounded-lg border border-[#e6e8f0] bg-white p-6">
          <p className="text-[12px] font-[family-name:var(--font-mono)] font-semibold uppercase tracking-[0.12em] text-[#8b8fa3]">Linked publications</p>
          <p className="mt-2 text-sm text-[#8b8fa3]">No publications linked yet.</p>
        </div>
      </section>
    </>
  );
}
