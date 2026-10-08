import Link from "next/link";
import { notFound } from "next/navigation";
import { LoadError } from "../../_ui/ApiMessage";
import { getEventBySlug } from "../../_lib/api/engage";
import { load } from "../../_lib/api/load";
import { PageHeader } from "../../_ui/kit";
import MediaSlot from "../../_ui/MediaSlot";

export default async function EventDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const result = await load("this event", () => getEventBySlug(slug));
  if (!result.ok) {
    return (
      <>
        <PageHeader kicker="Events & Campaigns" title="Event" />
        <section className="mx-auto max-w-3xl px-6 py-16"><LoadError what="this event" /></section>
      </>
    );
  }
  const event = result.data;
  if (!event) notFound();

  return (
    <>
      <PageHeader kicker={event.kind === "campaign" ? "Campaign" : "Event"} title={event.title} />
      <section className="mx-auto max-w-3xl px-6 py-16">
        <p className="text-sm text-[#5b5f74]">{[event.dateLabel, event.location].filter(Boolean).join(" · ")}</p>
        {event.image && <MediaSlot need={event.image} className="mt-6 max-w-lg" />}
        {event.summary && <p className="mt-8 text-lg leading-relaxed text-[#4b4f66]">{event.summary}</p>}
        {event.body && <div className="mt-6 whitespace-pre-line text-[15px] leading-relaxed text-[#4b4f66]">{event.body}</div>}
        {event.registrationUrl && event.timing === "upcoming" && (
          <a href={event.registrationUrl} target="_blank" rel="noopener noreferrer" className="mt-8 inline-flex items-center gap-1 rounded-md bg-[#253D9A] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1B2C70]">
            Register <span aria-hidden="true">&#8599;</span>
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        )}
        <div>
          <Link href="/events" className="mt-8 inline-block text-[14px] font-semibold text-[#253D9A] hover:underline">&larr; All events &amp; campaigns</Link>
        </div>
      </section>
    </>
  );
}
