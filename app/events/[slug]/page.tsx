import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LoadError } from "../../_ui/ApiMessage";
import { getEventBySlug, listEvents } from "../../_lib/api/engage";
import { load } from "../../_lib/api/load";
import { PageHeader } from "../../_ui/kit";
import type { Metadata } from "next";
import { eventJsonLd, pageMetadata } from "../../_lib/seo";
import JsonLd from "../../_ui/JsonLd";
import { directionsUrl, initials, moreEvents, paragraphs, splitSpeaker } from "../../_lib/eventPage";
import EventCard from "../_ui/EventCard";
import EventGallery from "../_ui/EventGallery";
import EventHero from "../_ui/EventHero";
import EventPoster from "../_ui/EventPoster";
import { MODE_LABEL } from "../_ui/EventTags";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const result = await load("this event", () => getEventBySlug(slug));
  const event = result.ok ? result.data : null;
  if (!event) return { title: "Events & Campaigns" };
  return pageMetadata({
    title: event.title,
    description: paragraphs(event.summary).join(" ") || `${event.kind === "campaign" ? "A campaign" : "An event"} by the Policy and Research Initiative, ${event.dateLabel}.`,
    path: `/events/${event.slug}`,
    image: event.image?.src ?? event.gallery[0]?.src,
  });
}

const label = "font-[family-name:var(--font-mono)] text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8b8fa3]";

/** A titled block of the programme, with the mono label set against a hairline. */
function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-12 first:mt-0">
      <h2 className="flex items-center gap-3 font-[family-name:var(--font-mono)] text-[11.5px] font-semibold uppercase tracking-[0.14em] text-[#253D9A]">
        {title}
        <span aria-hidden="true" className="h-px flex-1 bg-[#e3e6f0]" />
      </h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Fact({ name, children }: { name: string; children: ReactNode }) {
  return (
    <div className="border-t border-[#eceef5] py-3.5 first:border-t-0 first:pt-0">
      <dt className={label}>{name}</dt>
      <dd className="mt-1 text-[15px] leading-snug text-[#171a2b]">{children}</dd>
    </div>
  );
}

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
  const register = event.registrationUrl && event.timing === "upcoming" ? event.registrationUrl : null;
  // Summaries typed with line breaks read as paragraphs, never as one run-on block.
  const about = [...paragraphs(event.summary), ...paragraphs(event.body)];
  // A nice-to-have: if the list fails to load, the page just has no "More events".
  const all = await load("events", () => listEvents());
  const more = all.ok ? moreEvents(all.data, event.slug) : [];

  return (
    <>
      <JsonLd data={eventJsonLd(event)} />
      <EventHero event={event} />

      {event.image?.src && (
        <div className="mx-auto max-w-6xl px-6 pt-10">
          <EventPoster image={event.image} />
        </div>
      )}

      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-12 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-14">
        <div className="min-w-0">
          {about.length > 0 && (
            <Section title={event.kind === "campaign" ? "About this campaign" : "About this event"}>
              <div className="space-y-4">
                {about.map((text, i) => (
                  <p key={i} className={`${i === 0 ? "text-[17px] text-[#2a2e45]" : "text-[15.5px] text-[#4b4f66]"} leading-relaxed`}>
                    {text}
                  </p>
                ))}
              </div>
            </Section>
          )}

          {event.focusAreas.length > 0 && (
            <Section title="Focus areas">
              <ol className="space-y-5">
                {event.focusAreas.map((area, i) => (
                  <li key={i} className="grid grid-cols-[2.25rem_minmax(0,1fr)] gap-3">
                    <span aria-hidden="true" className="pt-0.5 font-[family-name:var(--font-mono)] text-[13px] font-semibold text-[#253D9A]/70">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <p className="text-[15.5px] leading-relaxed text-[#4b4f66]">
                      {area.heading && <strong className="font-semibold text-[#171a2b]">{area.heading}. </strong>}
                      {area.text}
                    </p>
                  </li>
                ))}
              </ol>
            </Section>
          )}

          {event.speakers.length > 0 && (
            <Section title="Speakers & participants">
              <ul className="grid gap-3 sm:grid-cols-2">
                {event.speakers.map((speaker, i) => {
                  const { name, detail } = splitSpeaker(speaker.name);
                  return (
                    <li key={i} className="flex gap-4 rounded-lg border border-[#e6e8f0] bg-white p-4">
                      <span aria-hidden="true" className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#253D9A]/8 font-[family-name:var(--font-heading)] text-[15px] text-[#253D9A]">
                        {initials(speaker.name) || (
                          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                            <circle cx="9" cy="8" r="3.2" />
                            <path d="M3 19c.6-3.2 3-5 6-5s5.4 1.8 6 5M16 5.2a3 3 0 0 1 0 5.6M18 14.4c1.6.7 2.6 2.3 3 4.6" />
                          </svg>
                        )}
                      </span>
                      <div className="min-w-0">
                        <p className={label}>{speaker.role || "Speaker"}</p>
                        <p className="mt-1 text-[15.5px] font-semibold leading-snug text-[#171a2b]">{name}</p>
                        {detail && <p className="mt-0.5 text-[13.5px] leading-snug text-[#5b5f74]">{detail}</p>}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </Section>
          )}

          {event.gallery.length > 0 && (
            <Section title="Photos">
              <EventGallery photos={event.gallery} title={event.title} />
            </Section>
          )}
        </div>

        <aside>
          <div className="rounded-lg border border-[#e6e8f0] bg-white p-6 lg:sticky lg:top-24">
            <h2 className="font-[family-name:var(--font-mono)] text-[11.5px] font-semibold uppercase tracking-[0.14em] text-[#253D9A]">Event details</h2>
            <dl className="mt-5">
              <Fact name="Date">{event.dateLabel}</Fact>
              {event.timeLabel && <Fact name="Time">{event.timeLabel}</Fact>}
              {event.location && (
                <Fact name="Venue">
                  {event.location}
                  {event.mode !== "online" && (
                    <a href={directionsUrl(event.location)} target="_blank" rel="noopener noreferrer" className="mt-1.5 block text-[13px] font-semibold text-[#253D9A] hover:underline">
                      Directions <span aria-hidden="true">&#8599;</span>
                      <span className="sr-only">(Google Maps, opens in a new tab)</span>
                    </a>
                  )}
                </Fact>
              )}
              {event.mode && <Fact name="Format">{MODE_LABEL[event.mode]}</Fact>}
              {event.collaborators.length > 0 && (
                <Fact name="In collaboration with">
                  <ul className="space-y-1">
                    {event.collaborators.map((c) => <li key={c}>{c}</li>)}
                  </ul>
                </Fact>
              )}
            </dl>
            {register && (
              <a href={register} target="_blank" rel="noopener noreferrer" className="mt-5 flex w-full items-center justify-center gap-1 rounded-md bg-[#253D9A] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1B2C70]">
                Register <span aria-hidden="true">&#8599;</span>
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            )}
            <Link href="/events" className="mt-5 inline-block text-[14px] font-semibold text-[#253D9A] hover:underline">&larr; All events &amp; campaigns</Link>
          </div>
        </aside>
      </div>

      {more.length > 0 && (
        <section className="border-t border-[#e3e6f0] bg-white">
          <div className="mx-auto max-w-6xl px-6 py-14">
            <div className="flex items-end justify-between gap-4">
              <h2 className="font-[family-name:var(--font-heading)] text-2xl text-[#171a2b]">More events &amp; campaigns</h2>
              <Link href="/events" className="shrink-0 text-[14px] font-semibold text-[#253D9A] hover:underline">View all &rarr;</Link>
            </div>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {more.map((e) => <EventCard key={e.slug} event={e} />)}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
