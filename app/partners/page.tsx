import Image from "next/image";
import { partnerForms } from "../_content/partners";
import { LoadError, NotPublishedYet } from "../_ui/ApiMessage";
import { load } from "../_lib/api/load";
import { listPartners } from "../_lib/api/people";
import { listRecognition } from "../_lib/api/impact";
import type { Recognition } from "../_lib/api/impactAdapter";
import ThemePanel from "../_ui/home/ThemePanel";
import type { Partner } from "../_lib/types";
import { PageHeader, SectionHeading, FormMock, StatusTag } from "../_ui/kit";
import MediaSlot from "../_ui/MediaSlot";

function PartnerGrid({ partners, emptyCopy }: { partners: Partner[]; emptyCopy: string }) {
  if (partners.length === 0) return <NotPublishedYet>{emptyCopy}</NotPublishedYet>;
  return (
    <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {partners.map((p) => (
        <div key={p.slug} className="rounded-lg border border-[#e6e8f0] bg-white p-5">
          {p.logo && <MediaSlot need={p.logo} />}
          <h3 className="mt-4 flex items-center gap-2 text-[15px] font-semibold text-[#171a2b]">{p.name} <StatusTag status={p.status} /></h3>
          <p className="mt-2 text-sm text-[#5b5f74]">{p.description}</p>
        </div>
      ))}
    </div>
  );
}

function RecognitionGrid({ items }: { items: Recognition[] }) {
  return (
    <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((r, i) => (
        <li key={r.slug} className="group flex flex-col overflow-hidden rounded-lg border border-[#e3e6f0] bg-white transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0_16px_32px_-18px_rgba(23,26,43,0.4)] motion-reduce:hover:translate-y-0">
          {r.image ? (
            <div className="relative aspect-[16/9] overflow-hidden bg-[#eef1f9]">
              <Image src={r.image} alt="" fill sizes="(max-width: 640px) 100vw, 380px" className="object-cover transition-transform duration-500 group-hover:scale-105" />
            </div>
          ) : (
            <ThemePanel slug={r.slug} index={i} />
          )}
          <div className="flex flex-1 flex-col gap-2 p-5">
            <p className="font-[family-name:var(--font-mono)] text-[11.5px] font-semibold uppercase tracking-[0.08em] text-[#253D9A]">
              {r.year} · {r.awardedBy}
            </p>
            <h3 className="text-[17px] leading-snug text-[#171a2b]">{r.title}</h3>
            {r.description && <p className="flex-1 text-[14px] leading-relaxed text-[#5b6280]">{r.description}</p>}
            {r.url && (
              <a href={r.url} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex w-fit items-center gap-1 text-[13px] font-semibold text-[#253D9A] hover:underline">
                Read more <span aria-hidden="true">&#8599;</span>
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

export default async function PartnersPage() {
  const [result, recognition] = await Promise.all([load("partners", listPartners), load("recognition", listRecognition)]);
  const partners = result.ok ? result.data : [];
  const institutions = partners.filter((p) => p.type === "institution");
  const researchers = partners.filter((p) => p.type === "researcher");

  return (
    <>
      <PageHeader kicker="Partners & recognition" title="Institutions and collaborators working with PRI" />

      <section className="mx-auto max-w-6xl px-6 py-16">
        <SectionHeading>Institutions</SectionHeading>
        {result.ok ? <PartnerGrid partners={institutions} emptyCopy="Partner institutions will be listed here soon." /> : <LoadError what="our partners" />}
      </section>

      <section className="border-y border-[#e6e8f0] bg-white">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <SectionHeading>Researchers</SectionHeading>
          {result.ok ? <PartnerGrid partners={researchers} emptyCopy="Collaborating researchers will be listed here soon." /> : <LoadError what="our partners" />}
        </div>
      </section>

      {/* Shown once PRI has any; an empty "Recognition" heading would read as none received. */}
      {recognition.ok && recognition.data.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 py-16">
          <SectionHeading>Recognition</SectionHeading>
          <p className="mt-2 max-w-2xl text-[15px] text-[#5b6280]">Awards, grants and memberships PRI has received.</p>
          <RecognitionGrid items={recognition.data} />
        </section>
      )}

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
