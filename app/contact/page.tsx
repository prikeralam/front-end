import { org } from "../_content/org";
import { contactCategories } from "../_content/jobs";
import { PageHeader, FormMock } from "../_ui/kit";

export default function ContactV2() {
  return (
    <>
      <PageHeader kicker="Contact" title="Get in touch" intro="Get in touch with our team to learn more about our research, explore collaboration opportunities, or join our mission for inclusive development." />

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-8 sm:grid-cols-2">
          <FormMock
            title="Contact form"
            fields={[`Category: ${contactCategories.join(" / ")}`, "Name", "Email", "Message"]}
          />
          <div className="rounded-xl border border-[#e6e8f0] bg-white p-6">
            <p className="text-xs font-bold uppercase tracking-wider text-[#8b8fa3]">Office</p>
            {org.address.map((line) => <p key={line} className="mt-2 text-[15px] text-[#171a2b]">{line}</p>)}
            <p className="mt-4 text-[15px] text-[#171a2b]">{org.email}</p>
            <p className="text-[15px] text-[#171a2b]">{org.phone}</p>
            <div className="relative mt-6 aspect-video overflow-hidden rounded-xl border border-[#e6e8f0]">
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
