import { impactMetrics, namedPrograms, wellWishersEvents, funderReports, donationTiers } from "../../_content/donors";
import { legalStatus } from "../../_content/people";
import { PageHeader, SectionHeading, Stat, DocumentRow, StatusTag } from "../_ui/kit";
import MediaSlot from "../_ui/MediaSlot";

export default function DonorsV1() {
  return (
    <>
      <PageHeader kicker="Donors & Sponsors Forum" title="The impact of your support" />

      <section className="mx-auto max-w-5xl px-6 pb-16">
        <div className="grid gap-8 sm:grid-cols-4">
          {impactMetrics.map((m) => <Stat key={m.label} value={m.value} label={m.label} />)}
        </div>
      </section>

      <section className="border-y border-[#243D9A]/10 bg-[#f7f7f3]">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <SectionHeading>Named Programmes</SectionHeading>
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {namedPrograms.map((p) => (
              <div key={p.slug} className="border border-[#243D9A]/12 bg-white">
                {p.image && <MediaSlot need={p.image} />}
                <div className="p-5">
                  <h3 className="flex items-center gap-2 font-[family-name:var(--font-heading)] text-lg text-[#171a2b]">
                    {p.name} <StatusTag status={p.status} />
                  </h3>
                  <p className="mt-2 text-sm text-[#5b5f74]">{p.description}</p>
                  <p className="mt-2 text-[12px] uppercase tracking-wide text-[#8b8fa3]">{p.funder}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-16">
        <SectionHeading>Well Wishers Program</SectionHeading>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#5b5f74]">Moments with the well-wishers and supporters who back PRI's work.</p>
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {wellWishersEvents.map((p) => (
            <div key={p.slug} className="border border-[#243D9A]/12 bg-white">
              {p.image && <MediaSlot need={p.image} />}
              <div className="p-5">
                <h3 className="flex items-center gap-2 font-[family-name:var(--font-heading)] text-lg text-[#171a2b]">
                  {p.name} <StatusTag status={p.status} />
                </h3>
                <p className="mt-2 text-sm text-[#5b5f74]">{p.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-16">
        <SectionHeading>Financial Transparency</SectionHeading>
        <dl className="mt-6 grid gap-6 sm:grid-cols-3">
          {legalStatus.map((l) => (
            <div key={l.label}>
              <dt className="text-[12px] uppercase tracking-[0.12em] text-[#8b8fa3]">{l.label}</dt>
              <dd className="mt-2 text-[15px] text-[#171a2b]">{l.value}</dd>
            </div>
          ))}
        </dl>
        <ul className="mt-8 divide-y divide-[#243D9A]/10 border-y border-[#243D9A]/10">
          {funderReports.map((r) => <DocumentRow key={r.title} doc={r} />)}
        </ul>
      </section>

      <section className="border-t border-[#243D9A]/10 bg-[#1c2456]">
        <div className="mx-auto max-w-3xl px-6 py-16 text-center">
          <h2 className="font-[family-name:var(--font-heading)] text-2xl italic text-white">Make a donation</h2>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {donationTiers.map((t) => (
              <button key={t.amount} disabled className="cursor-not-allowed border border-white/25 px-6 py-3 text-sm font-medium text-white/80">
                {t.amount}
              </button>
            ))}
          </div>
          <p className="mt-4 text-xs text-white/50">Payment gateway not connected — tier selection is a visual mock.</p>
          <button disabled className="mt-8 cursor-not-allowed border border-white/40 px-6 py-3 text-sm font-medium text-white/80">
            Enquire about sponsorship
          </button>
        </div>
      </section>
    </>
  );
}
