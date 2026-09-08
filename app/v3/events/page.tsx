import Link from "next/link";
import { upcomingEvents, pastEvents, eventTypes } from "../../_content/events";
import { PageHeader, SectionHeading, FilterBar, StatusTag, EmptyState } from "../_ui/kit";
import MediaSlot from "../_ui/MediaSlot";

export default function EventsV3() {
  return (
    <>
      <PageHeader kicker="Events & Campaigns" title="Seminars, workshops, and roundtables" />

      <section className="mx-auto max-w-6xl px-6 py-16">
        <FilterBar facets={[{ label: "Type", options: eventTypes }]} />
        <div className="mt-6">
          <SectionHeading>Upcoming</SectionHeading>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {upcomingEvents.map((e) => (
            <Link key={e.slug} href={`/v3/events/${e.slug}`} className="block border border-[#e6dbc7] bg-white transition-colors hover:border-[#243D9A]">
              {e.image && <MediaSlot need={e.image} />}
              <div className="p-5">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-[#B8862F]">{e.type}</span>
                <h3 className="mt-2 flex items-start gap-2 font-[family-name:var(--font-heading)] text-lg font-semibold leading-snug text-[#171a2b]">
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

      <section className="border-t border-[#e6dbc7] bg-[#F1E9D8]">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <SectionHeading>Past Events</SectionHeading>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {pastEvents.map((e) => (
              <Link key={e.slug} href={`/v3/events/${e.slug}`} className="block border border-[#e6dbc7] bg-white transition-colors hover:border-[#243D9A]">
                {e.image && <MediaSlot need={e.image} />}
                <div className="p-5">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-[#B8862F]">{e.type}</span>
                  <h3 className="mt-2 flex items-start gap-2 font-[family-name:var(--font-heading)] text-lg font-semibold leading-snug text-[#171a2b]">
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
