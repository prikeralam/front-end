import Image from "next/image";
import Link from "next/link";
import { advocacyItems, advocacyTypes, scorecard, policyConversationPhotos } from "../../_content/advocacy";
import { PageHeader, SectionHeading, FilterBar, StatusTag } from "../_ui/kit";
import MediaSlot from "../_ui/MediaSlot";

export default function AdvocacyV2() {
  return (
    <>
      <PageHeader
        kicker="Advocacy & Policy Engagement"
        title="Legislative memos, briefs, scorecards, and letters"
        intro="Active engagement with policymakers to ensure research findings translate into actionable policies and solutions."
      />

      <section className="mx-auto max-w-6xl px-6 py-16">
        <FilterBar facets={[{ label: "Type", options: advocacyTypes }]} />
        <div className="mt-8 grid gap-4">
          {advocacyItems.map((a) => (
            <Link key={a.slug} href={`/v2/advocacy/${a.slug}`} className="grid gap-2 rounded-xl border border-[#e6e8f0] bg-white p-5 transition-shadow hover:shadow-[0_2px_16px_rgba(15,107,92,0.10)] sm:grid-cols-[140px_1fr] sm:gap-6">
              <span className="rounded bg-[#243D9A]/8 px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-[#243D9A]">{a.type}</span>
              <div>
                <h3 className="flex items-center gap-2 text-lg font-bold text-[#171a2b]">
                  {a.title} <StatusTag status={a.status} />
                </h3>
                <p className="mt-1 text-sm text-[#5b5f74]">{a.summary}</p>
                <p className="mt-1 text-[12px] text-[#8b8fa3]">{a.date}{a.recipient ? ` · ${a.recipient}` : ""}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-t border-[#e6e8f0] bg-[#fafbfc]">
        <div className="mx-auto max-w-6xl overflow-x-auto px-6 py-16">
          <SectionHeading>{scorecard.caption}</SectionHeading>
          <div className="mt-6 overflow-hidden rounded-xl border border-[#e6e8f0] bg-white">
            <table className="w-full min-w-[500px] text-left text-sm">
              <thead>
                <tr className="border-b border-[#e6e8f0] bg-[#fafbfc]">
                  {scorecard.columns.map((c) => (
                    <th key={c} className="px-4 py-3 text-[12px] font-bold uppercase tracking-wide text-[#8b8fa3]">{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {scorecard.rows.map((row, i) => (
                  <tr key={i} className="border-b border-[#e6e8f0] last:border-0">
                    {row.map((cell, j) => <td key={j} className="px-4 py-3 text-[#22263a]">{cell}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-[12px] text-[#8b8fa3]">Placeholder scorecard — institutions and scores to be supplied.</p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <SectionHeading>Event Snapshots</SectionHeading>
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {advocacyItems.filter((a) => a.type === "Event Snapshot").map((a) => (
            <div key={a.slug}>
              {a.media && <MediaSlot need={a.media} />}
              <p className="mt-2 text-sm text-[#5b5f74]">{a.title}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-[#e6e8f0] bg-[#fafbfc]">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <SectionHeading>Policy Conversations</SectionHeading>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#5b5f74]">
            Moments from PRI&rsquo;s meetings with policymakers and community leaders.
          </p>
          <div className="mt-8 grid gap-5 sm:grid-cols-4">
            {policyConversationPhotos.map((p) => (
              <div key={p.slug} className="relative aspect-[4/3] overflow-hidden rounded-xl">
                <Image src={p.src} alt={p.description} fill sizes="(min-width: 640px) 25vw, 50vw" className="object-cover" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
