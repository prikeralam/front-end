import Link from "next/link";
import { LoadError, NotPublishedYet } from "../_ui/ApiMessage";
import { listEvents } from "../_lib/api/engage";
import { load } from "../_lib/api/load";
import type { PRIEvent } from "../_lib/types";
import { PageHeader, SectionHeading } from "../_ui/kit";
import EventCard from "./_ui/EventCard";

const FILTERS = [
  { value: "", label: "All" },
  { value: "event", label: "Events" },
  { value: "campaign", label: "Campaigns" },
] as const;

function EventGrid({ events, empty }: { events: PRIEvent[]; empty: string }) {
  if (events.length === 0) return <p className="mt-6 text-[15px] text-[#8b8fa3]">{empty}</p>;
  return (
    <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {events.map((e) => <EventCard key={e.slug} event={e} />)}
    </div>
  );
}

export default async function EventsPage({ searchParams }: { searchParams: Promise<{ kind?: string }> }) {
  const { kind: requested } = await searchParams;
  const kind = requested === "event" || requested === "campaign" ? requested : "";
  const result = await load("events", listEvents);
  const events = (result.ok ? result.data : []).filter((e) => !kind || e.kind === kind);
  // Upcoming soonest first; past most recent first (the API's order).
  const upcoming = events.filter((e) => e.timing === "upcoming").reverse();
  const past = events.filter((e) => e.timing === "past");

  return (
    <>
      <PageHeader kicker="Engage" title="Events & Campaigns" />

      <section className="mx-auto max-w-6xl px-6 py-16">
        <nav aria-label="Filter events" className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <Link
              key={f.value}
              href={f.value ? `/events?kind=${f.value}` : "/events"}
              aria-current={kind === f.value ? "page" : undefined}
              className="rounded-full border border-[#dcdee8] px-4 py-1.5 text-[13.5px] font-semibold text-[#4b4f66] transition-colors hover:border-[#253D9A] hover:text-[#253D9A] aria-[current=page]:border-[#253D9A] aria-[current=page]:bg-[#253D9A] aria-[current=page]:text-white"
            >
              {f.label}
            </Link>
          ))}
        </nav>
        {!result.ok && <div className="mt-8"><LoadError what="our events" /></div>}
        {result.ok && result.data.length === 0 && <div className="mt-8"><NotPublishedYet>Events and campaigns will be published here soon.</NotPublishedYet></div>}
        {result.ok && result.data.length > 0 && (
          <div className="mt-10">
            <SectionHeading>Upcoming</SectionHeading>
            <EventGrid events={upcoming} empty="Nothing scheduled right now." />
          </div>
        )}
      </section>

      {result.ok && past.length > 0 && (
        <section className="border-t border-[#e6e8f0] bg-white">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <SectionHeading>Past</SectionHeading>
            <EventGrid events={past} empty="" />
          </div>
        </section>
      )}
    </>
  );
}
