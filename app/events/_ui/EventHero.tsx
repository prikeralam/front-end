import Link from "next/link";
import type { PRIEvent } from "../../_lib/types";
import { googleCalendarUrl } from "../../_lib/eventPage";
import { SITE_URL } from "../../_lib/seo";
import { DARK_BAND } from "../../_ui/kit";
import { ModeTag, TimingTag } from "./EventTags";
import ShareEventButton from "./ShareEventButton";

const label = "font-[family-name:var(--font-mono)] text-[11px] font-semibold uppercase tracking-[0.14em] text-[#aebbf0]";
// Light-on-dark: the header sits on the site's dark band.
const secondary =
  "inline-flex items-center gap-2 rounded-md border border-white/30 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:border-white/60 hover:bg-white/15";

function Fact({ name, children }: { name: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0 border-t border-white/15 pt-3 first:border-t-0 first:pt-0 sm:border-l sm:border-white/15 sm:border-t-0 sm:px-6 sm:pt-0 sm:first:border-l-0 sm:first:pl-0">
      <dt className={label}>{name}</dt>
      <dd className="mt-1 text-[15.5px] font-semibold leading-snug text-white">{children}</dd>
    </div>
  );
}

/** The top of an event page: what, when, where, and what a visitor can do about it. The summary lives below. */
export default function EventHero({ event }: { event: PRIEvent }) {
  const upcoming = event.timing === "upcoming";
  const register = upcoming ? event.registrationUrl : undefined;
  const calendar = upcoming ? googleCalendarUrl(event, `${SITE_URL}/events/${event.slug}`) : null;

  return (
    <section className={DARK_BAND}>
      <div className="relative z-10 mx-auto max-w-6xl px-6 pb-12 pt-12 sm:pt-14">
        <Link href="/events" className="inline-flex items-center gap-2.5 font-[family-name:var(--font-mono)] text-[11.5px] font-semibold uppercase tracking-[0.14em] text-[#aebbf0] hover:text-white">
          <span aria-hidden="true" className="h-2 w-2 bg-[#aebbf0]" />
          Events &amp; Campaigns
        </Link>
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <TimingTag timing={event.timing} onDark />
          <ModeTag mode={event.mode} onDark />
          {event.kind === "campaign" && <span className={`${label} ml-1`}>Campaign</span>}
        </div>
        <h1 className="mt-4 max-w-4xl text-balance text-[2rem] leading-[1.1] tracking-tight text-white sm:text-5xl">{event.title}</h1>

        <dl className="mt-8 grid max-w-4xl gap-3 sm:flex sm:flex-wrap sm:gap-y-4">
          <Fact name="Date">{event.dateLabel}</Fact>
          {event.timeLabel && <Fact name="Time">{event.timeLabel}</Fact>}
          {event.location && <Fact name="Venue">{event.location}</Fact>}
        </dl>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          {register && (
            <a href={register} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-md bg-white px-5 py-2.5 text-sm font-semibold text-[#16245c] hover:bg-[#e8ecfa]">
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
          <ShareEventButton slug={event.slug} title={event.title} className={secondary} noticeClassName="text-white/75" />
        </div>
      </div>
    </section>
  );
}
