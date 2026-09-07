import { org } from "../../_content/org";
import { contactCategories, officeMap, newsletterIssues } from "../../_content/jobs";
import { PageHeader, SectionHeading, FormMock, DocumentRow } from "../_ui/kit";
import MediaSlot from "../_ui/MediaSlot";

export default function ContactV3() {
  return (
    <>
      <PageHeader
        kicker="Contact & Newsletter"
        title="Get in touch"
        intro="Get in touch with our team to learn more about our research, explore collaboration opportunities, or join our mission for inclusive development."
      />

      <section className="mx-auto max-w-3xl px-6 py-16">
        <div className="grid gap-10 sm:grid-cols-2">
          <FormMock
            title="Contact form"
            fields={[`Category: ${contactCategories.join(" / ")}`, "Name", "Email", "Message"]}
          />
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8b8fa3]">Office</p>
            <address className="not-italic">
              {org.address.map((line) => <p key={line} className="mt-2 text-[15px] text-[#171a2b]">{line}</p>)}
            </address>
            <p className="mt-4 text-[15px] text-[#171a2b]">{org.email}</p>
            <p className="text-[15px] text-[#171a2b]">{org.phone}</p>
            <MediaSlot need={officeMap} className="mt-6" />
          </div>
        </div>
      </section>

      <section className="border-t border-[#e6dbc7] bg-[#F1E9D8]">
        <div className="mx-auto max-w-3xl px-6 py-16">
          <SectionHeading>Newsletter</SectionHeading>
          <div className="mt-6 max-w-md">
            <FormMock title="Sign up" fields={["Email"]} />
          </div>
          <p className="mt-10 mb-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8b8fa3]">Archive</p>
          <ul className="divide-y divide-[#e6dbc7] border-y border-[#e6dbc7]">
            {newsletterIssues.map((n, i) => <DocumentRow key={i} doc={n} />)}
          </ul>
        </div>
      </section>
    </>
  );
}
