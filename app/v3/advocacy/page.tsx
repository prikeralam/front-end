import Link from "next/link";
import { advocacyItems, advocacyTypes, scorecard } from "../../_content/advocacy";
import { PageHeader, SectionHeading, FilterBar, StatusTag } from "../_ui/kit";
import MediaSlot from "../_ui/MediaSlot";

export default function AdvocacyV3() {
  return (
    <>
      <PageHeader
        kicker="Advocacy & Policy Engagement"
        title="Legislative memos, briefs, scorecards, and letters"
        intro="Active engagement with policymakers to ensure research findings translate into actionable policies and solutions."
      />

      <section className="mx-auto max-w-6xl px-6 py-16">
        <FilterBar facets={[{ label: "Type", options: advocacyTypes }]} />
        <div className="mt-8 divide-y divide-[#e6dbc7] border-y border-[#e6dbc7]">
          {advocacyItems.map((a) => (
            <Link key={a.slug} href={`/v3/advocacy/${a.slug}`} className="grid gap-2 py-6 hover:bg-[#F1E9D8] sm:grid-cols-[140px_1fr] sm:gap-6">
              <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#B8862F]">{a.type}</span>
              <div>
                <h3 className="flex items-center gap-2 font-[family-name:var(--font-heading)] text-lg font-semibold text-[#171a2b]">
                  {a.title} <StatusTag status={a.status} />
                </h3>
                <p className="mt-1 text-sm text-[#5b5f74]">{a.summary}</p>
                <p className="mt-1 text-[12px] text-[#8b8fa3]">{a.date}{a.recipient ? ` · ${a.recipient}` : ""}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-t border-[#e6dbc7] bg-[#F1E9D8]">
        <div className="mx-auto max-w-6xl overflow-x-auto px-6 py-16">
          <SectionHeading>{scorecard.caption}</SectionHeading>
          <table className="mt-6 w-full min-w-[500px] text-left text-sm">
            <thead>
              <tr className="border-b-2 border-[#6B2737]">
                {scorecard.columns.map((c) => (
                  <th key={c} scope="col" className="pb-3 pr-4 text-[12px] font-semibold uppercase tracking-wide text-[#8b8fa3]">{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {scorecard.rows.map((row, i) => (
                <tr key={i} className="border-b border-[#e6dbc7]">
                  {row.map((cell, j) => <td key={j} className="py-3 pr-4 text-[#22263a]">{cell}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-3 text-[12px] text-[#8b8fa3]">Placeholder scorecard — institutions and scores to be supplied.</p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
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
    </>
  );
}
