import Image from "next/image";
import Link from "next/link";
import { advocacyItems, advocacyTypes, scorecard, policyConversationPhotos } from "../../_content/advocacy";
import { PageHeader, SectionHeading, FilterBar, StatusTag } from "../_ui/kit";
import MediaSlot from "../_ui/MediaSlot";

export default function AdvocacyV1() {
  return (
    <>
      <PageHeader
        kicker="Advocacy & Policy Engagement"
        title="Legislative memos, briefs, scorecards, and letters"
        intro="Active engagement with policymakers to ensure research findings translate into actionable policies and solutions."
      />

      <section className="mx-auto max-w-5xl px-6 pb-16">
        <FilterBar facets={[{ label: "Type", options: advocacyTypes }]} />
        <div className="mt-8 divide-y divide-[#243D9A]/10 border-y border-[#243D9A]/10">
          {advocacyItems.map((a) => (
            <Link key={a.slug} href={`/v1/advocacy/${a.slug}`} className="grid gap-2 py-6 hover:bg-[#f7f7f3] sm:grid-cols-[140px_1fr] sm:gap-6">
              <span className="text-[12px] uppercase tracking-[0.12em] text-[#C9972C]">{a.type}</span>
              <div>
                <h3 className="flex items-center gap-2 font-[family-name:var(--font-heading)] text-lg text-[#171a2b]">
                  {a.title} <StatusTag status={a.status} />
                </h3>
                <p className="mt-1 text-sm text-[#5b5f74]">{a.summary}</p>
                <p className="mt-1 text-[12px] text-[#8b8fa3]">{a.date}{a.recipient ? ` · ${a.recipient}` : ""}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-t border-[#243D9A]/10 bg-[#f7f7f3]">
        <div className="mx-auto max-w-5xl overflow-x-auto px-6 py-16">
          <SectionHeading>{scorecard.caption}</SectionHeading>
          <table className="mt-6 w-full min-w-[500px] text-left text-sm">
            <thead>
              <tr className="border-b border-[#243D9A]/20">
                {scorecard.columns.map((c) => (
                  <th key={c} className="pb-3 pr-4 text-[12px] uppercase tracking-wide text-[#8b8fa3]">{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {scorecard.rows.map((row, i) => (
                <tr key={i} className="border-b border-[#243D9A]/10">
                  {row.map((cell, j) => <td key={j} className="py-3 pr-4 text-[#22263a]">{cell}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-3 text-[12px] text-[#8b8fa3]">Placeholder scorecard — institutions and scores to be supplied.</p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-16">
        <SectionHeading>Event Snapshots</SectionHeading>
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          {advocacyItems.filter((a) => a.type === "Event Snapshot").map((a) => (
            <div key={a.slug}>
              {a.media && <MediaSlot need={a.media} />}
              <p className="mt-2 text-sm text-[#5b5f74]">{a.title}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-[#243D9A]/10 bg-[#f7f7f3]">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <SectionHeading>Policy Conversations</SectionHeading>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#5b5f74]">
            Moments from PRI&rsquo;s meetings with policymakers and community leaders.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-4">
            {policyConversationPhotos.map((p) => (
              <div key={p.slug} className="relative aspect-[4/3] overflow-hidden">
                <Image src={p.src} alt={p.description} fill sizes="(min-width: 640px) 25vw, 50vw" className="object-cover" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
