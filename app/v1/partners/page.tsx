import { institutions, researchers, partnerForms } from "../../_content/partners";
import { PageHeader, SectionHeading, FormMock, StatusTag } from "../_ui/kit";
import MediaSlot from "../_ui/MediaSlot";

export default function PartnersV1() {
  return (
    <>
      <PageHeader
        kicker="Partner & Consortium Network"
        title="Institutions and collaborators working with PRI"
      />

      <section className="mx-auto max-w-5xl px-6 pb-16">
        <SectionHeading>Institutional Partners</SectionHeading>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {institutions.map((p) => (
            <div key={p.slug} className="border border-[#253D9A]/12 bg-white p-5">
              {p.logo && <MediaSlot need={p.logo} />}
              <h3 className="mt-4 flex items-center gap-2 text-[15px] text-[#171a2b]">{p.name} <StatusTag status={p.status} /></h3>
              <p className="mt-2 text-sm text-[#5b5f74]">{p.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-[#253D9A]/10 bg-[#f7f7f3]">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <SectionHeading>Researchers</SectionHeading>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {researchers.map((p) => (
              <div key={p.slug} className="border border-[#253D9A]/12 bg-white p-5">
                {p.logo && <MediaSlot need={p.logo} />}
                <h3 className="mt-4 flex items-center gap-2 text-[15px] text-[#171a2b]">{p.name} <StatusTag status={p.status} /></h3>
                <p className="mt-2 text-sm text-[#5b5f74]">{p.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-16">
        <SectionHeading>Get Involved as a Partner</SectionHeading>
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {partnerForms.map((f) => (
            <FormMock key={f.title} title={f.title} fields={["Organisation name", "Contact email", "Message"]} note={f.desc} />
          ))}
        </div>
      </section>
    </>
  );
}
