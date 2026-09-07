import { org } from "../../_content/org";
import { contactCategories, officeMap, newsletterIssues } from "../../_content/jobs";
import { PageHeader, SectionHeading, FormMock, DocumentRow } from "../_ui/kit";
import MediaSlot from "../_ui/MediaSlot";

export default function ContactV2() {
  return (
    <>
      <PageHeader kicker="Contact & Newsletter" title="Get in touch" intro="Get in touch with our team to learn more about our research, explore collaboration opportunities, or join our mission for inclusive development." />

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
            <MediaSlot need={officeMap} className="mt-6" />
          </div>
        </div>
      </section>

      <section className="border-t border-[#e6e8f0] bg-[#fafbfc]">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <SectionHeading>Newsletter</SectionHeading>
          <div className="mt-6 max-w-md">
            <FormMock title="Sign up" fields={["Email"]} />
          </div>
          <p className="mb-4 mt-10 text-xs font-bold uppercase tracking-wider text-[#8b8fa3]">Archive</p>
          <ul className="grid gap-3">
            {newsletterIssues.map((n, i) => <DocumentRow key={i} doc={n} />)}
          </ul>
        </div>
      </section>
    </>
  );
}
