import { donatePayment, bankDetails } from "../../_content/donate";
import { publications } from "../../_content/publications";
import { people } from "../../_content/people";
import { PageHeader, SectionHeading, StatusTag } from "../_ui/kit";

const impactStats = [
  { value: String(publications.length), label: "Published research stories" },
  { value: String(people.filter((p) => p.group === "executive").length), label: "Executive Council members" },
  { value: String(people.filter((p) => p.group === "team").length), label: "Team members driving the work" },
];

export default function DonateV2() {
  return (
    <>
      <PageHeader
        kicker="Donate"
        title="Support PRI's work"
        intro="Your contribution funds independent, data-driven research and the policy work built on it."
      />

      <section className="mx-auto max-w-6xl px-6 py-16">
        <SectionHeading>Our impact</SectionHeading>
        <div className="mt-8 grid gap-5 sm:grid-cols-3">
          {impactStats.map((s) => (
            <div key={s.label} className="rounded-xl border border-[#e6e8f0] bg-[#fafbfc] p-6">
              <p className="font-[family-name:var(--font-mono)] text-3xl font-semibold text-[#253D9A]">{s.value}</p>
              <p className="mt-2 text-sm text-[#5b5f74]">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-[#e6e8f0] bg-[#fafbfc]">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <SectionHeading>Ways to give</SectionHeading>

          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            <div className="rounded-xl border border-[#e6e8f0] bg-white p-6">
              <p className="flex items-center gap-2 text-[15px] font-semibold text-[#171a2b]">
                Pay online via Razorpay <StatusTag status={donatePayment.status} />
              </p>
              {donatePayment.razorpayUrl ? (
                <a
                  href={donatePayment.razorpayUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-block rounded-full bg-[#E4633F] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#C94F2E]"
                >
                  Donate via Razorpay
                </a>
              ) : (
                <button disabled className="mt-4 cursor-not-allowed rounded-full bg-[#E4633F]/40 px-5 py-2.5 text-sm font-semibold text-white">
                  Razorpay link coming soon
                </button>
              )}
            </div>

            <div className="rounded-xl border border-[#e6e8f0] bg-white p-6">
              <p className="flex items-center gap-2 text-[15px] font-semibold text-[#171a2b]">
                Bank transfer <StatusTag status={bankDetails.status} />
              </p>
              <dl className="mt-4 grid gap-3 text-sm">
                <div>
                  <dt className="text-xs font-bold uppercase tracking-wider text-[#8b8fa3]">Account name</dt>
                  <dd className="mt-1 text-[#171a2b]">{bankDetails.accountName}</dd>
                </div>
                <div>
                  <dt className="text-xs font-bold uppercase tracking-wider text-[#8b8fa3]">Account number</dt>
                  <dd className="mt-1 text-[#171a2b]">{bankDetails.accountNumber}</dd>
                </div>
                <div>
                  <dt className="text-xs font-bold uppercase tracking-wider text-[#8b8fa3]">IFSC</dt>
                  <dd className="mt-1 text-[#171a2b]">{bankDetails.ifsc}</dd>
                </div>
                <div>
                  <dt className="text-xs font-bold uppercase tracking-wider text-[#8b8fa3]">Bank &amp; branch</dt>
                  <dd className="mt-1 text-[#171a2b]">{bankDetails.bankName}, {bankDetails.branch}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
