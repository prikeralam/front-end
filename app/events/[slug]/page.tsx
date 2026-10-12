import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LoadError } from "../../_ui/ApiMessage";
import { getEventBySlug } from "../../_lib/api/engage";
import { load } from "../../_lib/api/load";
import { PageHeader } from "../../_ui/kit";
import MediaSlot from "../../_ui/MediaSlot";
import type { Metadata } from "next";
import { eventJsonLd, pageMetadata } from "../../_lib/seo";
import JsonLd from "../../_ui/JsonLd";
import EventGallery from "../_ui/EventGallery";
import { ModeTag, TimingTag } from "../_ui/EventTags";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const result = await load("this event", () => getEventBySlug(slug));
  const event = result.ok ? result.data : null;
  if (!event) return { title: "Events & Campaigns" };
  return pageMetadata({
    title: event.title,
    description: event.summary || `${event.kind === "campaign" ? "A campaign" : "An event"} by the Policy and Research Initiative, ${event.dateLabel}.`,
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

  return (
    <>
      <JsonLd data={eventJsonLd(event)} />
      <PageHeader kicker={event.kind === "campaign" ? "Campaign" : "Event"} title={event.title} intro={event.summary || undefined} />

      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-14">
        {/* The fact sheet comes first in the markup, so phones see when and where before the programme. */}
        <aside className="lg:order-2">
          <div className="rounded-lg border border-[#e6e8f0] bg-white p-6 lg:sticky lg:top-24">
            <div className="flex flex-wrap items-center gap-2">
              <TimingTag timing={event.timing} />
              <ModeTag mode={event.mode} />
            </div>
            <dl className="mt-5">
              <Fact name="Date">{event.dateLabel}</Fact>
              {event.timeLabel && <Fact name="Time">{event.timeLabel}</Fact>}
              {event.location && <Fact name="Venue">{event.location}</Fact>}
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
          </div>
        </aside>

        <div className="min-w-0 lg:order-1">
          {event.image && <MediaSlot need={event.image} className="mb-12" />}

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
              <dl className="divide-y divide-[#eceef5] rounded-lg border border-[#e6e8f0] bg-white">
                {event.speakers.map((s, i) => (
                  <div key={i} className="grid gap-1 px-5 py-4 sm:grid-cols-[13rem_minmax(0,1fr)] sm:gap-6">
                    <dt className={`${label} sm:pt-1`}>{s.role || "Speaker"}</dt>
                    <dd className="text-[15.5px] leading-snug text-[#171a2b]">{s.name}</dd>
                  </div>
                ))}
              </dl>
            </Section>
          )}

          {event.body && (
            <Section title="Details">
              <div className="whitespace-pre-line text-[15.5px] leading-relaxed text-[#4b4f66]">{event.body}</div>
            </Section>
          )}

          {event.gallery.length > 0 && (
            <Section title="Photos">
              <EventGallery photos={event.gallery} title={event.title} />
            </Section>
          )}

          <Link href="/events" className="mt-14 inline-block text-[14px] font-semibold text-[#253D9A] hover:underline">&larr; All events &amp; campaigns</Link>
        </div>
      </div>
    </>
  );
}
