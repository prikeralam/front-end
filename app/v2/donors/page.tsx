import { impactMetrics, namedPrograms, wellWishersEvents, funderReports, donationTiers } from "../../_content/donors";
import { legalStatus } from "../../_content/people";
import { PageHeader, SectionHeading, Stat, DocumentRow, StatusTag } from "../_ui/kit";
import MediaSlot from "../_ui/MediaSlot";

export default function DonorsV2() {
  return (
    <>
      <PageHeader kicker="Donors & Sponsors Forum" title="The impact of your support" />

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-5 sm:grid-cols-4">
          {impactMetrics.map((m) => <Stat key={m.label} value={m.value} label={m.label} />)}
        </div>
      </section>

      <section className="border-y border-[#e6e8f0] bg-[#fafbfc]">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <SectionHeading>Named Programmes</SectionHeading>
          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            {namedPrograms.map((p) => (
              <div key={p.slug} className="overflow-hidden rounded-xl border border-[#e6e8f0] bg-white">
                {p.image && <MediaSlot need={p.image} />}
                <div className="p-5">
                  <h3 className="flex items-center gap-2 text-lg font-bold text-[#171a2b]">
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
        <SectionHeading>Well Wishers Program</SectionHeading>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#5b5f74]">Moments with the well-wishers and supporters who back PRI's work.</p>
        <div className="mt-8 grid gap-5 sm:grid-cols-3">
          {wellWishersEvents.map((p) => (
            <div key={p.slug} className="overflow-hidden rounded-xl border border-[#e6e8f0] bg-white">
              {p.image && <MediaSlot need={p.image} />}
              <div className="p-5">
                <h3 className="flex items-center gap-2 text-lg font-bold text-[#171a2b]">
                  {p.name} <StatusTag status={p.status} />
                </h3>
                <p className="mt-2 text-sm text-[#5b5f74]">{p.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <SectionHeading>Financial Transparency</SectionHeading>
        <dl className="mt-6 grid gap-4 sm:grid-cols-3">
          {legalStatus.map((l) => (
            <div key={l.label} className="rounded-lg border border-[#e6e8f0] px-5 py-4">
              <dt className="text-xs font-bold uppercase tracking-wider text-[#8b8fa3]">{l.label}</dt>
              <dd className="mt-2 text-[15px] text-[#171a2b]">{l.value}</dd>
            </div>
          ))}
        </dl>
        <ul className="mt-8 grid gap-3">
          {funderReports.map((r) => <DocumentRow key={r.title} doc={r} />)}
        </ul>
      </section>

      <section className="border-t border-[#e6e8f0] bg-[#0A2E28]">
        <div className="mx-auto max-w-3xl px-6 py-16 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-white">Make a donation</h2>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {donationTiers.map((t) => (
              <button key={t.amount} disabled className="cursor-not-allowed rounded-full border border-white/25 px-6 py-3 text-sm font-semibold text-white/80">
                {t.amount}
              </button>
            ))}
          </div>
          <p className="mt-4 text-xs text-white/50">Payment gateway not connected — tier selection is a visual mock.</p>
          <button disabled className="mt-8 cursor-not-allowed rounded-full bg-[#E4633F]/70 px-6 py-3 text-sm font-semibold text-white">
            Enquire about sponsorship
          </button>
        </div>
      </section>
    </>
  );
}
