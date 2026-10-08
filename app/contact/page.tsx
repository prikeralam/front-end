import { org } from "../_content/org";
import { PageHeader } from "../_ui/kit";
import ContactForm from "./_ui/ContactForm";
import { pageMetadata } from "../_lib/seo";

export const metadata = pageMetadata({
  title: "Contact",
  description: "Contact the Policy and Research Initiative in Malappuram, Kerala: general enquiries, collaborations and data requests.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <>
      <PageHeader kicker="Contact" title="Get in touch" intro="Get in touch with our team to learn more about our research, explore collaboration opportunities, or join our mission for inclusive development." />

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="relative grid items-start gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <ContactForm email={org.email} />
          <div className="rounded-lg border border-[#e6e8f0] bg-white p-6">
            <p className="text-xs font-[family-name:var(--font-mono)] font-semibold uppercase tracking-[0.12em] text-[#8b8fa3]">Office</p>
            {org.address.map((line) => <p key={line} className="mt-2 text-[15px] text-[#171a2b]">{line}</p>)}
            <p className="mt-4 text-[15px] text-[#171a2b]">{org.email}</p>
            <p className="text-[15px] text-[#171a2b]">{org.phone}</p>
            <div className="relative mt-6 aspect-video overflow-hidden rounded-lg border border-[#e6e8f0]">
              <iframe
                src={org.mapEmbedUrl}
                className="absolute inset-0 h-full w-full border-0"
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                title="PRI office location"
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
