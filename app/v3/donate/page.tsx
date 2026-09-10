import { donatePayment, bankDetails } from "../../_content/donate";
import { publications } from "../../_content/publications";
import { people } from "../../_content/people";
import { PageHeader, SectionHeading, StatusTag } from "../_ui/kit";

const impactStats = [
  { value: String(publications.length), label: "Published research stories" },
  { value: String(people.filter((p) => p.group === "executive").length), label: "Executive Council members" },
  { value: String(people.filter((p) => p.group === "team").length), label: "Team members driving the work" },
];

export default function DonateV3() {
  return (
    <>
      <PageHeader
        kicker="Donate"
        title="Support PRI's work"
        intro="Your contribution funds independent, data-driven research and the policy work built on it."
      />

      <section className="mx-auto max-w-6xl px-6 py-16">
        <SectionHeading>Our impact</SectionHeading>
        <div className="mt-8 grid gap-px bg-[#e6dbc7] sm:grid-cols-3">
          {impactStats.map((s) => (
            <div key={s.label} className="bg-white p-7">
              <p className="font-[family-name:var(--font-heading)] text-3xl font-semibold text-[#171a2b]">{s.value}</p>
              <p className="mt-2 text-sm leading-relaxed text-[#5b5f74]">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-[#e6dbc7] bg-[#F1E9D8]">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <SectionHeading>Ways to give</SectionHeading>

          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            <div className="border border-[#e6dbc7] bg-white p-7">
              <p className="flex items-center gap-2 text-[15px] font-semibold text-[#4A1B26]">
                Pay online via Razorpay <StatusTag status={donatePayment.status} />
              </p>
              {donatePayment.razorpayUrl ? (
                <a
                  href={donatePayment.razorpayUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-block bg-[#20368a] px-6 py-3 text-sm font-semibold text-white hover:bg-[#192a6b]"
                >
                  Donate via Razorpay
                </a>
              ) : (
                <button disabled className="mt-4 cursor-not-allowed bg-[#20368a]/40 px-6 py-3 text-sm font-semibold text-white">
                  Razorpay link coming soon
                </button>
              )}
            </div>

            <div className="border border-[#e6dbc7] bg-white p-7">
              <p className="flex items-center gap-2 text-[15px] font-semibold text-[#4A1B26]">
                Bank transfer <StatusTag status={bankDetails.status} />
              </p>
              <dl className="mt-4 grid gap-3 text-sm">
                <div>
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8b8fa3]">Account name</dt>
                  <dd className="mt-1 text-[#171a2b]">{bankDetails.accountName}</dd>
                </div>
                <div>
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8b8fa3]">Account number</dt>
                  <dd className="mt-1 text-[#171a2b]">{bankDetails.accountNumber}</dd>
                </div>
                <div>
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8b8fa3]">IFSC</dt>
                  <dd className="mt-1 text-[#171a2b]">{bankDetails.ifsc}</dd>
                </div>
                <div>
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8b8fa3]">Bank &amp; branch</dt>
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
