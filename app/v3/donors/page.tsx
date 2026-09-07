import { impactMetrics, namedPrograms, funderReports, donationTiers } from "../../_content/donors";
import { legalStatus } from "../../_content/people";
import { PageHeader, SectionHeading, Stat, DocumentRow, StatusTag } from "../_ui/kit";
import MediaSlot from "../_ui/MediaSlot";

export default function DonorsV3() {
  return (
    <>
      <PageHeader kicker="Donors & Sponsors Forum" title="The impact of your support" />

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-8 sm:grid-cols-4">
          {impactMetrics.map((m) => <Stat key={m.label} value={m.value} label={m.label} />)}
        </div>
      </section>

      <section className="border-y border-[#e6dbc7] bg-[#F1E9D8]">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <SectionHeading>Named Programmes</SectionHeading>
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {namedPrograms.map((p) => (
              <div key={p.slug} className="border border-[#e6dbc7] bg-white">
                {p.image && <MediaSlot need={p.image} />}
                <div className="p-5">
                  <h3 className="flex items-center gap-2 font-[family-name:var(--font-heading)] text-lg font-semibold text-[#4A1B26]">
                    {p.name} <StatusTag status={p.status} />
                  </h3>
                  <p className="mt-2 text-sm text-[#5b5f74]">{p.description}</p>
                  <p className="mt-2 text-[12px] font-semibold uppercase tracking-wide text-[#8b8fa3]">{p.funder}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <SectionHeading>Financial Transparency</SectionHeading>
        <table className="mt-6 w-full text-left">
          <tbody className="divide-y divide-[#e6dbc7] border-y border-[#e6dbc7]">
            {legalStatus.map((l) => (
              <tr key={l.label}>
                <th scope="row" className="w-44 py-3 pr-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8b8fa3]">{l.label}</th>
                <td className="py-3 text-[15px] text-[#171a2b]">{l.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <ul className="mt-8 divide-y divide-[#e6dbc7] border-y border-[#e6dbc7]">
          {funderReports.map((r) => <DocumentRow key={r.title} doc={r} />)}
        </ul>
      </section>

      <section className="border-t border-[#e6dbc7] bg-[#6B2737]">
        <div className="mx-auto max-w-3xl px-6 py-16 text-center">
          <h2 className="font-[family-name:var(--font-heading)] text-2xl font-semibold text-white">Make a donation</h2>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {donationTiers.map((t) => (
              <button key={t.amount} disabled className="cursor-not-allowed border border-white/30 px-6 py-3 text-sm font-medium text-white/85">
                {t.amount}
              </button>
            ))}
          </div>
          <p className="mt-4 text-xs text-white/55">Payment gateway not connected — tier selection is a visual mock.</p>
          <button disabled className="mt-8 cursor-not-allowed border border-white/40 px-6 py-3 text-sm font-medium text-white/85">
            Enquire about sponsorship
          </button>
        </div>
      </section>
    </>
  );
}
