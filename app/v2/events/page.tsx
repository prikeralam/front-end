import Link from "next/link";
import { upcomingEvents, pastEvents, eventTypes } from "../../_content/events";
import { PageHeader, SectionHeading, FilterBar, StatusTag, EmptyState } from "../_ui/kit";
import MediaSlot from "../_ui/MediaSlot";

export default function EventsV2() {
  return (
    <>
      <PageHeader kicker="Events & Campaigns" title="Seminars, workshops, and roundtables" />

      <section className="mx-auto max-w-6xl px-6 py-16">
        <FilterBar facets={[{ label: "Type", options: eventTypes }]} />
        <div className="mt-8">
          <SectionHeading>Upcoming</SectionHeading>
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {upcomingEvents.map((e) => (
            <Link key={e.slug} href={`/v2/events/${e.slug}`} className="group overflow-hidden rounded-xl border border-[#e6e8f0] bg-white transition-shadow hover:shadow-[0_2px_16px_rgba(15,107,92,0.10)]">
              {e.image && <MediaSlot need={e.image} />}
              <div className="p-5">
                <span className="rounded bg-[#253D9A]/8 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-[#253D9A]">{e.type}</span>
                <h3 className="mt-2 flex items-start gap-2 text-lg font-bold leading-snug text-[#171a2b] group-hover:text-[#253D9A]">
                  {e.title} <StatusTag status={e.status} />
                </h3>
                <p className="mt-2 text-[13px] text-[#8b8fa3]">{e.date} &middot; {e.time}</p>
                <p className="text-[13px] text-[#8b8fa3]">{e.venue}</p>
              </div>
            </Link>
          ))}
        </div>
        {upcomingEvents.length === 0 && <EmptyState message="No upcoming events scheduled." />}
      </section>

      <section className="border-t border-[#e6e8f0] bg-[#fafbfc]">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <SectionHeading>Past Events</SectionHeading>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {pastEvents.map((e) => (
              <Link key={e.slug} href={`/v2/events/${e.slug}`} className="group overflow-hidden rounded-xl border border-[#e6e8f0] bg-white transition-shadow hover:shadow-[0_2px_16px_rgba(15,107,92,0.10)]">
                {e.image && <MediaSlot need={e.image} />}
                <div className="p-5">
                  <span className="rounded bg-[#253D9A]/8 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-[#253D9A]">{e.type}</span>
                  <h3 className="mt-2 flex items-start gap-2 text-lg font-bold leading-snug text-[#171a2b] group-hover:text-[#253D9A]">
                    {e.title} <StatusTag status={e.status} />
                  </h3>
                  <p className="mt-2 text-[13px] text-[#8b8fa3]">{e.date}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
