import Image from "next/image";
import { donatePayment, bankDetails, upiPayment } from "../_content/donate";
import { PageHeader, SectionHeading, StatusTag } from "../_ui/kit";

export default function DonatePage() {
  return (
    <>
      <PageHeader
        kicker="Donate"
        title="Support PRI's work"
        intro="Your contribution funds independent, data-driven research and the policy work built on it."
      />

      <section className="mx-auto max-w-6xl px-6 py-16">
        <SectionHeading>Ways to give</SectionHeading>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <div className="rounded-lg border border-[#e6e8f0] bg-white p-6">
            <p className="text-[15px] font-semibold text-[#171a2b]">Scan and pay with UPI</p>
            <p className="mt-1 text-[13px] text-[#5b6280]">Use Google Pay, PhonePe, Paytm, BHIM or any UPI app.</p>
            <Image
              src={upiPayment.qrImage}
              alt={`UPI QR code to pay Policy and Research Initiative (${upiPayment.upiId})`}
              width={452}
              height={592}
              className="mt-4 h-auto w-full max-w-[220px] rounded-md border border-[#e6e8f0]"
            />
            <p className="mt-3 text-xs font-[family-name:var(--font-mono)] font-semibold uppercase tracking-[0.12em] text-[#8b8fa3]">UPI ID</p>
            <p className="mt-1 break-all font-[family-name:var(--font-mono)] text-[13px] text-[#171a2b]">{upiPayment.upiId}</p>
          </div>

          <div className="flex flex-col rounded-lg border border-[#e6e8f0] bg-white p-6">
            <p className="flex items-center gap-2 text-[15px] font-semibold text-[#171a2b]">
              Bank transfer <StatusTag status={bankDetails.status} />
            </p>
            <dl className="mt-4 grid gap-3 text-sm">
              <div>
                <dt className="text-xs font-[family-name:var(--font-mono)] font-semibold uppercase tracking-[0.12em] text-[#8b8fa3]">Account name</dt>
                <dd className="mt-1 text-[#171a2b]">{bankDetails.accountName}</dd>
              </div>
              <div>
                <dt className="text-xs font-[family-name:var(--font-mono)] font-semibold uppercase tracking-[0.12em] text-[#8b8fa3]">Account number</dt>
                <dd className="mt-1 text-[#171a2b]">{bankDetails.accountNumber}</dd>
              </div>
              <div>
                <dt className="text-xs font-[family-name:var(--font-mono)] font-semibold uppercase tracking-[0.12em] text-[#8b8fa3]">IFSC</dt>
                <dd className="mt-1 text-[#171a2b]">{bankDetails.ifsc}</dd>
              </div>
              <div>
                <dt className="text-xs font-[family-name:var(--font-mono)] font-semibold uppercase tracking-[0.12em] text-[#8b8fa3]">Bank &amp; branch</dt>
                <dd className="mt-1 text-[#171a2b]">{bankDetails.bankName}, {bankDetails.branch}</dd>
              </div>
            </dl>
            <div className="mt-6 border-t border-[#e6e8f0] pt-6">
              <p className="flex items-center gap-2 text-[15px] font-semibold text-[#171a2b]">
                Pay online via Razorpay <StatusTag status={donatePayment.status} />
              </p>
              {donatePayment.razorpayUrl ? (
                <a
                  href={donatePayment.razorpayUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-block rounded-md bg-[#253D9A] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1B2C70]"
                >
                  Donate via Razorpay
                </a>
              ) : (
                <button disabled className="mt-4 cursor-not-allowed rounded-md bg-[#253D9A]/40 px-5 py-2.5 text-sm font-semibold text-white">
                  Razorpay link coming soon
                </button>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
