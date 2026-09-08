import { institutions, researchers, partnerForms } from "../../_content/partners";
import { PageHeader, SectionHeading, FormMock, StatusTag } from "../_ui/kit";
import MediaSlot from "../_ui/MediaSlot";

export default function PartnersV2() {
  return (
    <>
      <PageHeader kicker="Partner & Consortium Network" title="Institutions and collaborators working with PRI" />

      <section className="mx-auto max-w-6xl px-6 py-16">
        <SectionHeading>Institutions</SectionHeading>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {institutions.map((p) => (
            <div key={p.slug} className="rounded-xl border border-[#e6e8f0] bg-white p-5">
              {p.logo && <MediaSlot need={p.logo} />}
              <h3 className="mt-4 flex items-center gap-2 text-[15px] font-semibold text-[#171a2b]">{p.name} <StatusTag status={p.status} /></h3>
              <p className="mt-2 text-sm text-[#5b5f74]">{p.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-[#e6e8f0] bg-[#fafbfc]">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <SectionHeading>Researchers</SectionHeading>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {researchers.map((p) => (
              <div key={p.slug} className="rounded-xl border border-[#e6e8f0] bg-white p-5">
                {p.logo && <MediaSlot need={p.logo} />}
                <h3 className="mt-4 flex items-center gap-2 text-[15px] font-semibold text-[#171a2b]">{p.name} <StatusTag status={p.status} /></h3>
                <p className="mt-2 text-sm text-[#5b5f74]">{p.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <SectionHeading>Get Involved as a Partner</SectionHeading>
        <div className="mt-8 grid gap-5 sm:grid-cols-3">
          {partnerForms.map((f) => (
            <FormMock key={f.title} title={f.title} fields={["Organisation name", "Contact email", "Message"]} note={f.desc} />
          ))}
        </div>
      </section>
    </>
  );
}
