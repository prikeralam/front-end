import { notFound } from "next/navigation";
import { events, pastEventArchive } from "../../../_content/events";
import { PageHeader, StatusTag, FormMock, DocumentRow } from "../../_ui/kit";
import MediaSlot from "../../_ui/MediaSlot";

export function generateStaticParams() {
  return events.map((e) => ({ slug: e.slug }));
}

export default async function EventDetailV3({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = events.find((e) => e.slug === slug);
  if (!event) notFound();

  return (
    <>
      <PageHeader kicker={event.type} title={event.title} />
      <section className="mx-auto max-w-3xl px-6 py-16">
        <div className="mb-6 flex items-center gap-2 text-sm text-[#5b5f74]">
          {event.date} &middot; {event.time} &middot; {event.venue} <StatusTag status={event.status} />
        </div>
        {event.image && <MediaSlot need={event.image} className="max-w-lg" />}
        <p className="mt-8 text-[17px] leading-relaxed text-[#4b4f66]">{event.description}</p>

        {event.timing === "upcoming" ? (
          <div className="mt-10">
            <FormMock title="Register for this event" fields={["Full name", "Email", "Organisation"]} />
          </div>
        ) : (
          <div className="mt-10 space-y-8">
            <div>
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8b8fa3]">Recording</p>
              <MediaSlot need={pastEventArchive.recording} className="max-w-lg" />
            </div>
            <div>
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8b8fa3]">Photo Gallery</p>
              <MediaSlot need={pastEventArchive.gallery} className="max-w-lg" />
            </div>
            <div>
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8b8fa3]">Report</p>
              <ul className="divide-y divide-[#e6dbc7] border-y border-[#e6dbc7]">
                <DocumentRow doc={pastEventArchive.report} />
              </ul>
            </div>
          </div>
        )}
      </section>
    </>
  );
}
