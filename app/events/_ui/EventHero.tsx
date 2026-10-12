import Link from "next/link";
import type { PRIEvent } from "../../_lib/types";
import { googleCalendarUrl } from "../../_lib/eventPage";
import { SITE_URL } from "../../_lib/seo";
import { ModeTag, TimingTag } from "./EventTags";
import ShareEventButton from "./ShareEventButton";

const label = "font-[family-name:var(--font-mono)] text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8b8fa3]";
const secondary =
  "inline-flex items-center gap-2 rounded-md border border-[#d5d9e8] bg-white px-4 py-2.5 text-sm font-semibold text-[#253D9A] transition-colors hover:border-[#253D9A]";

function Fact({ name, children }: { name: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0 border-t border-[#dfe3ef] pt-3 first:border-t-0 first:pt-0 sm:border-l sm:border-t-0 sm:px-6 sm:pt-0 sm:first:border-l-0 sm:first:pl-0">
      <dt className={label}>{name}</dt>
      <dd className="mt-1 text-[15.5px] font-semibold leading-snug text-[#171a2b]">{children}</dd>
    </div>
  );
}

/** The top of an event page: what, when, where, and what a visitor can do about it. The summary lives below. */
export default function EventHero({ event }: { event: PRIEvent }) {
  const upcoming = event.timing === "upcoming";
  const register = upcoming ? event.registrationUrl : undefined;
  const calendar = upcoming ? googleCalendarUrl(event, `${SITE_URL}/events/${event.slug}`) : null;

  return (
    <section className="relative overflow-hidden border-b border-[#e3e6f0] bg-[radial-gradient(1100px_420px_at_85%_-10%,rgba(37,61,154,0.11),transparent_62%),radial-gradient(700px_320px_at_0%_120%,rgba(37,61,154,0.05),transparent_60%)] after:pointer-events-none after:absolute after:inset-0 after:bg-[radial-gradient(circle,rgba(37,61,154,0.16)_1px,transparent_1.4px)] after:bg-[length:26px_26px] after:[mask-image:linear-gradient(100deg,transparent_55%,#000_92%)]">
      <div className="relative z-10 mx-auto max-w-6xl px-6 pb-12 pt-12 sm:pt-14">
        <Link href="/events" className="inline-flex items-center gap-2.5 font-[family-name:var(--font-mono)] text-[11.5px] font-semibold uppercase tracking-[0.14em] text-[#253D9A] hover:underline">
          <span aria-hidden="true" className="h-2 w-2 bg-[#253D9A]" />
          Events &amp; Campaigns
        </Link>
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <TimingTag timing={event.timing} />
          <ModeTag mode={event.mode} />
          {event.kind === "campaign" && <span className={`${label} ml-1`}>Campaign</span>}
        </div>
        <h1 className="mt-4 max-w-4xl text-balance text-[2rem] leading-[1.1] tracking-tight text-[#171a2b] sm:text-5xl">{event.title}</h1>

        <dl className="mt-8 grid max-w-4xl gap-3 sm:flex sm:flex-wrap sm:gap-y-4">
          <Fact name="Date">{event.dateLabel}</Fact>
          {event.timeLabel && <Fact name="Time">{event.timeLabel}</Fact>}
          {event.location && <Fact name="Venue">{event.location}</Fact>}
        </dl>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          {register && (
            <a href={register} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-md bg-[#253D9A] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1B2C70]">
              Register <span aria-hidden="true">&#8599;</span>
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          )}
          {calendar && (
            <a href={calendar} target="_blank" rel="noopener noreferrer" className={secondary}>
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <rect x="3.5" y="5" width="17" height="15" rx="2" />
                <path d="M3.5 10h17M8 3v4M16 3v4" />
              </svg>
              Add to calendar
              <span className="sr-only">(Google Calendar, opens in a new tab)</span>
            </a>
          )}
          <ShareEventButton slug={event.slug} title={event.title} className={secondary} />
        </div>
      </div>
    </section>
  );
}
